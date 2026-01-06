/**
 * Batch Converter Component
 * Handles batch image conversion to SVG
 */

class BatchConverter {
  constructor(viewId) {
    this.viewId = viewId;
    this.view = null;
    this.images = [];
    this.selectedOption = 'embed'; // 'embed' or 'vectorize'
    this.isProcessing = false;
    this.processedCount = 0;
    this.nextId = 1; // Counter cho ID
  }

  /**
   * Initialize the batch converter
   */
  init() {
    this.view = document.getElementById(this.viewId);
    if (!this.view) {
      return;
    }
    this.attachEventListeners();
  }



  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Back button
    const backBtn = document.getElementById('batchBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.hide());
    }

    // Upload zone
    const uploadZone = document.getElementById('batchUploadZone');
    const fileInput = document.getElementById('batchFileInput');

    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      this.handleFileSelect(e.dataTransfer.files);
    });

    // Option selection
    document.querySelectorAll('.batch-option-card').forEach(card => {
      card.addEventListener('click', () => this.selectOption(card.dataset.option));
    });

    // Clear all
    document.getElementById('batchClearAll').addEventListener('click', () => this.clearAll());

    // Start conversion
    document.getElementById('batchStart').addEventListener('click', () => this.startConversion());

    // Download all
    document.getElementById('batchDownload').addEventListener('click', () => this.downloadAll());
  }

  /**
   * Show batch view
   */
  show() {
    // Check if batch converter is unlocked
    if (window.donateModal && !window.donateModal.checkBatchAccess()) {
      return; // Modal will be shown by checkBatchAccess
    }
    
    // Hide canvas area
    const canvasArea = document.getElementById('canvasArea');
    if (canvasArea) {
      canvasArea.style.display = 'none';
    }
    
    // Hide top toolbar
    const topToolbar = document.getElementById('topToolbar');
    if (topToolbar) {
      topToolbar.style.display = 'none';
    }
    
    // Show batch view
    if (this.view) {
      this.view.classList.add('active');
    }
    
    this.reset();
  }

  /**
   * Hide batch view
   */
  hide() {
    if (this.isProcessing) {
      ErrorHandler.confirm(
        'Processing in progress. Are you sure you want to cancel?',
        'Confirm Cancel',
        () => this.doHide(),
        null
      );
      return;
    }
    this.doHide();
  }

  /**
   * Actually hide the view
   */
  doHide() {
    
    // Show canvas area
    const canvasArea = document.getElementById('canvasArea');
    if (canvasArea) {
      canvasArea.style.display = 'flex';
    }
    
    // Show top toolbar
    const topToolbar = document.getElementById('topToolbar');
    if (topToolbar) {
      topToolbar.style.display = 'flex';
    }
    
    // Hide batch view
    if (this.view) {
      this.view.classList.remove('active');
    }
    
    this.reset();
  }

  /**
   * Reset state
   */
  reset() {
    this.images = [];
    this.processedCount = 0;
    this.isProcessing = false;
    this.nextId = 1; // Reset ID counter
    
    // Reset UI elements
    document.getElementById('batchProgress').style.display = 'none';
    document.getElementById('batchDownload').style.display = 'none';
    document.getElementById('batchStart').style.display = 'flex';
    
    this.updateUI();
  }

  /**
   * Handle file selection
   */
  handleFileSelect(files) {
    const fileArray = Array.from(files);
    
    // Limit to 50 images
    if (this.images.length + fileArray.length > 50) {
      ErrorHandler.showWarning('Maximum 50 images. Please select fewer images.');
      return;
    }

    // Filter valid images
    const validFiles = fileArray.filter(file => {
      return file.type.match(/^image\/(jpeg|png|bmp)$/);
    });

    if (validFiles.length === 0) {
      ErrorHandler.showWarning('No valid images. Please select JPG, PNG or BMP.');
      return;
    }

    // Add images
    validFiles.forEach(file => {
      const id = this.nextId++;
      this.images.push({
        id,
        file,
        status: 'pending', // pending, processing, completed, error
        result: null,
        preview: null
      });

      // Create preview
      this.createPreview(id, file);
    });

    this.updateUI();
  }

  /**
   * Create image preview
   */
  createPreview(id, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = this.images.find(img => img.id === id);
      if (image) {
        image.preview = e.target.result;
        this.renderImages();
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Select conversion option
   */
  selectOption(option) {
    this.selectedOption = option;
    document.querySelectorAll('.batch-option-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.option === option);
    });
  }

  /**
   * Clear all images
   */
  clearAll() {
    ErrorHandler.confirm(
      'Are you sure you want to clear all images?',
      'Confirm Clear',
      () => {
        this.images = [];
        this.processedCount = 0;
        
        // Reset UI elements
        document.getElementById('batchProgress').style.display = 'none';
        document.getElementById('batchDownload').style.display = 'none';
        document.getElementById('batchStart').style.display = 'flex';
        
        this.updateUI();
      }
    );
  }

  /**
   * Remove single image
   */
  removeImage(id) {
    this.images = this.images.filter(img => img.id !== id);
    this.updateUI();
  }

  /**
   * Update UI
   */
  updateUI() {
    const hasImages = this.images.length > 0;
    const hasCompleted = this.images.some(img => img.status === 'completed');
    
    document.getElementById('batchOptions').style.display = hasImages ? 'block' : 'none';
    document.getElementById('batchImagesList').style.display = hasImages ? 'block' : 'none';
    document.getElementById('batchImagesCount').textContent = this.images.length;
    
    // Show Start or Download button depending on status
    if (hasCompleted && !this.isProcessing) {
      document.getElementById('batchStart').style.display = 'none';
      document.getElementById('batchDownload').style.display = 'flex';
    } else {
      document.getElementById('batchStart').style.display = 'flex';
      document.getElementById('batchStart').disabled = !hasImages || this.isProcessing;
      document.getElementById('batchDownload').style.display = 'none';
    }

    this.renderImages();
  }

  /**
   * Render images grid
   */
  renderImages() {
    const grid = document.getElementById('batchImagesGrid');
    
    if (this.images.length === 0) {
      grid.innerHTML = '<div class="batch-empty-state"><img src="lucide/image.svg" width="48" height="48" alt="empty"><div>No images yet</div></div>';
      return;
    }

    grid.innerHTML = this.images.map(img => `
      <div class="batch-image-item" data-id="${img.id}">
        ${img.preview ? `<img src="${img.preview}" class="batch-image-preview" alt="${img.file.name}">` : ''}
        <div class="batch-image-name" title="${img.file.name}">${img.file.name}</div>
        ${img.status !== 'pending' ? `<div class="batch-image-status ${img.status}">${this.getStatusText(img.status)}</div>` : ''}
        <button class="batch-image-remove" data-image-id="${img.id}">
          <img src="lucide/x.svg" width="16" height="16" alt="remove">
        </button>
      </div>
    `).join('');
    
    // Attach event listeners to remove buttons
    grid.querySelectorAll('.batch-image-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault();
        const imageId = parseInt(btn.getAttribute('data-image-id'));
        this.removeImage(imageId);
      });
    });
  }

  /**
   * Get status text
   */
  getStatusText(status) {
    const texts = {
      processing: 'Processing...',
      completed: 'Completed',
      error: 'Error'
    };
    return texts[status] || '';
  }

  /**
   * Start conversion
   */
  async startConversion() {
    this.isProcessing = true;
    this.processedCount = 0;
    
    document.getElementById('batchProgress').style.display = 'block';
    document.getElementById('batchStart').style.display = 'none';
    
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      image.status = 'processing';
      this.renderImages();
      
      try {
        if (this.selectedOption === 'embed') {
          image.result = await this.embedImage(image.file);
        } else {
          image.result = await this.vectorizeImage(image.file);
        }
        image.status = 'completed';
      } catch (error) {
        image.status = 'error';
      }
      
      this.processedCount++;
      this.updateProgress();
      this.renderImages();
    }
    
    this.isProcessing = false;
    document.getElementById('batchProgress').style.display = 'none';
    document.getElementById('batchDownload').style.display = 'flex';
  }

  /**
   * Update progress
   */
  updateProgress() {
    const percentage = Math.round((this.processedCount / this.images.length) * 100);
    document.getElementById('batchProgressPercentage').textContent = `${percentage}%`;
    document.getElementById('batchProgressBar').style.width = `${percentage}%`;
    document.getElementById('batchProgressText').textContent = `Processing ${this.processedCount}/${this.images.length}...`;
  }

  /**
   * Embed image (wrap in SVG)
   */
  async embedImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  <image width="${img.width}" height="${img.height}" xlink:href="${e.target.result}"/>
