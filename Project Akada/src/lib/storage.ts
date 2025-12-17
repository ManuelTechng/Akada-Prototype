import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadProfilePicture = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    // Generate unique filename that matches RLS policy requirements
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_profile_${Date.now()}.${fileExt}`;
    const filePath = fileName; // No subdirectory, just the filename

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Replace existing file with same name
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const deleteProfilePicture = async (userId: string): Promise<UploadResult> => {
  try {
    // Find existing profile pictures for this user
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', {
        search: `${userId}_profile_`
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return { success: false, error: listError.message };
    }

    // Delete all matching files
    if (files && files.length > 0) {
      const filePaths = files.map(file => file.name);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
        return { success: false, error: deleteError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};
