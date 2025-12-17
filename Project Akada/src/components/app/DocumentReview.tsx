import { useState, useRef } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, Clock, Download,
  X, Eye, RotateCcw, Sparkles, FileCheck, ArrowLeft, Zap, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'analyzing' | 'completed' | 'error';
  analysis?: {
    score: number;
    issues: Array<{
      type: 'grammar' | 'structure' | 'content' | 'format';
      severity: 'low' | 'medium' | 'high';
      message: string;
      suggestion?: string;
    }>;
    strengths: string[];
    improvements: string[];
  };
}

const DocumentReview: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const documentTypes = [
    { id: 'sop', name: 'Statement of Purpose', description: 'Personal statement for university application' },
    { id: 'cv', name: 'CV/Resume', description: 'Curriculum vitae or resume' },
    { id: 'essay', name: 'Application Essay', description: 'Admission essay or personal essay' },
    { id: 'transcript', name: 'Academic Transcript', description: 'Official academic records' },
    { id: 'reference', name: 'Reference Letter', description: 'Recommendation letter' },
    { id: 'other', name: 'Other Document', description: 'Any other application document' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const document: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'analyzing'
      };

      setDocuments(prev => [...prev, document]);
      
      // Simulate AI analysis
      simulateAnalysis(document.id);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateAnalysis = (documentId: string) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            status: 'completed' as const,
            analysis: {
              score: Math.floor(Math.random() * 30) + 70, // 70-100
              issues: [
                {
                  type: 'grammar' as const,
                  severity: 'medium' as const,
                  message: 'Found 3 grammatical errors that could be corrected',
                  suggestion: 'Consider using Grammarly or similar tools for proofreading'
                },
                {
                  type: 'structure' as const,
                  severity: 'low' as const,
                  message: 'Some paragraphs could be better organized',
                  suggestion: 'Try using transition sentences between paragraphs'
                },
                {
                  type: 'content' as const,
                  severity: 'high' as const,
                  message: 'Missing specific examples to support your claims',
                  suggestion: 'Add concrete examples from your experience'
                }
              ],
              strengths: [
                'Clear and professional tone throughout the document',
                'Strong opening statement that captures attention',
                'Well-defined career goals and motivation',
                'Good use of specific technical terms'
              ],
              improvements: [
                'Add more quantifiable achievements',
                'Include specific examples of leadership experience',
                'Strengthen the conclusion with a call to action',
                'Ensure all claims are backed by evidence'
              ]
            }
          };
        }
        return doc;
      }));
      setIsAnalyzing(false);
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'analyzing':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-chart-1" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-chart-1 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    if (score >= 70) return 'text-chart-2 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-destructive bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <FileCheck className="h-8 w-8 text-white" />
            </div>
            AI Document Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Get instant AI-powered feedback on your application documents
          </p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
        >
          <Upload className="h-5 w-5" />
          Upload Document
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Area */}
      {documents.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-primary dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground font-heading mb-2">
              Upload Your Documents for AI Review
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get instant feedback on grammar, structure, content quality, and formatting for your application documents.
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center gap-3 mx-auto"
            >
              <Upload className="h-5 w-5" />
              Choose Files to Upload
            </button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Supports PDF, DOC, DOCX, TXT files up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Supported Document Types */}
      {documents.length === 0 && (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-bold text-foreground font-heading mb-4">
            Supported Document Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((type) => (
              <div key={type.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h4 className="font-semibold text-foreground mb-1">{type.name}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground font-heading">
                Your Documents ({documents.length})
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Add More
              </button>
            </div>
            
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className={`bg-card rounded-xl shadow-sm border border-border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedDocument?.id === doc.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm text-muted-foreground">
                          {doc.status === 'analyzing' ? 'Analyzing...' :
                           doc.status === 'completed' ? 'Review Complete' :
                           'Analysis Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {doc.analysis && (
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(doc.analysis.score)}`}>
                      {doc.analysis.score}/100
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Document Analysis Panel */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            {selectedDocument ? (
              <div>
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground font-heading">
                      Analysis Results
                    </h3>
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="text-muted-foreground hover:text-gray-600 dark:hover:text-muted-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDocument.name}</p>
                </div>

                {/* Analysis Content */}
                {selectedDocument.status === 'analyzing' ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      AI Analysis in Progress
                    </h4>
                    <p className="text-muted-foreground">
                      Our AI is reviewing your document for grammar, structure, and content quality...
                    </p>
                  </div>
                ) : selectedDocument.analysis ? (
                  <div className="p-6 space-y-6">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(selectedDocument.analysis.score)}`}>
                        <CheckCircle className="h-5 w-5" />
                        {selectedDocument.analysis.score}/100
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Overall Quality Score</p>
                    </div>

                    {/* Issues */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Issues Found</h4>
                      <div className="space-y-3">
                        {selectedDocument.analysis.issues.map((issue, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                issue.severity === 'high' ? 'bg-destructive' :
                                issue.severity === 'medium' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{issue.message}</p>
                                {issue.suggestion && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    💡 {issue.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Strengths</h4>
                      <div className="space-y-2">
                        {selectedDocument.analysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-foreground">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Suggested Improvements</h4>
                      <div className="space-y-2">
                        {selectedDocument.analysis.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-4 h-4 border-2 border-primary rounded-full mt-0.5 flex-shrink-0"></div>
                            <p className="text-sm text-foreground">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                        Download Report
                      </button>
                      <button className="flex-1 border border-input text-foreground py-2 px-4 rounded-lg hover:bg-muted transition-colors font-medium">
                        Re-analyze
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Analysis Failed
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      We couldn't analyze this document. Please try uploading again.
                    </p>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      <RotateCcw className="h-4 w-4 inline mr-2" />
                      Retry Analysis
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Select a Document
                </h4>
                <p className="text-muted-foreground">
                  Choose a document from the list to view its analysis results.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-bold text-foreground font-heading mb-4">
          What Our AI Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Grammar & Style</h4>
            <p className="text-sm text-muted-foreground">Checks for grammatical errors and writing style</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-chart-1" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Content Quality</h4>
            <p className="text-sm text-muted-foreground">Evaluates argument strength and clarity</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Structure</h4>
            <p className="text-sm text-muted-foreground">Analyzes organization and flow</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-chart-2 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Requirements</h4>
            <p className="text-sm text-muted-foreground">Ensures all requirements are met</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentReview;