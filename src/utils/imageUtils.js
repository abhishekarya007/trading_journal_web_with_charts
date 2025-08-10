// Image processing utilities for trade screenshots

/**
 * Resize image and create thumbnail
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width for full size
 * @param {number} maxHeight - Maximum height for full size
 * @param {number} thumbWidth - Thumbnail width
 * @param {number} thumbHeight - Thumbnail height
 * @returns {Promise<{thumbnail: string, fullSize: string, fileName: string}>}
 */
export async function processImage(file, maxWidth = 1920, maxHeight = 1080, thumbWidth = 150, thumbHeight = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas for full size image
        const fullCanvas = document.createElement('canvas');
        const fullCtx = fullCanvas.getContext('2d');
        
        // Calculate full size dimensions (maintain aspect ratio)
        let fullWidth = img.width;
        let fullHeight = img.height;
        
        if (fullWidth > maxWidth || fullHeight > maxHeight) {
          const ratio = Math.min(maxWidth / fullWidth, maxHeight / fullHeight);
          fullWidth = fullWidth * ratio;
          fullHeight = fullHeight * ratio;
        }
        
        fullCanvas.width = fullWidth;
        fullCanvas.height = fullHeight;
        
        // Draw full size image
        fullCtx.drawImage(img, 0, 0, fullWidth, fullHeight);
        const fullSizeDataUrl = fullCanvas.toDataURL('image/jpeg', 0.8);
        
        // Create canvas for thumbnail
        const thumbCanvas = document.createElement('canvas');
        const thumbCtx = thumbCanvas.getContext('2d');
        
        // Calculate thumbnail dimensions (maintain aspect ratio, center crop)
        const aspectRatio = img.width / img.height;
        const thumbAspectRatio = thumbWidth / thumbHeight;
        
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
        
        if (aspectRatio > thumbAspectRatio) {
          // Image is wider than thumbnail ratio - crop width
          sourceWidth = img.height * thumbAspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // Image is taller than thumbnail ratio - crop height
          sourceHeight = img.width / thumbAspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        
        // Draw thumbnail with center crop
        thumbCtx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, thumbWidth, thumbHeight
        );
        
        const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
        
        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `trade_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        resolve({
          thumbnail: thumbnailDataUrl,
          fullSize: fullSizeDataUrl,
          fileName: fileName,
          originalSize: file.size,
          processedSize: Math.round(fullSizeDataUrl.length * 0.75), // Approximate size
          dimensions: {
            original: { width: img.width, height: img.height },
            fullSize: { width: fullWidth, height: fullHeight },
            thumbnail: { width: thumbWidth, height: thumbHeight }
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file 
 * @returns {Promise<boolean>}
 */
export function validateImageFile(file) {
  return new Promise((resolve) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      resolve({ valid: false, error: 'File must be an image' });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      resolve({ valid: false, error: 'Image must be less than 10MB' });
      return;
    }
    
    // Check if it's a valid image by trying to load it
    const img = new Image();
    img.onload = () => {
      // Check dimensions (max 5000x5000)
      if (img.width > 5000 || img.height > 5000) {
        resolve({ valid: false, error: 'Image dimensions too large (max 5000x5000)' });
        return;
      }
      
      resolve({ valid: true });
    };
    
    img.onerror = () => {
      resolve({ valid: false, error: 'Invalid or corrupted image file' });
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create download link for image
 * @param {string} dataUrl - Base64 data URL
 * @param {string} fileName - File name
 */
export function downloadImage(dataUrl, fileName) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data URL to blob for file operations
 * @param {string} dataUrl 
 * @returns {Blob}
 */
export function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Format file size for display
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
