'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onFileSelect,
  onClear,
  acceptedFormats = 'image/*',
  maxSizeMB = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      onFileSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
              transition-all duration-300 bg-white hover:bg-gray-50
              ${isDragging ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}
              ${error ? 'border-red-400' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileInput}
              className="hidden"
            />

            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                <FiUpload className="w-8 h-8 text-rose-500" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragging ? 'Drop your screenshot here' : 'Upload Chat Screenshot'}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-gray-500 text-xs">
                  Supports WhatsApp, iMessage, Instagram DMs (Max {maxSizeMB}MB)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiImage className="w-4 h-4" />
                <span>PNG, JPG, JPEG, WebP</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white">
              <img
                src={preview}
                alt="Chat screenshot preview"
                className="w-full h-auto max-h-96 object-contain"
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                aria-label="Remove image"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-3">
              Screenshot uploaded successfully
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-3 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
