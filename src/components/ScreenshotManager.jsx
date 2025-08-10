import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { processImage, validateImageFile, downloadImage, formatFileSize } from '../utils/imageUtils';

export default function ScreenshotManager({ screenshots, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = async (files) => {
    setIsUploading(true);
    const newScreenshots = [];

    try {
      for (const file of files) {
        const validation = await validateImageFile(file);
        
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        try {
          const processed = await processImage(file);
          
          const screenshot = {
            id: Date.now() + Math.random(),
            name: `Screenshot ${screenshots.length + newScreenshots.length + 1}`,
            thumbnail: processed.thumbnail,
            fullSize: processed.fullSize,
            fileName: processed.fileName,
            originalSize: processed.originalSize,
            processedSize: processed.processedSize,
            dimensions: processed.dimensions,
            uploadedAt: new Date().toISOString()
          };
          
          newScreenshots.push(screenshot);
        } catch (error) {
          alert(`Failed to process ${file.name}: ${error.message}`);
        }
      }

      if (newScreenshots.length > 0) {
        onChange([...screenshots, ...newScreenshots]);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeScreenshot = (id) => {
    onChange(screenshots.filter(s => s.id !== id));
  };

  const updateScreenshotName = (id, newName) => {
    onChange(screenshots.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const downloadScreenshot = (screenshot) => {
    downloadImage(screenshot.fullSize, screenshot.fileName);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Screenshots</label>
        <span className="text-xs text-slate-500">
          {screenshots.length}/5 images
        </span>
      </div>

      {/* Upload Area */}
      {screenshots.length < 5 && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver
              ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(Array.from(e.target.files))}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Processing images...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  Click to upload
                </button>
                {' or drag and drop'}
              </div>
              <div className="text-xs text-slate-500">
                PNG, JPG, GIF up to 10MB
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screenshots Grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewingImage(screenshot);
                  }}
                  className="flex-shrink-0 group relative"
                >
                  <img
                    src={screenshot.thumbnail}
                    alt={screenshot.name}
                    className="w-16 h-12 object-cover rounded border border-slate-200 dark:border-slate-600 group-hover:border-sky-400 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center">
                    <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={screenshot.name}
                    onChange={(e) => updateScreenshotName(screenshot.id, e.target.value)}
                    className="w-full text-sm font-medium bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-slate-100"
                    placeholder="Screenshot name"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {screenshot.dimensions.original.width}×{screenshot.dimensions.original.height} • {formatFileSize(screenshot.processedSize)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => downloadScreenshot(screenshot)}
                      className="text-xs text-sky-600 hover:text-sky-700"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => removeScreenshot(screenshot.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal - Rendered as Portal */}
      {viewingImage && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={viewingImage.fullSize || viewingImage.thumbnail}
              alt={viewingImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                // Fallback to thumbnail if fullSize fails
                if (e.target.src !== viewingImage.thumbnail) {
                  e.target.src = viewingImage.thumbnail;
                }
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-lg">
              <div className="font-medium">{viewingImage.name}</div>
              <div className="text-sm text-gray-300">
                {viewingImage.dimensions.original.width}×{viewingImage.dimensions.original.height} • {formatFileSize(viewingImage.processedSize)}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
