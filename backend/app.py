from flask import Flask, request, jsonify, send_from_directory, make_response, render_template
from flask_cors import CORS
import os
import json
import uuid
import zipfile
from io import BytesIO
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib
import secrets
from email.message import EmailMessage
from dotenv import load_dotenv
from supabase import create_client, Client
from mimetypes import guess_type
from datetime import datetime
from werkzeug.utils import secure_filename

# Load environment variables from .env file
load_dotenv()

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

from text_extractor import extract_text_from_file
from text_processor import preprocess_text, \
    extract_skills_from_text, categorize_resume
from resume_matcher import calculate_match_score_enhanced

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Set Secret Key for Session Security
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))

# Configure Upload Folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# === Database Integration ===
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
HF_API_KEY = os.environ.get("HF_API_KEY")

if not HF_API_KEY:
    print("WARNING: HF_API_KEY not set. Resume matching may fail.")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL and SUPABASE_KEY environment variables are not set. Supabase features will not work.")
    # Set dummy values for local testing if you don't have Supabase set up
    SUPABASE_URL = "http://localhost:8000"
    SUPABASE_KEY = "dummy_key"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Could not connect to Supabase: {e}. Supabase features will be disabled.")
    supabase = None

def generate_id():
    return str(uuid.uuid4())

def generate_otp():
    # Cryptographically secure OTP generation
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def send_otp_email(to_email, otp):
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    sender_email = os.environ.get("SMTP_USER")
    sender_pass = os.environ.get("SMTP_PASS")

    if not sender_email or not sender_pass:
        print("SMTP_USER or SMTP_PASS environment variables not set. Email sending skipped.")
        return

    # Create message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🔐 Your OTP for Resume Screening Verification"
    msg["From"] = sender_email
    msg["To"] = to_email

    text = f"""\
Hi,

Your OTP for Resume Screening verification is: {otp}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

Thanks,
Resume Screening Team
"""

    html = f"""\
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2e86de;">🔐 Resume Screening OTP Verification</h2>
      <p>Hi there,</p>
      <p>Your One-Time Password (OTP) for verifying your email address is:</p>
      <h1 style="color: #27ae60; letter-spacing: 4px;">{otp}</h1>
      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 0.9em; color: #888888;">
        If you did not request this email, you can safely ignore it.<br>
        Need help? Contact us at <a href="mailto:nitin.renusharmafoundation@gmail.com">nitin.renusharmafoundation@gmail.com</a>
      </p>
      <p style="font-size: 0.9em; color: #888888;">Thanks,<br>The Resume Screening Team</p>
    </div>
  </body>
</html>
"""

    #attach plain and html part
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_pass)
            server.send_message(msg)
        print(f"✅ OTP sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send OTP email to {to_email}: {e}")

#===API endpoints===

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if not supabase:
        return jsonify({"message": "Database not connected. Signup is unavailable."}), 500

    try:
        # Check if user already exists in Supabase 'users' table
        response = supabase.table('users').select('id', 'is_verified').eq('email', email).execute()
        existing_user = response.data[0] if response.data else None

        if existing_user:
            if existing_user.get('is_verified'):
                return jsonify({"message": "User with this email already exists and is verified"}), 409
            else:
                # User exists but not verified, resend OTP
                otp = generate_otp()
                # Update OTP in Supabase
                supabase.table('users').update({'otp': otp}).eq('email', email).execute()
                send_otp_email(email, otp)
                return jsonify(
                    {"message": "User exists but not verified. OTP resent for email verification.", "user_id": existing_user['id']}), 200

        hashed_password = generate_password_hash(password)
        otp = generate_otp()

        # Insert new user into Supabase 'users' table
        insert_data = {
            'email': email,
            'phone': phone,
            'password_hash': hashed_password,
            'otp': otp,
            'is_verified': False
        }

        response = supabase.table('users').insert(insert_data).execute()

        if response.data:
            user_id = response.data[0]['id']
            print(f"User {email} registered with ID {user_id} in Supabase.")
            send_otp_email(email, otp)
            create_notification(user_id, "Welcome to Talentify!", "Get started by setting up a new job requirement.")
            return jsonify({"message": "User registered successfully. OTP sent for email verification.", "user_id": user_id}), 201
        else:
            return jsonify({"message": "Failed to register user."}), 500

    except Exception as e:
        import traceback
        print(f"Supabase signup error: {e}")
        traceback.print_exc()
        return jsonify({"message": f"An error occurred during signup: {str(e)}"}), 500



