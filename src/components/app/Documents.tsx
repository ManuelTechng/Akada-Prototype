import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  X,
  Download,
  Edit,
  Trash,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Calendar,
  UploadCloud,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createEssayReview } from '../../lib/essay';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sop' | 'cv' | 'all'>('all');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  
  // Sample documents for development
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Statement of Purpose - UofT.pdf',
      type: 'sop',
      status: 'reviewed',
      feedback: 'Your SOP has a clear structure and effectively communicates your goals. Consider strengthening the connection between your past experiences and future aspirations. Add more specific details about research interests at UofT.',
      created_at: '2024-03-10T15:20:00Z',
      updated_at: '2024-03-12T09:30:00Z',
      starred: true,
      program: 'University of Toronto - MSc Computer Science'
    },
    {
      id: '2',
      name: 'CV - Academic.pdf',
      type: 'cv',
      status: 'reviewed',
      feedback: 'Strong CV with good formatting. Consider reorganizing your projects section to highlight technologies relevant for the ML program. Add measurable outcomes for your work experiences.',
      created_at: '2024-03-05T11:45:00Z',
      updated_at: '2024-03-07T14:20:00Z',
      starred: false,
      program: 'University of Edinburgh - MSc AI'
    },
    {
      id: '3',
      name: 'Statement of Purpose - ETH.pdf',
      type: 'sop',
      status: 'pending',
      feedback: null,
      created_at: '2024-03-15T08:30:00Z',
      updated_at: '2024-03-15T08:30:00Z',
      starred: false,
      program: 'ETH Zurich - MSc Robotics'
    },
    {
      id: '4',
      name: 'Research Statement - TUM.pdf',
      type: 'research',
      status: 'pending',
      feedback: null,
      created_at: '2024-03-18T10:15:00Z',
      updated_at: '2024-03-18T10:15:00Z',
      starred: false,
      program: 'TU Munich - MSc Data Science'
    },
    {
      id: '5',
      name: 'CV - Technical.pdf',
      type: 'cv',
      status: 'reviewed',
      feedback: 'Excellent technical CV. The skills section is comprehensive and well-organized. Consider adding a brief personal statement at the beginning to give a better overview of your profile.',
      created_at: '2024-02-28T13:40:00Z',
      updated_at: '2024-03-02T16:00:00Z',
      starred: true,
      program: 'General'
    }
  ]);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real implementation, this would send the content to the API
      // const result = await createEssayReview(user.id, activeTab, content);
      // For now, simulate a delay and generate a simple feedback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedFeedback = `This is simulated feedback for your ${activeTab === 'sop' ? 'Statement of Purpose' : 'CV'}.\n\nThe document is well-structured and clearly communicates your goals and background. Consider adding more specific details about your experiences and how they relate to your goals.\n\nStrengths:\n- Clear writing style\n- Good organization\n- Relevant background information\n\nAreas for improvement:\n- Add more specific examples\n- Strengthen the connection between your past experiences and future goals\n- Proofread for minor grammatical issues`;
      
      setFeedback(simulatedFeedback);
      
      // Add the new document to the list
      const newDocument = {
        id: (documents.length + 1).toString(),
        name: `${activeTab === 'sop' ? 'Statement of Purpose' : 'CV'} - ${new Date().toISOString().slice(0, 10)}.pdf`,
        type: activeTab,
        status: 'reviewed',
        feedback: simulatedFeedback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        starred: false,
        program: 'New Submission'
      };
      
      setDocuments([newDocument, ...documents]);
      
    } catch (err) {
      setError('Failed to get feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowUpload(false);
    }
  };

  const handleStarDocument = (id: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === id ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesTab = activeTab === 'all' || doc.type === activeTab;
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.program && doc.program.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 font-heading">Document Manager</h1>
        <p className="text-gray-600">Manage and review your application documents</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search documents..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full"
              >
                <option value="all">All Types</option>
                <option value="sop">Statements of Purpose</option>
                <option value="cv">CVs/Resumes</option>
                <option value="research">Research Statements</option>
                <option value="recommendation">Recommendations</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowUpload(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>New Document</span>
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            All Documents
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'sop' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Statements of Purpose
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'cv' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            CVs & Resumes
          </button>
        </div>
      </div>

      {/* Document List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 
                    ${doc.type === 'sop' ? 'bg-indigo-100 text-indigo-600' : 
                      doc.type === 'cv' ? 'bg-cyan-100 text-cyan-600' : 
                      doc.type === 'research' ? 'bg-purple-100 text-purple-600' : 
                      'bg-amber-100 text-amber-600'}`
                  }>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900 break-words">{doc.name}</h3>
                        {doc.program && (
                          <p className="text-sm text-gray-500 mb-2">{doc.program}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(doc.created_at)}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            doc.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {doc.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className={`p-2 rounded-lg ${doc.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          onClick={() => handleStarDocument(doc.id)}
                        >
                          <Star className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {doc.feedback && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    <h4 className="font-medium mb-2">AI Feedback:</h4>
                    <p className="whitespace-pre-line">{doc.feedback.length > 150 ? `${doc.feedback.slice(0, 150)}...` : doc.feedback}</p>
                    {doc.feedback.length > 150 && (
                      <button className="text-indigo-600 font-medium text-xs mt-1">
                        Read full feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
                <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors">
                  {doc.status === 'reviewed' ? 'View Feedback' : 'Request Review'}
                </button>
                <div className="flex gap-3">
                  <button className="text-gray-600 text-sm hover:text-gray-800 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mb-8">
          <div className="bg-gray-50 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Documents Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterType !== 'all' || activeTab !== 'all'
              ? "No documents match your current filters."
              : "You haven't uploaded any documents yet."}
          </p>
          {searchQuery || filterType !== 'all' || activeTab !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setActiveTab('all');
              }}
              className="text-indigo-600 font-medium hover:text-indigo-700 mr-4"
            >
              Clear Filters
            </button>
          ) : null}
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <UploadCloud className="h-5 w-5" />
            <span>Upload Document</span>
          </button>
        </div>
      )}
      
      {/* Upload Tips */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">AI Document Review</h3>
            <p className="text-indigo-100 mb-4">
              Upload your statements of purpose, CVs, and research statements for AI-powered review and feedback.
              Get personalized suggestions to improve your application documents.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Grammar & Style Check</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Content Improvement</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Formatting Suggestions</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button 
              onClick={() => setShowUpload(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              <span>Upload for Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for New Document/Review */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Upload New Document</h2>
              <button 
                onClick={() => setShowUpload(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('sop')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'sop'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Statement of Purpose
                </button>
                <button
                  onClick={() => setActiveTab('cv')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'cv'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  CV/Resume
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g., University of Toronto - MSc Computer Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === 'sop' ? 'Statement of Purpose' : 'CV/Resume'} Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Enter your ${activeTab === 'sop' ? 'Statement of Purpose' : 'CV/Resume'} here or upload a file...`}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              <div className="border-t border-gray-100 pt-6 pb-2 flex flex-col sm:flex-row justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Or upload a file: 
                  <label className="ml-2 text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    Browse files
                    <input type="file" className="hidden" />
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      isSubmitting || !content.trim()
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Getting Feedback...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Get AI Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-heading">Document Templates</h2>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
            View All Templates
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">SOP Template</h3>
                <p className="text-xs text-gray-500">Standard format</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              A proven SOP structure for technical graduate programs.
            </p>
            <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">CV Template</h3>
                <p className="text-xs text-gray-500">Technical focus</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Academic CV format optimized for tech program applications.
            </p>
            <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Research Statement</h3>
                <p className="text-xs text-gray-500">PhD applications</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Structured template for presenting research interests and plans.
            </p>
            <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Motivation Letter</h3>
                <p className="text-xs text-gray-500">European universities</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Format specifically tailored for European program applications.
            </p>
            <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;