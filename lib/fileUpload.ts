/**
 * File upload utilities for Supabase Storage
 */

import { supabase } from './supabase';
import { validateFile } from './validation';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Uploads a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'task-attachments',
  folder?: string
): Promise<UploadResult> => {
  // Validate file
  const validation = validateFile(file, {
    maxSizeMB: 10,
    allowedTypes: ['image/*', 'application/pdf', 'text/*', 'application/*'],
  });

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || 'File validation failed',
    };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

/**
 * Deletes a file from Supabase Storage
 */
export const deleteFile = async (
  filePath: string,
  bucket: string = 'task-attachments'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Gets file type icon
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'picture_as_pdf';
  if (fileType.startsWith('text/')) return 'description';
  if (fileType.includes('word')) return 'description';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
  return 'attach_file';
};
