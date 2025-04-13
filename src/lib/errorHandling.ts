// Error types for better classification
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  IMAGE_PROCESSING_ERROR = 'IMAGE_PROCESSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Custom error interface with additional properties
export interface ApiError extends Error {
  status?: number;
  type?: ErrorType;
}

// Helper to log errors with consistent format
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(
    `[${timestamp}] ${context ? `[${context}] ` : ''}Error: ${errorMessage}`,
    errorStack ? { stack: errorStack } : ''
  );
  
  // In a production app, you might send this to a logging service
  return errorMessage;
}

// Helper to handle API response errors
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP Error ${response.status}`;
    
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.type = ErrorType.API_ERROR;
    
    throw error;
  }
  
  return response.json();
}

// Helper to resize an image before uploading
export function resizeImageToDataURL(file: File, maxWidth = 800, maxHeight = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85)); // You can adjust quality
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
} 