</svg>`;
          resolve(svg);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Vectorize image
   */
  async vectorizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Use ImageTracer
            ImageTracer.imageToSVG(
              img.src,
              (svgstr) => resolve(svgstr),
              {
                ltres: 1,
                qtres: 1,
                pathomit: 8,
                colorsampling: 2,
                numberofcolors: 16,
                mincolorratio: 0.02,
                colorquantcycles: 3,
                scale: 1,
                strokewidth: 1,
                linefilter: true,
                desc: false
              }
            );
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Download all results as ZIP
   */
  async downloadAll() {
    try {
      // Count completed files
      const completedImages = this.images.filter(img => img.status === 'completed' && img.result);
      
      if (completedImages.length === 0) {
        ErrorHandler.showWarning('No files to download');
        return;
      }
      
      // Check if JSZip is available
      if (!window.JSZip) {
        ErrorHandler.showError('JSZip library not loaded. Please reload the page.');
        return;
      }
      
      // Show creating ZIP message
      ErrorHandler.showInfo(`Creating ZIP file with ${completedImages.length} files...`);
      
      const zip = new window.JSZip();
      
      // Add completed images to zip
      completedImages.forEach(img => {
        const fileName = img.file.name.replace(/\.[^/.]+$/, '') + '.svg';
        zip.file(fileName, img.result);
      });
      
      // Generate and download zip
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `svgify-batch-${timestamp}.zip`;
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Free memory
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
      
      ErrorHandler.showSuccess(`Downloaded ${completedImages.length} SVG files in ${fileName}`);
      
    } catch (error) {
      ErrorHandler.showError('Cannot create ZIP file. Please try again.');
    }
  }

}
