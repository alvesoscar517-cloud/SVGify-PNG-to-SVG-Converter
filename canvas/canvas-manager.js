/**
 * CanvasManager Class
 * Manages Fabric.js canvas for interactive image editing
 */
class CanvasManager {
  constructor(canvasElementId) {
    this.canvasElementId = canvasElementId;
    this.canvas = null;
    this.currentImage = null;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 20;
    this.resizeTimeout = null;
    this.isResizing = false; // Flag to prevent resize loops
  }
  
  /**
   * Initialize Fabric.js canvas
   */
  initCanvas() {
    const canvasElement = document.getElementById(this.canvasElementId);
    if (!canvasElement) {
      throw new Error(`Canvas element with id "${this.canvasElementId}" not found`);
    }
    
    // Calculate canvas size based on container
    const container = canvasElement.parentElement;
    const canvasWidth = container.clientWidth - 40; // 40px padding
    const canvasHeight = container.clientHeight - 40;
    
    // Initialize Fabric canvas
    this.canvas = new fabric.Canvas(this.canvasElementId, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      selection: false,
      preserveObjectStacking: true
    });
    
    // Handle window resize with debounce
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.handleResize(), 100);
    });
    
    // Track canvas changes for history
    this.canvas.on('object:modified', () => this.saveState());
    this.canvas.on('object:added', () => this.saveState());
    this.canvas.on('object:removed', () => this.saveState());
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Prevent resize loops
    if (this.isResizing) {
      return;
    }
    
    const canvasElement = document.getElementById(this.canvasElementId);
    if (!canvasElement) return;
    
    const container = canvasElement.parentElement;
    if (!container) return;
    
    this.isResizing = true;
    
    // Get the actual available space in the container
    // Use getBoundingClientRect for more accurate measurements
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate canvas size with fixed padding
    const padding = 40;
    const newWidth = Math.max(Math.floor(containerWidth - padding), 100);
    const newHeight = Math.max(Math.floor(containerHeight - padding), 100);
    
    // Only resize if dimensions actually changed significantly
    const widthDiff = Math.abs(this.canvas.width - newWidth);
    const heightDiff = Math.abs(this.canvas.height - newHeight);
    
    if (widthDiff > 5 || heightDiff > 5) {
      // Store current image properties if there's an image
      let imageState = null;
      if (this.currentImage) {
        imageState = {
          scaleX: this.currentImage.scaleX,
          scaleY: this.currentImage.scaleY,
          left: this.currentImage.left,
          top: this.currentImage.top,
          angle: this.currentImage.angle
        };
      }
      
      // Resize canvas
      this.canvas.setDimensions({
        width: newWidth,
        height: newHeight
      });
      
      // Restore image properties exactly as they were
      if (this.currentImage && imageState) {
        this.currentImage.set({
          scaleX: imageState.scaleX,
          scaleY: imageState.scaleY,
          left: imageState.left,
          top: imageState.top,
          angle: imageState.angle
        });
        this.currentImage.setCoords();
      }
      
      this.canvas.renderAll();
    }
    
    // Reset flag after a short delay
    setTimeout(() => {
      this.isResizing = false;
    }, 100);
  }
  
  /**
   * Save current canvas state to history
   */
  saveState() {
    // Remove any states after current index
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Save current state
    const state = JSON.stringify(this.canvas.toJSON());
    this.history.push(state);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    
    // Dispatch event for UI updates
    this.dispatchHistoryEvent();
  }
  
  /**
   * Undo last action
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
      this.dispatchHistoryEvent();
    }
  }
  
  /**
   * Redo last undone action
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
      this.dispatchHistoryEvent();
    }
  }
  
  /**
   * Load canvas state from JSON
   */
  loadState(state) {
    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();
      
      // Update currentImage reference
      const objects = this.canvas.getObjects();
      if (objects.length > 0 && objects[0].type === 'image') {
        this.currentImage = objects[0];
      }
    });
  }
  
  /**
   * Dispatch history change event
   */
  dispatchHistoryEvent() {
    const event = new CustomEvent('canvasHistoryChange', {
      detail: {
        canUndo: this.historyIndex > 0,
        canRedo: this.historyIndex < this.history.length - 1
      },
      bubbles: true
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Check if undo is available
   */
  canUndo() {
    return this.historyIndex > 0;
  }
  
  /**
   * Check if redo is available
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
  
  /**
   * Get the canvas instance
   */
  getCanvas() {
    return this.canvas;
  }
  
  /**
   * Get current image object
   */
  getCurrentImage() {
    return this.currentImage;
  }
  
  /**
   * Check if an image is loaded
   */
  hasImage() {
    return this.currentImage !== null;
  }
  
  /**
   * Load image from file
   * @param {File} file - Image file to load
   * @returns {Promise<fabric.Image>} - Loaded image object
   */
  loadImage(file) {
    return new Promise((resolve, reject) => {
      // Validate file
      try {
        ErrorHandler.validateFile(file);
      } catch (error) {
        reject(error);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imgElement = new Image();
        
        imgElement.onload = () => {
          // Check image dimensions
          ErrorHandler.checkImageDimensions(imgElement.width, imgElement.height);
          
          // Clear canvas first
          this.clear();
          
          // Create Fabric image
          const fabricImage = new fabric.Image(imgElement, {
            left: 0,
            top: 0,
            selectable: true,
            hasControls: true,
            hasBorders: true
          });
          
          // Add image to canvas
          this.canvas.add(fabricImage);
          this.currentImage = fabricImage;
          
          // Center and fit image
          this.canvas.centerObject(fabricImage);
          this.fitToViewport(fabricImage);
          
          // Save initial state
          this.history = [];
          this.historyIndex = -1;
          this.saveState();
          
          this.canvas.renderAll();
          
          // Dispatch event
          const event = new CustomEvent('imageLoaded', {
            detail: { 
              width: imgElement.width, 
              height: imgElement.height,
              fileName: file.name
            },
            bubbles: true
          });
          document.dispatchEvent(event);
          
          resolve(fabricImage);
        };
        
        imgElement.onerror = () => {
          reject(new FileLoadError('Cannot load image. File may be corrupted.'));
        };
        
        imgElement.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new FileLoadError('Cannot read file.'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Fit image to viewport while maintaining aspect ratio
   * @param {fabric.Image} img - Image to fit
   */
  fitToViewport(img) {
    if (!img) return;
    
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    // Calculate scale to fit 90% of canvas
    const scaleX = (canvasWidth * 0.9) / imgWidth;
    const scaleY = (canvasHeight * 0.9) / imgHeight;
    const scale = Math.min(scaleX, scaleY);
    
    img.scale(scale);
    this.canvas.centerObject(img);
    this.canvas.renderAll();
  }
  
  /**
   * Clear canvas
   */
  clear() {
    this.canvas.clear();
    this.canvas.backgroundColor = '#ffffff';
    this.currentImage = null;
    this.history = [];
    this.historyIndex = -1;
    
    // Dispatch event
    const event = new CustomEvent('canvasCleared', { bubbles: true });
    document.dispatchEvent(event);
  }
  
  /**
   * Zoom in
   */
  zoomIn() {
    if (!this.currentImage) return;
    
    const currentScale = this.currentImage.scaleX;
    const newScale = currentScale * 1.2;
    
    this.currentImage.scale(newScale);
    this.canvas.renderAll();
    this.saveState();
  }
  
  /**
   * Zoom out
   */
  zoomOut() {
    if (!this.currentImage) return;
    
    const currentScale = this.currentImage.scaleX;
    const newScale = currentScale / 1.2;
    
    // Don't zoom out too much
    if (newScale < 0.1) return;
    
    this.currentImage.scale(newScale);
    this.canvas.renderAll();
    this.saveState();
  }
  
  /**
   * Fit image to screen
   */
  fitToScreen() {
    if (!this.currentImage) return;
    
    this.fitToViewport(this.currentImage);
    this.saveState();
  }
  
  /**
   * Enable mouse wheel zoom
   */
  enableMouseWheelZoom() {
    this.canvas.on('mouse:wheel', (opt) => {
      if (!this.currentImage) return;
      
      const delta = opt.e.deltaY;
      let zoom = this.currentImage.scaleX;
      
      zoom *= 0.999 ** delta;
      
      // Limit zoom
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      
      this.currentImage.scale(zoom);
      this.canvas.renderAll();
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }
  
  /**
   * Enable pan with mouse drag (when holding space or middle mouse button)
   */
  enablePan() {
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;
    
    this.canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      
      // Enable panning with middle mouse button or space + left click
      if (evt.button === 1 || (evt.button === 0 && evt.shiftKey)) {
        isPanning = true;
        this.canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        this.canvas.defaultCursor = 'grab';
      }
    });
    
    this.canvas.on('mouse:move', (opt) => {
      if (isPanning && this.currentImage) {
        const evt = opt.e;
        const deltaX = evt.clientX - lastPosX;
        const deltaY = evt.clientY - lastPosY;
        
        this.currentImage.left += deltaX;
        this.currentImage.top += deltaY;
        this.currentImage.setCoords();
        
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        
        this.canvas.renderAll();
      }
    });
    
    this.canvas.on('mouse:up', () => {
      if (isPanning) {
        isPanning = false;
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'default';
        this.saveState();
      }
    });
  }
  
  /**
   * Get image data for vectorization processing
   * @returns {ImageData|null} - Image data or null if no image
   */
  getImageData() {
    if (!this.currentImage) {
      return null;
    }
    
    try {
      // Create temporary canvas
      const tempCanvas = document.createElement('canvas');
      const imgElement = this.currentImage.getElement();
      
      tempCanvas.width = imgElement.naturalWidth || imgElement.width;
      tempCanvas.height = imgElement.naturalHeight || imgElement.height;
      
      const ctx = tempCanvas.getContext('2d');
      
      // Draw image to temporary canvas
      ctx.drawImage(imgElement, 0, 0);
      
      // Extract image data
      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      
      return imageData;
      
    } catch (error) {
      throw new ProcessingError('Cannot extract image data');
    }
  }
  
  /**
   * Get image as data URL for embedding
   * @returns {string|null} - Data URL or null if no image
   */
  getImageDataURL() {
    if (!this.currentImage) {
      return null;
    }
    
    try {
      // Create temporary canvas
      const tempCanvas = document.createElement('canvas');
      const imgElement = this.currentImage.getElement();
      
      tempCanvas.width = imgElement.naturalWidth || imgElement.width;
      tempCanvas.height = imgElement.naturalHeight || imgElement.height;
      
      const ctx = tempCanvas.getContext('2d');
      
      // Draw image to temporary canvas
      ctx.drawImage(imgElement, 0, 0);
      
      // Convert to data URL (PNG format for best quality)
      const dataURL = tempCanvas.toDataURL('image/png');
      
      return dataURL;
      
    } catch (error) {
      throw new ProcessingError('Cannot create data URL for image');
    }
  }
  
  /**
   * Initialize all canvas features
   */
  init() {
    // Check if Fabric.js is loaded
    if (typeof fabric === 'undefined') {
      throw new Error('Fabric.js library is not loaded');
    }
    
    this.initCanvas();
    this.enableMouseWheelZoom();
    this.enablePan();
  }
}
