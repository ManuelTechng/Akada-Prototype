import React from 'react';
import { AlertCircle } from 'lucide-react';

// DocumentUpload feature is currently disabled - documents table not yet implemented
const DocumentUpload: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Document Upload Feature Coming Soon
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200">
              The document upload and AI review feature is currently under development.
              This feature will allow you to upload and get AI feedback on:
            </p>
            <ul className="mt-3 space-y-1 text-yellow-800 dark:text-yellow-200">
              <li>• Statements of Purpose (SOP)</li>
              <li>• CVs/Resumes</li>
              <li>• Academic Transcripts</li>
              <li>• Recommendation Letters</li>
              <li>• Other application documents</li>
            </ul>
            <p className="mt-4 text-sm text-yellow-700 dark:text-yellow-300">
              We're working hard to bring this feature to you. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
