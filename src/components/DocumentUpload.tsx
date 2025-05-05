import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'reviewed';
  feedback?: string;
}

const DocumentUpload: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Statement of Purpose.pdf',
      status: 'reviewed',
      feedback: 'Good structure and content. Consider adding more details about your research interests.'
    },
    {
      id: '2',
      name: 'CV.pdf',
      status: 'pending'
    }
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments([...documents, {
        id: Date.now().toString(),
        name: file.name,
        status: 'pending'
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer group">
        <div className="bg-indigo-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
          <Upload className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="font-heading font-medium text-gray-800 mb-2">Upload Documents</h3>
        <p className="text-gray-500 mb-4">Drop your files here or click to browse</p>
        <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
          <Upload className="h-5 w-5" />
          Browse Files
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  doc.status === 'reviewed' ? 'bg-green-50' : 'bg-amber-50'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    doc.status === 'reviewed' ? 'text-green-500' : 'text-amber-500'
                  }`} />
                </div>
                <div>
                  <p className="font-heading font-medium text-gray-800">{doc.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {doc.status === 'reviewed' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">Reviewed</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-600 font-medium">Pending Review</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Feedback
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {doc.feedback && (
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {doc.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;