'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onDropAccepted: (file: File) => Promise<void>;
  maxSizeMB?: number;
}

export function FileDropzone({ onDropAccepted, maxSizeMB = 5 }: FileDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMsg(null);
    
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        setErrorMsg(`File is too large. Max size is ${maxSizeMB}MB.`);
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onDropAccepted(acceptedFiles[0]);
    } catch (err) {
      setErrorMsg('Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  }, [onDropAccepted, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-primary">Uploading...</p>
          </>
        ) : (
          <>
            <div className={`p-3 rounded-full ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground shadow-sm'}`}>
              {isDragActive ? <FileUp className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>
      
      {errorMsg && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-2 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
