import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Download,
  Trash,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  uploadDocument, 
  getUserDocuments, 
  deleteDocument, 
  downloadDocument,
  Document 
} from '../lib/documents';

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  // const { addNotification } = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load user documents on component mount
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await getUserDocuments(user!.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents. Please try again.');
      console.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    if (!user) {
      console.log({
        title: 'Authentication Required',
        message: 'Please log in to upload documents',
        type: 'error'
      });
      return;
    }

    setUploading(true);
    const fileArray = Array.from(files);

    try {
      // Process each file
      for (const file of fileArray) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          console.log({
            title: 'File Too Large',
            message: `File ${file.name} is too large. Maximum size is 10MB.`,
            type: 'error'
          });
          continue;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
          console.log({
            title: 'Unsupported File Type',
            message: `File type not supported for ${file.name}. Please upload PDF, DOC, DOCX, or TXT files.`,
            type: 'error'
          });
          continue;
        }

        // Determine document type based on filename
        let docType: Document['type'] = 'other';
        const fileName = file.name.toLowerCase();
        if (fileName.includes('statement') || fileName.includes('sop') || fileName.includes('purpose')) {
          docType = 'sop';
        } else if (fileName.includes('cv') || fileName.includes('resume')) {
          docType = 'cv';
        } else if (fileName.includes('transcript') || fileName.includes('grade')) {
          docType = 'transcript';
        } else if (fileName.includes('recommendation') || fileName.includes('reference')) {
          docType = 'recommendation';
        }

        try {
          // Upload document
          const newDoc = await uploadDocument(user.id, file, docType);
          setDocuments(prev => [newDoc, ...prev]);
          console.log({
            title: 'Upload Successful',
            message: `${file.name} uploaded successfully! AI review in progress...`,
            type: 'success'
          });
        } catch (uploadError: any) {
          console.error('Upload failed for', file.name, uploadError);
          console.log({
            title: 'Upload Failed',
            message: `Failed to upload ${file.name}: ${uploadError?.message || 'Unknown error'}`,
            type: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Upload process failed:', err);
      console.log({
        title: 'Upload Failed',
        message: 'Upload failed. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, [user]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDelete = async (documentId: string, filename: string) => {
    if (!user) return;

    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDocument(user.id, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      console.log({
        title: 'Success',
        message: 'Document deleted successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Delete failed:', err);
      console.log({
        title: 'Error',
        message: 'Failed to delete document',
        type: 'error'
      });
    }
  };

  const handleDownload = async (documentUrl: string, filename: string) => {
    try {
      await downloadDocument(documentUrl, filename);
      console.log('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      console.error('Failed to download document');
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'sop': return 'Statement of Purpose';
      case 'cv': return 'CV/Resume';
      case 'transcript': return 'Transcript';
      case 'recommendation': return 'Recommendation';
      default: return 'Document';
    }
  };

  const getDocumentTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'sop': return 'bg-purple-100 text-purple-700';
      case 'cv': return 'bg-blue-100 text-blue-700';
      case 'transcript': return 'bg-green-100 text-green-700';
      case 'recommendation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : uploading 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
      >
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
          uploading ? 'bg-gray-100' : 'bg-indigo-50 group-hover:bg-indigo-100'
        }`}>
          {uploading ? (
            <RefreshCw className="h-8 w-8 text-gray-500 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-indigo-600" />
          )}
        </div>
        
        <h3 className="font-heading font-medium text-gray-800 mb-2">
          {uploading ? 'Uploading Documents...' : 'Upload Documents for AI Review'}
        </h3>
        
        <p className="text-gray-500 mb-4">
          {uploading 
            ? 'Please wait while your documents are uploaded and processed'
            : 'Drop your files here or click to browse • PDF, DOC, DOCX, TXT up to 10MB'
          }
        </p>
        
        {!uploading && (
          <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
            <Upload className="h-5 w-5" />
            Browse Files
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileInput}
              multiple
              accept=".pdf,.doc,.docx,.txt"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadDocuments}
              className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No documents uploaded yet</h3>
            <p className="text-gray-400">Upload your first document to get AI-powered feedback</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    doc.status === 'reviewed' ? 'bg-green-50' : 
                    doc.status === 'pending' ? 'bg-amber-50' :
                    doc.status === 'uploading' ? 'bg-blue-50' :
                    'bg-red-50'
                  }`}>
                    <FileText className={`h-5 w-5 ${
                      doc.status === 'reviewed' ? 'text-green-500' : 
                      doc.status === 'pending' ? 'text-amber-500' :
                      doc.status === 'uploading' ? 'text-blue-500' :
                      'text-red-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-heading font-medium text-gray-800 truncate">{doc.filename}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.type)}`}>
                        {getDocumentTypeLabel(doc.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {doc.status === 'reviewed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">AI Review Complete</span>
                        </>
                      ) : doc.status === 'pending' ? (
                        <>
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600 font-medium">AI Review in Progress</span>
                        </>
                      ) : doc.status === 'uploading' ? (
                        <>
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          <span className="text-blue-600 font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 font-medium">Review Failed</span>
                        </>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {doc.status === 'reviewed' && (
                    <button 
                      onClick={() => {/* View feedback modal */}}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                    >
                      View Feedback
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDownload(doc.url, doc.filename)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {doc.feedback && doc.status === 'reviewed' && (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-2">AI Feedback:</h4>
                  <div className="whitespace-pre-wrap">{doc.feedback}</div>
                </div>
              )}
              
              {doc.status === 'error' && doc.feedback && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-700 mb-2">Error:</h4>
                  <div>{doc.feedback}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips for Better AI Reviews</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Name your files clearly (e.g., "Statement_of_Purpose_MIT.pdf")</li>
          <li>• Ensure documents are clearly readable (good scan quality)</li>
          <li>• Upload final drafts for the most useful feedback</li>
          <li>• Review feedback carefully and implement suggestions</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;
