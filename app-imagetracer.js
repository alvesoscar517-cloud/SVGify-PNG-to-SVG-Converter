/**
 * Main Application (ImageTracer Edition)
 */

// Application State
const AppState = {
  currentImage: null,
  currentSVG: null,
  fileName: null,
  svgMode: null // 'embed' or 'vectorize'
};

// Initialize components
let canvasManager, sidebarMenu, topToolbar, progressModal, batchConverter;

// Initialize app
async function initApp() {
  try {
    // Initialize canvas
    canvasManager = new CanvasManager('fabricCanvas');
    canvasManager.init();
    
    // Initialize UI components
    sidebarMenu = new SidebarMenu('sidebarNav');
    sidebarMenu.init();
    
    topToolbar = new TopToolbar('topToolbar');
    topToolbar.init();
    
    progressModal = new ProgressModal('progressModal');
    
    // Initialize batch converter
    batchConverter = new BatchConverter('batchView');
    batchConverter.init();
    
    // Attach event listeners
    attachEventListeners();
    
  } catch (error) {
    ErrorHandler.handle(error, 'Initialization');
  }
}

// Attach event listeners
function attachEventListeners() {
  // Listen for sidebar actions
  document.addEventListener('sidebarAction', (event) => {
    handleSidebarAction(event.detail.action);
  });
  
  // Listen for toolbar actions
  document.addEventListener('toolbarAction', (event) => {
    handleToolbarAction(event.detail.action);
  });
  
  // Listen for canvas history changes
  document.addEventListener('canvasHistoryChange', (event) => {
    const { canUndo, canRedo } = event.detail;
    topToolbar.updateState(canUndo, canRedo, canvasManager.hasImage());
  });
  
  // Listen for image loaded
  document.addEventListener('imageLoaded', (event) => {
    topToolbar.updateState(false, false, true);
  });
}

// Handle toolbar actions
function handleToolbarAction(action) {
  switch (action) {
    case 'undo':
      if (canvasManager.canUndo()) {
        canvasManager.undo();
      }
      break;
    case 'redo':
      if (canvasManager.canRedo()) {
        canvasManager.redo();
      }
      break;
    case 'zoom-in':
      canvasManager.zoomIn();
      break;
    case 'zoom-out':
      canvasManager.zoomOut();
      break;
    case 'fit-screen':
      canvasManager.fitToScreen();
      break;
  }
}

// Handle sidebar actions
async function handleSidebarAction(action) {
  
  try {
    switch (action) {
      case 'upload':
        await handleUpload();
        break;
      case 'embed':
        await handleEmbedImage();
        break;
      case 'vectorize':
        await handleFullVectorize();
        break;
      case 'download':
        await handleDownload();
        break;
      case 'batch':
        handleBatch();
        break;
      case 'clear':
        handleClear();
        break;
    }
  } catch (error) {
    ErrorHandler.handle(error, action);
  }
}

// Handle upload - show file picker directly
async function handleUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      AppState.fileName = file.name;
      
      // Load image using canvasManager
      await canvasManager.loadImage(file);
      
      // Enable embed and vectorize buttons
      sidebarMenu.setToolEnabled('embed', true);
      sidebarMenu.setToolEnabled('vectorize', true);
      
      // Enable toolbar zoom buttons
      topToolbar.updateState(false, false, true);
      
    } catch (error) {
      ErrorHandler.handle(error, 'Upload');
    }
  };
  
  input.click();
}



