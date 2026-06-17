export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  preview?: string;
}

export interface ExistingFile {
  id: string;
  name: string;
}