@app.route('/api/update_profile', methods=['POST'])
def update_profile():
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    data = request.json
    email = data.get('email')
    full_name = data.get('name') # Frontend sends 'name'
    hr_id = data.get('hr_id')
    position = data.get('position')
    department = data.get('department')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    try:
        # Update user in Supabase
        response = supabase.table('users').update({
            'full_name': full_name,
            'hr_id': hr_id,
            'position': position,
            'department': department
        }).eq('email', email).execute()
        
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"message": f"Error updating profile: {str(e)}"}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if not supabase:
        return jsonify({"message": "Database not connected. Login is unavailable."}), 500

    try:
        response = supabase.table('users').select('*').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"message": "Invalid email or password"}), 401

        if not user.get('is_verified'):
            return jsonify({"message": "Please verify your email via OTP first."}), 403

        # Clear OTP from Supabase after successful login (if it was still there)
        supabase.table('users').update({'otp': None}).eq('email', email).execute()

        role_set = user.get('role') is not None
        return jsonify({
            "message": "Login successful",
            "user_id": user['id'],
            "role_set": role_set,
            "email": user['email'],
            "name": user.get('full_name', user['email'].split('@')[0]), # Pass full_name if available
            "hr_id": user.get('hr_id'),
            "role": user.get('role'),
            "department": user.get('department'),
            "position": user.get('position')
        }), 200

    except Exception as e:
        print(f"Supabase login error: {e}")
        return jsonify({"message": f"An error occurred during login: {str(e)}"}), 500




@app.route('/api/profile', methods=['GET'])
def get_current_profile():
    return jsonify({"message": "Profile endpoint"}), 200

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        user = response.data[0] if response.data else None
        if user:
            return jsonify({
                "id": user['id'],
                "email": user['email'],
                "name": user.get('full_name', user['email'].split('@')[0]),
                "hr_id": user.get('hr_id'),
                "role": user.get('role'),
                "department": user.get('department'),
                "position": user.get('position')
            }), 200
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return jsonify({"message": "Error fetching profile"}), 500

@app.route('/api/jobs', methods=['GET'])
def get_all_jobs():
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500
    try:
        response = supabase.table('jobs').select('*').execute()
        return jsonify(response.data if response.data else []), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/jobs/<user_id>', methods=['GET'])
