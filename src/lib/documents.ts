// STUB: Documents feature not yet implemented in database
// This file is kept for future implementation but all functions throw errors

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  type: 'sop' | 'cv' | 'transcript' | 'recommendation' | 'other';
  status: 'uploading' | 'pending' | 'reviewed' | 'error';
  feedback?: string;
  created_at: string;
  updated_at: string;
  file_size?: number;
  mime_type?: string;
}

const NOT_IMPLEMENTED = 'Documents feature not yet implemented. Database table needs to be created.';

export const uploadDocument = async (): Promise<Document> => {
  throw new Error(NOT_IMPLEMENTED);
};

export const requestAIReview = async (): Promise<string> => {
  throw new Error(NOT_IMPLEMENTED);
};

export const updateDocumentStatus = async (): Promise<void> => {
  throw new Error(NOT_IMPLEMENTED);
};

export const getUserDocuments = async (): Promise<Document[]> => {
  return [];
};

export const deleteDocument = async (): Promise<void> => {
  throw new Error(NOT_IMPLEMENTED);
};

export const downloadDocument = async (): Promise<void> => {
  throw new Error(NOT_IMPLEMENTED);
};
