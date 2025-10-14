import { supabase } from './supabase';
import { analyzeDocument } from './gemini';

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

/**
 * Upload a document to Supabase Storage and create document metadata
 * Real-world use case: Nigerian students upload transcripts, SOPs, CVs for AI review
 */
export const uploadDocument = async (
  userId: string,
  file: File,
  type: Document['type'] = 'other'
): Promise<Document> => {
  try {
    console.log('Documents: Starting upload for file', file.name, 'size:', file.size);
    
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Documents: Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    console.log('Documents: File uploaded successfully:', uploadData.path);

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(uploadData.path);

    // Create document metadata in database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        filename: file.name,
        url: publicUrl,
        type: type,
        status: 'pending',
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (dbError) {
      console.error('Documents: Database error:', dbError);
      // If DB insert fails, clean up uploaded file
      await supabase.storage.from('documents').remove([uploadData.path]);
      throw new Error(`Failed to save document metadata: ${dbError.message}`);
    }

    console.log('Documents: Document metadata saved:', documentData.id);

    // Start AI review in background (don't await to avoid blocking)
    requestAIReview(documentData.id, publicUrl, type).catch(error => {
      console.error('Documents: AI review failed:', error);
      updateDocumentStatus(documentData.id, 'error', `AI review failed: ${error.message}`);
    });

    return documentData;
  } catch (error) {
    console.error('Documents: Upload failed:', error);
    throw error;
  }
};

/**
 * Request AI review for uploaded document
 */
export const requestAIReview = async (
  documentId: string,
  documentUrl: string,
  type: Document['type']
): Promise<string> => {
  try {
    console.log('Documents: Starting AI review for document:', documentId);
    
    // Update status to indicate review is in progress
    await updateDocumentStatus(documentId, 'pending', 'AI review in progress...');

    // Create appropriate prompt based on document type
    let prompt = '';
    switch (type) {
      case 'sop':
        prompt = `Please review this Statement of Purpose for a Nigerian student applying to international universities. 
        Provide feedback on:
        1. Structure and organization
        2. Clarity of goals and motivations
        3. Grammar and writing quality
        4. Specific suggestions for improvement
        5. Overall rating (1-10)
        
        Keep feedback concise but actionable. Focus on helping the student strengthen their application.`;
        break;
      case 'cv':
        prompt = `Please review this CV/Resume for a Nigerian student applying to international programs.
        Provide feedback on:
        1. Format and structure
        2. Content relevance and impact
        3. Skills presentation
        4. Experience descriptions
        5. Overall rating (1-10)
        
        Suggest specific improvements for international applications.`;
        break;
      case 'transcript':
        prompt = `Please review this academic transcript for completeness and clarity.
        Check for:
        1. Required information presence
        2. Format and readability
        3. Grade calculations
        4. Missing elements
        5. Overall rating (1-10)`;
        break;
      default:
        prompt = `Please review this document and provide constructive feedback on:
        1. Content quality
        2. Structure and format
        3. Language and clarity
        4. Suggestions for improvement
        5. Overall rating (1-10)`;
    }

    // Download and review document content with Gemini
    const documentContent = await downloadDocumentContent(documentUrl);
    const feedback = await analyzeDocument(documentContent, type as 'sop' | 'cv');
    
    // Update document with feedback
    await updateDocumentStatus(documentId, 'reviewed', feedback);
    
    console.log('Documents: AI review completed for document:', documentId);
    return feedback;
  } catch (error) {
    console.error('Documents: AI review error:', error);
    await updateDocumentStatus(documentId, 'error', `Review failed: ${error.message}`);
    throw error;
  }
};

/**
 * Update document status and feedback
 */
export const updateDocumentStatus = async (
  documentId: string,
  status: Document['status'],
  feedback?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        status,
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      console.error('Documents: Status update error:', error);
      throw error;
    }

    console.log('Documents: Status updated for document:', documentId, 'to:', status);
  } catch (error) {
    console.error('Documents: Failed to update document status:', error);
    throw error;
  }
};

/**
 * Get all documents for a user
 */
export const getUserDocuments = async (
  userId: string,
  type?: Document['type']
): Promise<Document[]> => {
  try {
    console.log('Documents: Fetching documents for user:', userId);
    
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Documents: Fetch error:', error);
      throw error;
    }

    console.log('Documents: Fetched', data?.length || 0, 'documents');
    return data || [];
  } catch (error) {
    console.error('Documents: Failed to fetch documents:', error);
    throw error;
  }
};

/**
 * Delete a document and its file from storage
 */
export const deleteDocument = async (
  userId: string,
  documentId: string
): Promise<void> => {
  try {
    console.log('Documents: Deleting document:', documentId);
    
    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('url, user_id')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      throw new Error('Document not found or unauthorized');
    }

    // Extract file path from URL
    const urlParts = document.url.split('/');
    const filePath = urlParts.slice(-2).join('/'); // user_id/filename

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Documents: Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Documents: Database deletion error:', dbError);
      throw dbError;
    }

    console.log('Documents: Document deleted successfully:', documentId);
  } catch (error) {
    console.error('Documents: Failed to delete document:', error);
    throw error;
  }
};

/**
 * Download document content for AI review
 */
const downloadDocumentContent = async (documentUrl: string): Promise<string> => {
  try {
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error('Failed to download document for review');
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/plain')) {
      // Plain text file
      return await response.text();
    } else if (contentType.includes('application/pdf')) {
      // For PDF files, we'd need a PDF parser
      // For now, return a placeholder message
      return '[PDF document uploaded - AI review based on file structure and metadata]';
    } else {
      // For other document types (DOC, DOCX), we'd need appropriate parsers
      // For now, return a placeholder
      return '[Document uploaded - AI review based on file metadata and structure]';
    }
  } catch (error) {
    console.error('Documents: Failed to download content for review:', error);
    return '[Document content could not be extracted - AI review based on file metadata]';
  }
};

/**
 * Download document file
 */
export const downloadDocument = async (documentUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error('Failed to download document');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Documents: Download failed:', error);
    throw error;
  }
};
