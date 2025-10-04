import React, { useState, useRef } from 'react';
import { Button } from '../../level1/Button';
import { Flex } from '../../level1/Flex';
import { ProgressBar } from '../../level1/ProgressBar';
import type { Theme } from '../../utils/types';
import { formatFileSize } from '../../utils/format';
import { cn } from '../../utils/classNames';
import './FileUploader.css';

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onError?: (error: Error) => void;
  theme?: Theme;
}

export const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      onUpload,
      onError,
      theme = 'minimal',
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState<Record<number, number>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
      if (maxSize && file.size > maxSize) {
        onError?.(new Error(`파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다`));
        return false;
      }
      return true;
    };

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);
      const validFiles = fileArray.filter(validateFile);

      if (maxFiles && files.length + validFiles.length > maxFiles) {
        onError?.(new Error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다`));
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    };

    const removeFile = (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
    };

    const handleUpload = async () => {
      setUploading(true);
      try {
        // Simulate progress
        files.forEach((_, index) => {
          const interval = setInterval(() => {
            setProgress((prev) => {
              const current = prev[index] || 0;
              if (current >= 100) {
                clearInterval(interval);
                return prev;
              }
              return { ...prev, [index]: current + 10 };
            });
          }, 100);
        });

        await onUpload(files);
        setFiles([]);
        setProgress({});
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setUploading(false);
      }
    };

    return (
      <div ref={ref} className="file-uploader" data-theme={theme}>
        <div
          className={cn(
            'file-uploader__dropzone',
            dragActive && 'file-uploader__dropzone--active'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="file-uploader__icon">📁</div>
          <h4>파일을 드래그하거나 클릭하여 선택하세요</h4>
          <p className="file-uploader__hint">
            {accept && `허용 형식: ${accept}`}
            {maxSize && ` / 최대 ${formatFileSize(maxSize)}`}
          </p>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={inputRef}
          />
          <Button onClick={() => inputRef.current?.click()}>
            파일 선택
          </Button>
        </div>

        {files.length > 0 && (
          <div className="file-uploader__files">
            {files.map((file, index) => (
              <Flex
                key={index}
                justify="between"
                align="center"
                className="file-uploader__file"
              >
                <Flex align="center" gap="sm">
                  <div className="file-uploader__file-icon">📄</div>
                  <div>
                    <div className="file-uploader__file-name">{file.name}</div>
                    <small className="file-uploader__file-size">
                      {formatFileSize(file.size)}
                    </small>
                  </div>
                </Flex>

                <Flex align="center" gap="sm">
                  {progress[index] !== undefined && (
                    <ProgressBar
                      value={progress[index]}
                      size="sm"
                      style={{ width: 100 }}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    ×
                  </Button>
                </Flex>
              </Flex>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <Button onClick={handleUpload} loading={uploading} fullWidth>
            업로드 ({files.length})
          </Button>
        )}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';
