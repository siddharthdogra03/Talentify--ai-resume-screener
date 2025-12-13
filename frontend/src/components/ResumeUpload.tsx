import React, { useState, useRef } from 'react';
import { FileText, ArrowLeft, ArrowRight, Upload, X, File } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

const ResumeUpload: React.FC = () => {
  const {
    goToPage,
    uploadedFiles,
    setUploadedFiles,
    setUploadedResumeIds,
    setLoading,
    setLoadingMessage,
    user
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (uploadedFiles.length + newFiles.length >= 1000) {
        alert('Maximum 1000 files allowed');
        break;
      }

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        newFiles.push(file);
      } else {
        alert(`Unsupported file type: ${file.name}. Only PDF, DOC, DOCX are allowed.`);
      }
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one resume.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Uploading and processing resumes...');

    const formData = new FormData();
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });

    if (user?.user_id || user?.id) {
      formData.append('user_id', (user.user_id || user.id) as string);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload_resumes`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedResumeIds(data.resume_ids);
        alert('Resumes uploaded and processed successfully!');
        goToPage('topN');
      } else {
        alert(`Error uploading resumes: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading resumes:', error);
      alert('An error occurred during resume upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-2xl w-full fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Talentify</h1>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '60%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`upload-area ${dragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={48} className="mx-auto mb-4 text-indigo-500" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-gray-600">Supports PDF, DOC, DOCX files (Max 1000 files)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="flex items-center gap-3">
                    <File size={20} className="text-indigo-500" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="btn-danger px-3 py-1 text-sm flex items-center gap-1"
                  >
                    <X size={16} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('jobDescription')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              disabled={uploadedFiles.length === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;