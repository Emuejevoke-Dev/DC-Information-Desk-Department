import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { compressImageFile, formatFileSize } from '../../utils/fileUtils';

interface ImageUploadInputProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  required?: boolean;
  aspectRatioHint?: string; // e.g. "Portrait (3:4)", "Square (1:1)", "Flyer (4:5)"
  placeholderText?: string;
  helperText?: string;
  maxDimension?: number;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  aspectRatioHint = 'Recommended: High resolution photo or flyer',
  placeholderText = 'Tap to take a photo with camera or choose from gallery',
  helperText,
  maxDimension = 1200,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ size: number; name: string } | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await compressImageFile(file, maxDimension);
      onChange(result.dataUrl);
      setFileDetails({ size: result.sizeBytes, name: file.name });
    } catch (err) {
      console.error('Image compression failed:', err);
      setErrorMessage('Failed to process image. Please try another photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {aspectRatioHint && (
          <span className="text-[10px] text-slate-400 font-medium">{aspectRatioHint}</span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-blue-200 bg-slate-50 p-2 flex items-center gap-3">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>Image Attached</span>
            </div>
            {fileDetails && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {fileDetails.name} ({formatFileSize(fileDetails.size)})
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Processing photo...</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{placeholderText}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct mobile camera snapshot or device photo gallery
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] font-medium text-red-600 mt-1">{errorMessage}</p>
      )}

      {helperText && !errorMessage && (
        <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
};
