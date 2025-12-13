export const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('epochfolio_token');
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, defaultOptions);

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/zip') || contentType.includes('application/octet-stream'))) {
      data = await response.blob();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const authAPI = {
  signup: (userData: { email: string; phone?: string; password: string }) =>
    apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiCall('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  verifyOTP: (data: { email: string; otp: string; action: string }) =>
    apiCall('/verify_otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    apiCall('/forgot_password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { email: string; new_password: string }) =>
    apiCall('/reset_password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Success route after email verification
  verificationSuccess: (token: string) =>
    apiCall(`/success?token=${token}`, {
      method: 'GET',
    }),

  // Logout and clear session
  logout: () =>
    apiCall('/clear_session_data', {
      method: 'POST',
    }),
};

export const userAPI = {
  // Update user profile - fallback to signup/login flow if PUT not available
  updateProfile: async (userData: {
    email: string;
    name: string;
    hr_id: string;
    position: string;
    department: string;
  }) => {
    return await apiCall('/update_profile', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get user profile - fallback to current user info from token
  getProfile: async (userId?: string) => {
    try {
      if (userId) {
        return await apiCall(`/user/${userId}`);
      } else {
        // Fallback to get current user info
        return await apiCall('/profile');
      }
    } catch (error) {
      // If no profile endpoint, return stored user data
      const storedUser = localStorage.getItem('epochfolio_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      throw error;
    }
  },

  // Clear all session data
  clearSession: () => {
    localStorage.removeItem('epochfolio_user');
    localStorage.removeItem('epochfolio_token');
    localStorage.removeItem('epochfolio_job');
    localStorage.removeItem('epochfolio_candidates');
  },
};

export const jobAPI = {
  createJob: (jobData: {
    user_id?: string;
    job_title: string;
    job_description: string;
    department: string;
    skills: string[];
    experience_required: string;
    location?: string;
    job_type?: string;
  }) =>
    apiCall('/job_requirements', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  getJobs: (userId?: string) => {
    if (userId) {
      return apiCall(`/jobs/${userId}`);
    } else {
      return apiCall('/jobs');
    }
  },

  updateJob: (jobId: string, jobData: any) =>
    apiCall(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (jobId: string) =>
    apiCall(`/jobs/${jobId}`, {
      method: 'DELETE',
    }),

  // Get dashboard data
  getDashboardData: () =>
    apiCall('/dashboard_data'),

  // Get job statistics
  getJobStats: (jobId: string) =>
    apiCall(`/job_stats/${jobId}`),
};

export const resumeAPI = {
  uploadResumes: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return apiCall('/upload_resumes', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },

  screenResumes: (data: { job_id: string; resume_ids: string[] }) =>
    apiCall('/screen_resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getResumeContent: (resumeId: string) =>
    apiCall(`/resume/${resumeId}`),

  downloadResume: (data: { resumeId: string; filepath: string }) =>
    apiCall(`/download_resume`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Download all filtered resumes
  downloadFilteredResumes: (data: {
    job_id: string;
    filtered_resume_ids: string[];
    filters?: any;
  }) =>
    apiCall('/download_all_filtered_resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Download all resumes as zip
  downloadAllResumes: (jobId: string) =>
    apiCall(`/download_all_resumes/${jobId}`),

  // Get resume statistics
  getResumeStats: (jobId: string) =>
    apiCall(`/resume_stats/${jobId}`),
};

export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: () =>
    apiCall('/dashboard_data'),

  // Get recent activities
  getRecentActivities: () =>
    apiCall('/dashboard_data'),

  // Get hiring statistics
  getHiringStats: (timeframe?: string) => {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return apiCall(`/dashboard_data${params}`);
  },

  // Get department statistics
  getDepartmentStats: () =>
    apiCall('/dashboard_data'),

  // Get user's job history
  getJobHistory: () =>
    apiCall('/dashboard_data'),
};

//export { API_BASE_URL };