// Handle embed image (wrap PNG in SVG)
async function handleEmbedImage() {
  try {
    // Show progress modal
    progressModal.show();
    progressModal.updateProgress('Creating SVG...', 50);
    
    // Get image as data URL
    const imageDataURL = canvasManager.getImageDataURL();
    if (!imageDataURL) {
      throw new ProcessingError('Cannot get image data');
    }
    
    // Get image dimensions
    const imageData = canvasManager.getImageData();
    const width = imageData.width;
    const height = imageData.height;
    
    // Create SVG with embedded image
    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>Embedded Image</title>
  <image width="${width}" height="${height}" xlink:href="${imageDataURL}"/>
</svg>`;
    
    progressModal.updateProgress('Displaying result...', 80);
    
    // Store result
    AppState.currentSVG = svg;
    AppState.svgMode = 'embed';
    
    // Display SVG result on canvas
    await displaySVGResult(svg);
    
    progressModal.updateProgress('Complete!', 100);
    
    // Show completion
    progressModal.showComplete();
    
    // Enable download button
    sidebarMenu.setToolEnabled('download', true);
    
    // Show success message
    setTimeout(() => {
      ErrorHandler.showSuccess('SVG created with embedded image! You can download it now.', 3000);
    }, 1000);
    
  } catch (error) {
    progressModal.hide();
    throw error;
  }
}

// Handle full vectorization - Smooth image BEFORE vectorizing
async function handleFullVectorize() {
  try {
    // Get image data
    let imageData = canvasManager.getImageData();
    if (!imageData) {
      throw new ProcessingError('Cannot get image data');
    }
    
    // Show progress modal
    progressModal.show();
    progressModal.updateProgress('Processing...', 30);
    
    if (!window.ImageTracerPro) {
      throw new ProcessingError('ImageTracer not loaded');
    }
    
    progressModal.updateProgress('Vectorizing...', 50);
    const svg = await window.ImageTracerPro.vectorize(imageData);
    
    progressModal.updateProgress('Displaying result...', 85);
    
    // Store result
    AppState.currentSVG = svg;
    AppState.svgMode = 'vectorize';
    
    // Display SVG result on canvas
    await displaySVGResult(svg);
    
    progressModal.updateProgress('Complete!', 100);
    
    // Show completion
    progressModal.showComplete();
    
    // Enable download button
    sidebarMenu.setToolEnabled('download', true);
    
    // Show success message
    setTimeout(() => {
      ErrorHandler.showSuccess('Vectorization successful! You can download the SVG now.', 3000);
    }, 1000);
    
  } catch (error) {
    progressModal.hide();
    throw error;
  }
}

// Handle download
async function handleDownload() {
  if (!AppState.currentSVG) {
    ErrorHandler.showWarning('No SVG to download');
    return;
  }
  
  try {
    const exporter = new SVGExporter();
    
    // Generate filename based on mode
    const baseName = AppState.fileName 
      ? AppState.fileName.replace(/\.[^/.]+$/, '') 
      : 'image';
    
    const suffix = AppState.svgMode === 'embed' ? 'embedded' : 'vectorized';
    const filename = `${baseName}-${suffix}.svg`;
    
    // Download
    exporter.download(AppState.currentSVG, filename);
    
  } catch (error) {
    ErrorHandler.handle(error, 'Download');
  }
}

// Display SVG result on canvas - Simplified
async function displaySVGResult(svgString) {
  try {
    // Create blob from SVG
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Load SVG into fabric canvas
    await new Promise((resolve, reject) => {
      fabric.loadSVGFromURL(url, (objects, options) => {
        try {
          if (!objects || objects.length === 0) {
            throw new Error('Cannot load SVG');
          }
          
          // Clear canvas
          canvasManager.canvas.clear();
          canvasManager.canvas.backgroundColor = '#ffffff';
          
          // Create group from SVG objects
          const svgGroup = fabric.util.groupSVGElements(objects, options);
          
          // Set as selectable and editable
          svgGroup.set({
            left: canvasManager.canvas.width / 2,
            top: canvasManager.canvas.height / 2,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true
          });
          
          // Add to canvas
          canvasManager.canvas.add(svgGroup);
          
          // Update currentImage reference for zoom/pan to work
          canvasManager.currentImage = svgGroup;
          
          // Fit to screen
          canvasManager.fitToViewport(svgGroup);
          
          // Save state for undo/redo
          canvasManager.history = [];
          canvasManager.historyIndex = -1;
          canvasManager.saveState();
          
          // Render
          canvasManager.canvas.renderAll();
          
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(url);
        }
      });
    });
    
  } catch (error) {
    // Don't throw error to avoid interrupting the process
    ErrorHandler.showWarning('Cannot display SVG on canvas, but you can still download it');
  }
}

// Handle batch converter
function handleBatch() {
  batchConverter.show();
}

// Handle clear
function handleClear() {
  canvasManager.clear();
  AppState.currentImage = null;
  AppState.currentSVG = null;
  AppState.fileName = null;
  AppState.svgMode = null;
  
  sidebarMenu.setToolEnabled('embed', false);
  sidebarMenu.setToolEnabled('vectorize', false);
  sidebarMenu.setToolEnabled('download', false);
  
  // Disable toolbar buttons
  topToolbar.updateState(false, false, false);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initApp);
