/**
 * ImageTracer Professional - Simple wrapper
 * Calls ImageTracer with default configuration
 */

class ImageTracerProfessional {
  constructor() {
    this.isReady = false;
    this.checkAvailability();
  }
  
  checkAvailability() {
    if (window.ImageTracer) {
      this.isReady = true;
    }
  }

  /**
   * Vectorize - Simple, no additional processing
   */
  async vectorize(imageData) {
    if (!this.isReady) {
      throw new Error('ImageTracer not available');
    }
    
    // Create canvas from imageData
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    // Default configuration
    const options = {
      numberofcolors: 16
    };
    
    // Vectorize with ImageTracer
    const svg = await new Promise((resolve, reject) => {
      try {
        ImageTracer.imageToSVG(
          canvas.toDataURL(),
          (svgString) => {
            resolve(svgString);
          },
          options
        );
      } catch (error) {
        reject(error);
      }
    });
    
    return svg;
  }
  
  analyzeImage(imageData) {
    return 'default';
  }
  
  setPreset(preset) {
    // Use default configuration
  }
}

// Initialize global instance
window.ImageTracerPro = new ImageTracerProfessional();
