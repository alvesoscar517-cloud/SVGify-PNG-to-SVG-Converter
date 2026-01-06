/**
 * Custom Error Types
 */
class FileLoadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileLoadError';
  }
}

class MemoryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MemoryError';
  }
}

class ProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProcessingError';
  }
}

class ExportError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * ErrorHandler Utility
 * Centralized error handling and user notification
 * Uses custom modal system instead of default alert/confirm
 */
class ErrorHandler {
  /**
   * Initialize the error handler
   */
  static init() {
    // Check if NotificationModal is ready
  }
  
  /**
   * Handle different types of errors
   * @param {Error} error - The error object
   * @param {string} context - Context where error occurred
   */
  static handle(error, context = 'Unknown') {
    let userMessage = '';
    
    if (error instanceof FileLoadError) {
      userMessage = 'Cannot load file. Please try another file or check the file format.';
    } else if (error instanceof MemoryError) {
      userMessage = 'Image too large or out of memory. Try reducing colors or using a smaller image.';
    } else if (error instanceof ProcessingError) {
      userMessage = 'Processing failed. Please try again or use a different image.';
    } else if (error instanceof ExportError) {
      userMessage = 'Cannot export SVG. Please try again.';
    } else {
      userMessage = `An error occurred: ${error.message || 'Unknown error'}`;
    }
    
    this.showError(userMessage);
  }
  
  /**
   * Show error notification
   * @param {string} message - Error message to display
   * @param {number} duration - Duration in milliseconds (default: 5000)
   */
  static showError(message, duration = 5000) {
    if (typeof Toast !== 'undefined') {
      Toast.error(message, duration);
    }
  }
  
  /**
   * Show warning message (less severe than error)
   * @param {string} message - Warning message
   * @param {number} duration - Duration in milliseconds
   */
  static showWarning(message, duration = 4000) {
    if (typeof Toast !== 'undefined') {
      Toast.warning(message, duration);
    }
  }
  
  /**
   * Show success message
   * @param {string} message - Success message
   * @param {number} duration - Duration in milliseconds
   */
  static showSuccess(message, duration = 3000) {
    if (typeof Toast !== 'undefined') {
      Toast.success(message, duration);
    }
  }
  
  /**
   * Show info message
   * @param {string} message - Info message
   * @param {number} duration - Duration in milliseconds
   */
  static showInfo(message, duration = 3000) {
    if (typeof Toast !== 'undefined') {
      Toast.info(message, duration);
    }
  }
  
  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @param {string} title - Dialog title
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when cancelled
   */
  static confirm(message, title = 'Confirm', onConfirm, onCancel) {
    // Use window.NotificationModal to ensure getting the correct global instance
    if (window.NotificationModal && typeof window.NotificationModal.confirm === 'function') {
      window.NotificationModal.confirm(message, title, onConfirm, onCancel);
    } else {
      if (confirm(message)) {
        if (onConfirm) onConfirm();
      } else {
        if (onCancel) onCancel();
      }
    }
  }
  
  /**
   * Validate file before processing
   * @param {File} file - File to validate
   * @returns {boolean} - True if valid
   * @throws {FileLoadError} - If file is invalid
   */
  static validateFile(file) {
    if (!file) {
      throw new FileLoadError('No file selected');
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/jpg'];
    const fileType = file.type || '';
    
    // Also check file extension if type is not available
    const fileName = file.name || '';
    const fileExt = fileName.toLowerCase().split('.').pop();
    const validExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];
    
    const isValidType = validTypes.includes(fileType);
    const isValidExt = validExtensions.includes(fileExt);
    
    if (!isValidType && !isValidExt) {
      throw new FileLoadError(`Unsupported file format: ${fileType || fileExt || 'unknown'}. Only JPG, PNG, BMP, GIF are supported.`);
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new FileLoadError('File too large. Maximum size is 10MB.');
    }
    
    return true;
  }
  
  /**
   * Check if image dimensions are too large
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {boolean} - True if dimensions are acceptable
   */
  static checkImageDimensions(width, height) {
    const maxDimension = 4096;
    
    if (width > maxDimension || height > maxDimension) {
      this.showWarning(
        `Large image dimensions (${width}x${height}). Processing may take several minutes.`,
        6000
      );
      return true; // Still allow processing
    }
    
    return true;
  }
  
  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Context description
   * @returns {Function} - Wrapped function
   */
  static wrapAsync(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error; // Re-throw for caller to handle if needed
      }
    };
  }
}

// Export error classes for use in other modules
if (typeof window !== 'undefined') {
  window.FileLoadError = FileLoadError;
  window.MemoryError = MemoryError;
  window.ProcessingError = ProcessingError;
  window.ExportError = ExportError;
  window.ErrorHandler = ErrorHandler;
}