def get_user_jobs(user_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500
    try:
        response = supabase.table('jobs').select('*').eq('user_id', user_id).execute()
        return jsonify(response.data if response.data else []), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500




@app.route('/api/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    action = data.get('action', 'signup')

    if not supabase:
        return jsonify({"message": "Database not connected. OTP verification is unavailable."}), 500

    try:
        response = supabase.table('users').select('id', 'otp', 'is_verified', 'role', 'full_name', 'hr_id', 'department', 'position').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if not user or user['otp'] != otp:
            return jsonify({"message": "Invalid OTP"}), 401

        # Clear OTP and update verification status in Supabase
        update_data = {'otp': None}
        if action == 'signup':
            update_data['is_verified'] = True

        supabase.table('users').update(update_data).eq('email', email).execute()

        if action == 'signup':
            role_set = user.get('role') is not None
            return jsonify({
                "message": "Email verified and login successful",
                "user_id": user['id'],
                "role_set": role_set,
                "email": email,
                "name": user.get('full_name', email.split('@')[0]),
                "hr_id": user.get('hr_id'),
                "role": user.get('role'),
                "department": user.get('department'),
                "position": user.get('position')
            }), 200
        elif action == 'reset_password':
            return jsonify({"message": "OTP verified. You can now reset your password.", "user_id": user['id']}), 200
        else:
            return jsonify({"message": "Invalid action for OTP verification"}), 400

    except Exception as e:
        print(f"Supabase OTP verification error: {e}")
        return jsonify({"message": f"An error occurred during OTP verification: {str(e)}"}), 500


@app.route('/api/forgot_password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    if not supabase:
        return jsonify({"message": "Database not connected. Forgot password is unavailable."}), 500

    try:
        response = supabase.table('users').select('id').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if not user:
            return jsonify({"message": "User not found"}), 404

        otp = generate_otp()
        # Store OTP in Supabase for the user
        supabase.table('users').update({'otp': otp}).eq('email', email).execute()

        send_otp_email(email, otp)
        print(f"Demo OTP for password reset for {email}: {otp}")
        return jsonify({"message": "OTP sent to your email for password reset"}), 200

    except Exception as e:
        print(f"Supabase forgot password error: {e}")
        return jsonify({"message": f"An error occurred during forgot password: {str(e)}"}), 500


@app.route('/api/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')

    if not supabase:
        return jsonify({"message": "Database not connected. Password reset is unavailable."}), 500

    try:
        response = supabase.table('users').select('id').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if not user:
            return jsonify({"message": "User not found"}), 404

        hashed_new_password = generate_password_hash(new_password)
        # Update password_hash in Supabase
        supabase.table('users').update({'password_hash': hashed_new_password, 'otp': None}).eq('email', email).execute()

        return jsonify({"message": "Password reset successfully"}), 200

    except Exception as e:
        print(f"Supabase reset password error: {e}")
        return jsonify({"message": f"An error occurred during password reset: {str(e)}"}), 500


@app.route('/api/select_role', methods=['POST', 'PUT'])
def select_role():
    data = request.json
    email = data.get('email')
    role = data.get('role')
    full_name = data.get('full_name')
    hr_id = data.get('hr_id')
    position = data.get('position')
    department = data.get('department')

    if not email:
        return jsonify({"message": "User ID is required"}), 400

    if not supabase:
        return jsonify({"message": "Database not connected. Role selection is unavailable."}), 500

    try:
        # Update user's details in Supabase 'users' table
        update_data = {
            'role': role,
            'hr_id': hr_id,
            'full_name': full_name,
            'position': position,
            'department': department
        }
        response = supabase.table('users').update(update_data).eq('email', email).execute()

        if response.data:
            return jsonify({"message": f"Role '{role}' and HR info updated for {email}"}), 200
        else:
            return jsonify({"message": "User not found or failed to update"}), 404

    except Exception as e:
        print(f"Supabase select role error: {e}")
        return jsonify({"message": f"An error occurred during role selection: {str(e)}"}), 500


@app.route('/api/job_requirements', methods=['POST'])
def save_job_requirements():
    try:
        data = request.json
        print(f"Received job requirements data: {data}") # Debug logging

        user_id = data.get('user_id')
        job_title = data.get('job_title')
        job_description = data.get('job_description')
        department = data.get('department')
        skills = data.get('skills')
        experience_required = data.get('experience_required')
        location = data.get('location')
        job_type = data.get('job_type')

        if not user_id or not job_description or not skills:
            print("Missing required fields")
            return jsonify({"message": "User ID, job description, and skills are required"}), 400

        if not supabase:
             return jsonify({"message": "Database not connected."}), 500

        # Insert into Supabase 'jobs' table
        insert_data = {
            'user_id': user_id,
            'title': job_title,
            'description': job_description,
            'department': department,
            'skills': skills,
            'experience_required': experience_required,
            'location': location,
            'job_type': job_type
        }
        
        response = supabase.table('jobs').insert(insert_data).execute()
        
        if response.data:
            job_id = response.data[0]['id']
            print(f"Job requirements saved to DB with ID: {job_id}")
            
            try:
                create_notification(user_id, "Job Requirement Saved", f"Job requirements for '{job_title or department}' have been saved.")
            except Exception as e:
                print(f"Error creating notification: {e}")

            return jsonify({"message": "Job requirements saved", "job_id": job_id}), 201
        else:
             return jsonify({"message": "Failed to save job requirements"}), 500

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# notifications_db replaced by Supabase 'notifications' table

def create_notification(user_id, title, message, type='info'):
    if not supabase:
        print("Supabase not connected. Skipping notification.")
        return

    try:
        notification = {
            'user_id': user_id,
            'title': title,
            'message': message,
            'type': type,
            'read': False
            # 'created_at' is handled by default in DB
        }
        supabase.table('notifications').insert(notification).execute()
        print(f"Notification created for user {user_id}: {title}")
    except Exception as e:
        print(f"Error creating notification in DB: {e}")

@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        # Fetch notifications for user, sorted by newest first
        response = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        user_notifications = response.data if response.data else []
        
        # Map DB fields to frontend expected format if needed (e.g. created_at -> timestamp)
        formatted_notifications = []
        for n in user_notifications:
            formatted_notifications.append({
                'id': n['id'],
                'title': n['title'],
                'message': n['message'],
                'type': n['type'],
                'read': n['read'],
                'timestamp': n['created_at']
            })
            
        return jsonify(formatted_notifications), 200
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({"message": f"Error fetching notifications: {str(e)}"}), 500

@app.route('/api/notifications/<user_id>/<notification_id>/read', methods=['POST'])
def mark_notification_read(user_id, notification_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        supabase.table('notifications').update({'read': True}).eq('id', notification_id).eq('user_id', user_id).execute()
        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({"message": f"Error updating notification: {str(e)}"}), 500

@app.route('/api/notifications/<user_id>/read_all', methods=['POST'])
def mark_all_notifications_read(user_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        supabase.table('notifications').update({'read': True}).eq('user_id', user_id).execute()
        return jsonify({"message": "All notifications marked as read"}), 200
    except Exception as e:
        print(f"Error marking all notifications as read: {e}")
        return jsonify({"message": f"Error updating notifications: {str(e)}"}), 500

@app.route('/api/upload_resumes', methods=['POST'])
def upload_resumes():
    try:
        if 'files' not in request.files:
            return jsonify({"message": "No file part"}), 400

        files = request.files.getlist('files')
        user_id = request.form.get('user_id') # Expect user_id in form data
        resume_ids = []
        errors = []
        
        print(f"Received {len(files)} files for upload from user {user_id}")
        
        if not supabase:
             return jsonify({"message": "Database not connected."}), 500

        for file in files:
            if file.filename == '':
                continue

            if file and allowed_file(file.filename):
                try:
                    filename = secure_filename(file.filename)
                    # Use UUID to prevent overwrites, but keep original extension
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(filepath)
                    print(f"Saved file: {filepath}")

                    # Extract text
                    raw_text = extract_text_from_file(filepath)
                    if not raw_text:
                        error_msg = f"Failed to extract text from {filename}"
                        print(error_msg)
                        errors.append(error_msg)
                        continue
                        
                    # Preprocess text
                    processed_text = preprocess_text(raw_text)
                    
                    # Extract skills
                    extracted_skills = extract_skills_from_text(processed_text)
                    
                    # Categorize resume
                    categorized_field = categorize_resume(processed_text)

                    # Insert into Supabase 'resumes' table
                    insert_data = {
                        'user_id': user_id,
                        'filename': filename,
                        'filepath': unique_filename, # Store unique filename
                        'raw_text': raw_text,
                        'processed_text': processed_text,
                        'extracted_skills': extracted_skills,
                        'categorized_field': categorized_field
                    }
                    
                    response = supabase.table('resumes').insert(insert_data).execute()

                    if response.data:
                        resume_id = response.data[0]['id']
                        resume_ids.append(resume_id)
                        print(f"Processed resume {resume_id}: {filename}")
                    else:
                        error_msg = f"Failed to save resume metadata for {filename}"
                        print(error_msg)
                        errors.append(error_msg)

                except Exception as e:
                    error_msg = f"Error processing file {file.filename}: {str(e)}"
                    print(error_msg)
                    import traceback
                    traceback.print_exc()
                    errors.append(error_msg)
                    continue
            else:
                errors.append(f"File type not allowed: {file.filename}")

        if not resume_ids:
            msg = "No valid resumes were processed."
            if errors:
                msg += f" Errors: {'; '.join(errors)}"
            return jsonify({"message": msg}), 400

        return jsonify({"message": "Resumes uploaded successfully", "resume_ids": resume_ids}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"An error occurred during upload: {str(e)}"}), 500


@app.route('/api/screen_resumes', methods=['POST'])
def screen_resumes():
    try:
        data = request.json
        print(f"Received screening request: {data}") # Debug logging
        
        job_id = data.get('job_id')
        resume_ids = data.get('resume_ids')

        if not job_id or not resume_ids:
            return jsonify({"message": "Job ID and Resume IDs are required"}), 400

        if not supabase:
             return jsonify({"message": "Database not connected."}), 500

        # Fetch job requirements from Supabase
        job_response = supabase.table('jobs').select('*').eq('id', job_id).execute()
        job_req = job_response.data[0] if job_response.data else None

        if not job_req:
            return jsonify({"message": "Job requirements not found."}), 404

        job_description_text = job_req['description']
        # Skills are stored as array in DB, no need to parse if already list, but check just in case
        required_skills = job_req['skills'] 
        required_department = job_req['department']
        experience_required = job_req['experience_required']

        results = []
        
        # Fetch resumes from Supabase
        # Supabase 'in' filter expects a tuple or list
        resumes_response = supabase.table('resumes').select('*').in_('id', resume_ids).execute()
        resumes_data = resumes_response.data if resumes_response.data else []

        for resume_data in resumes_data:
            resume_id = resume_data['id']
            resume_processed_text = resume_data['processed_text']
            resume_extracted_skills = resume_data['extracted_skills']
            resume_categorized_field = resume_data['categorized_field']

            try:
                # Call the enhanced match score function
                match_score, matched_skills = calculate_match_score_enhanced(
                    job_description_text,
                    required_skills,
                    experience_required,
                    resume_processed_text,
                    resume_extracted_skills,
                    HF_API_KEY
                )

                department_match_factor = 1.0
                if required_department and required_department.lower() in resume_processed_text.lower():
                    department_match_factor = 1.05

                final_score = int(match_score * department_match_factor)
                final_score = min(final_score, 100)
                
                # Insert into Supabase 'screening_results' table
                result_data = {
                    'job_id': job_id,
                    'resume_id': resume_id,
                    'match_score': final_score,
                    'matched_skills': matched_skills,
                    'department_match': str(department_match_factor > 1.0), # Store as string or boolean
                    'experience_level': experience_required,
                    'categorized_field': resume_categorized_field
                }
                
                # Check if result already exists to avoid duplicates (optional, but good practice)
                # For now, we'll just insert a new record or update if we had a unique constraint
                # Let's just insert for simplicity as per schema
                insert_res = supabase.table('screening_results').insert(result_data).execute()
                
                if insert_res.data:
                    # Construct result object for frontend
                    frontend_result = {
                        'job_id': job_id,
                        'resume_id': resume_id,
                        'filename': resume_data['filename'],
                        'filepath': resume_data['filepath'],
                        'raw_text': resume_data['raw_text'],
                        'match_score': final_score,
                        'matched_skills': matched_skills,
                        'department': required_department,
                        'experience_level': experience_required,
                        'categorized_field': resume_categorized_field
                    }
                    results.append(frontend_result)

            except Exception as e:
                print(f"Error screening resume {resume_id}: {e}")
                import traceback
                traceback.print_exc()
                # Continue with other resumes even if one fails
                continue
        
        # Notify user
        if job_req.get('user_id'):
            try:
                create_notification(job_req['user_id'], "Screening Completed", f"Screened {len(results)} resumes for your job.")
            except Exception as e:
                print(f"Notification error: {e}")

        return jsonify({"message": "Screening complete", "results": results}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"An error occurred during screening: {str(e)}"}), 500

@app.route('/api/dashboard_data', methods=['GET'])
def get_dashboard_data():
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        # Fetch all screening results
        # In a real app, you'd filter by user_id or job_id
        response = supabase.table('screening_results').select('*, resumes(filename, categorized_field)').execute()
        results = response.data if response.data else []

        sort_by = request.args.get('sort_by', 'score')
        if sort_by == 'score':
            results.sort(key=lambda x: x['match_score'], reverse=True)
        elif sort_by == 'name':
            results.sort(key=lambda x: x['resumes']['filename'] if x.get('resumes') else '')

        formatted_results = []
        for res in results:
            resume_info = res.get('resumes', {})
            formatted_results.append({
                'id': res['resume_id'],
                'name': resume_info.get('filename', 'Unknown').split('.')[0] if resume_info else 'Unknown',
                'matchScore': res['match_score'],
                'matchedSkills': res['matched_skills'],
                'department': res.get('department_match', 'N/A'), # Note: Schema has department_match as boolean/text, check logic
                'category': res.get('categorized_field') or resume_info.get('categorized_field', 'Uncategorized'),
                'experienceLevel': res.get('experience_level', 'Not Specified'),
                'shortlisted': False
            })

        return jsonify(formatted_results), 200
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({"message": f"Error fetching data: {str(e)}"}), 500

@app.route('/api/resume/<resume_id>', methods=['GET'])
def get_resume_raw_text(resume_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500
    
    try:
        response = supabase.table('resumes').select('raw_text').eq('id', resume_id).execute()
        if response.data:
            return jsonify({"content": response.data[0]['raw_text']}), 200
        return jsonify({"message": "Resume not found"}), 404
    except Exception as e:
        print(f"Error fetching resume text: {e}")
        return jsonify({"message": "Error fetching resume"}), 500

@app.route('/api/download_all_resumes/<job_id>', methods=['GET'])
def download_all_resumes_for_job(job_id):
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        # Fetch resumes linked to this job via screening_results
        response = supabase.table('screening_results').select('resume_id, resumes(filename, filepath)').eq('job_id', job_id).execute()
        results = response.data if response.data else []

        if not results:
            return jsonify({"message": "No resumes found for this job ID."}), 404

        memory_file = BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for res in results:
                resume_info = res.get('resumes', {})
                unique_filename_on_server = resume_info.get('filepath')
                original_filename = resume_info.get('filename')

                if unique_filename_on_server and original_filename:
                    full_filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename_on_server)
                    if os.path.exists(full_filepath):
                        zf.write(full_filepath, arcname=original_filename)

        memory_file.seek(0)
        response = make_response(memory_file.getvalue())
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = f'attachment; filename=all_resumes_{job_id}.zip'
        return response
    except Exception as e:
        print(f"Error downloading all resumes: {e}")
        return jsonify({"message": f"Error downloading resumes: {str(e)}"}), 500

@app.route('/api/download_resume', methods=['POST'])
def download_resume_file():
    data = request.json
    unique_filename_on_server = data.get('filepath')
    # original_filename logic might need adjustment if not passed, but let's try to extract or just use unique
    # Ideally frontend passes original name too, or we fetch it. 
    # Current frontend passes filepath from dashboard data.
    # Let's try to find original name from DB if possible, or just use what we have.
    
    if not unique_filename_on_server:
        return jsonify({"message": "Filepath is required"}), 400
        
    original_filename = unique_filename_on_server.split('_', 1)[-1] # Fallback extraction

    full_filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename_on_server)

    if os.path.exists(full_filepath) and os.path.abspath(os.path.dirname(full_filepath)) == os.path.abspath(
            app.config['UPLOAD_FOLDER']):
        mimetype, _ = guess_type(original_filename)
        return send_from_directory(app.config['UPLOAD_FOLDER'], unique_filename_on_server, as_attachment=True,download_name=original_filename, mimetype=mimetype or 'application/octet-stream')
    else:
        return jsonify({"message": "File not found on server or invalid path"}), 404

@app.route('/api/download_all_filtered_resumes', methods=['POST'])
def download_all_filtered_resumes():
    data = request.json
    filtered_resume_ids = data.get('filtered_resume_ids', [])

    if not filtered_resume_ids:
        return jsonify({"message": "No filtered resumes to download."}), 404
        
    if not supabase:
         return jsonify({"message": "Database not connected."}), 500

    try:
        # Fetch resumes details from DB
        response = supabase.table('resumes').select('filename, filepath').in_('id', filtered_resume_ids).execute()
        resumes_data = response.data if response.data else []

        memory_file = BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for resume in resumes_data:
                unique_filename_on_server = resume.get('filepath')
                original_filename = resume.get('filename')

                if unique_filename_on_server and original_filename:
                    full_filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename_on_server)
                    if os.path.exists(full_filepath):
                        # Security check: Ensure the file is within the UPLOAD_FOLDER
                        if os.path.abspath(os.path.dirname(full_filepath)) == os.path.abspath(
                                app.config['UPLOAD_FOLDER']):
                            zf.write(full_filepath, arcname=original_filename)
                        else:
                            print(f"Skipping file outside UPLOAD_FOLDER: {full_filepath}")
                    else:
                        print(f"File not found: {full_filepath}")

        memory_file.seek(0)
        response = make_response(memory_file.getvalue())
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = 'attachment; filename=filtered_resumes.zip'
        return response
    except Exception as e:
        print(f"Error downloading filtered resumes: {e}")
        return jsonify({"message": f"Error downloading resumes: {str(e)}"}), 500

@app.route('/api/clear_session_data', methods=['POST'])
def clear_session_data():
    # With persistent DB, we don't necessarily want to clear everything.
    # But for compatibility with frontend 'Start New Session' button, we can just return success.
    # Or we could delete the current job from DB if that's the intended behavior.
    # For now, let's just log it.
    print("Session clear requested. (No-op for persistent DB)")
    return jsonify({"message": "Session data cleared successfully"}), 200

# Catch-all route for email verification success (from previous context)
@app.route('/success')
def email_verified_success():
    return '✅ Email verified successfully. You can now return to your app and login.'

@app.route('/<path:path>')
def catch_all(path):
    return 'Page not found', 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

