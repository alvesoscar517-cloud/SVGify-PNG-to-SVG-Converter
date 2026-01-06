/**
 * SVGify - Main Application Controller
 * Advanced Image Vectorization Tool
 */

// Application State
const AppState = {
  currentImage: null,
  currentSVG: null,
  isProcessing: false,
  fileName: null
};

// Component Instances
let sidebarMenu;
let topToolbar;
let paletteSelector;
let progressModal;
let canvasManager;

/**
 * Initialize Application
 */
function initializeApp() {
  try {
    // Initialize Error Handler
    ErrorHandler.init();
    
    // Initialize UI Components
    sidebarMenu = new SidebarMenu('sidebarNav');
    sidebarMenu.init();
    
    topToolbar = new TopToolbar('topToolbar');
    topToolbar.init();
    
    paletteSelector = new PaletteSelector('palettePanel');
    paletteSelector.init();
    
    progressModal = new ProgressModal('progressModal');
    
    // Initialize Canvas Manager
    canvasManager = new CanvasManager('fabricCanvas');
    canvasManager.init();
    
    // Attach Event Listeners
    attachEventListeners();
    
    // Setup Keyboard Shortcuts
    setupKeyboardShortcuts();
    
  } catch (error) {
    ErrorHandler.handle(error, 'Application Initialization');
  }
}

/**
 * Attach Event Listeners
 */
function attachEventListeners() {
  // Sidebar Actions
  document.addEventListener('sidebarAction', handleSidebarAction);
  
  // Toolbar Actions
  document.addEventListener('toolbarAction', handleToolbarAction);
  
  // Canvas History Changes
  document.addEventListener('canvasHistoryChange', handleHistoryChange);
  
  // Image Loaded
  document.addEventListener('imageLoaded', handleImageLoaded);
  
  // Canvas Cleared
  document.addEventListener('canvasCleared', handleCanvasCleared);
  
  // Palette Change
  document.addEventListener('paletteChange', handlePaletteChange);
}

/**
 * Handle Sidebar Actions
 */
function handleSidebarAction(event) {
  const { action } = event.detail;
  
  switch (action) {
    case 'upload':
      handleUpload();
      break;
    case 'vectorize':
      handleVectorize();
      break;
    case 'showPalette':
      handleShowPalette();
      break;
    case 'download':
      handleDownload();
      break;
    case 'clear':
      handleClear();
      break;
  }
}

/**
 * Handle Toolbar Actions
 */
function handleToolbarAction(event) {
  const { action } = event.detail;
  
  switch (action) {
    case 'undo':
      canvasManager.undo();
      break;
    case 'redo':
      canvasManager.redo();
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

/**
 * Handle Upload Action
 */
function handleUpload() {
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/bmp,image/gif';
  
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Validate file
      ErrorHandler.validateFile(file);
      
      // Load image to canvas
      await canvasManager.loadImage(file);
      
      AppState.currentImage = file;
      AppState.fileName = file.name;
      
      // Enable vectorize button
      sidebarMenu.setToolEnabled('vectorize', true);
      
    } catch (error) {
      ErrorHandler.handle(error, 'Image Upload');
    }
  };
  
  fileInput.click();
}

/**
 * Handle Image Loaded Event
 */
function handleImageLoaded(event) {
  const { width, height, fileName } = event.detail;
  
  // Update toolbar state
  topToolbar.updateState(false, false, true);
  
  // Enable vectorize tool
  sidebarMenu.setToolEnabled('vectorize', true);
}

/**
 * Handle Vectorize Action
 */
async function handleVectorize() {
  if (AppState.isProcessing) {
    return;
  }
  
  if (!canvasManager.hasImage()) {
    ErrorHandler.showWarning('Please upload an image first');
    return;
  }
  
  try {
    AppState.isProcessing = true;
    
    // Get image data
    const imageData = canvasManager.getImageData();
    if (!imageData) {
      throw new ProcessingError('Cannot get image data');
    }
    
    // Get selected color count
    const colorCount = paletteSelector.getSelectedCount();
    
    // Show progress modal
    progressModal.show();
    
    // Create pipeline with progress callback
    const pipeline = new VectorizationPipeline((stage, percentage) => {
      progressModal.updateProgress(stage, percentage);
    });
    
    // Process image
    const svg = await pipeline.process(imageData, colorCount);
    
    // Store result
    AppState.currentSVG = svg;
    
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
    ErrorHandler.handle(error, 'Vectorization');
  } finally {
    AppState.isProcessing = false;
  }
}

/**
 * Handle Show Palette Action
 */
function handleShowPalette() {
  paletteSelector.toggle();
}

/**
 * Handle Palette Change
 */
function handlePaletteChange(event) {
  const { colorCount } = event.detail;
}

/**
 * Handle Download Action
 */
function handleDownload() {
  if (!AppState.currentSVG) {
    ErrorHandler.showWarning('No SVG to download. Please vectorize an image first.');
    return;
  }
  
  try {
    const exporter = new SVGExporter();
    
    // Generate filename
    const baseName = AppState.fileName 
      ? AppState.fileName.replace(/\.[^/.]+$/, '') 
      : 'vectorized';
    const filename = `${baseName}-vectorized.svg`;
    
    // Download
    exporter.download(AppState.currentSVG, filename);
    
  } catch (error) {
    ErrorHandler.handle(error, 'Download');
  }
}

/**
 * Handle Clear Action
 */
function handleClear() {
  ErrorHandler.confirm(
    'Are you sure you want to clear everything and start over?',
    'Confirm Clear',
    () => {
      canvasManager.clear();
      
      AppState.currentImage = null;
      AppState.currentSVG = null;
      AppState.fileName = null;
      
      // Disable tools
      sidebarMenu.setToolEnabled('vectorize', false);
      sidebarMenu.setToolEnabled('download', false);
      
      // Hide palette
      paletteSelector.hide();
    }
  );
}

/**
 * Handle Canvas Cleared Event
 */
function handleCanvasCleared() {
  topToolbar.updateState(false, false, false);
}

/**
 * Handle History Change
 */
function handleHistoryChange(event) {
  const { canUndo, canRedo } = event.detail;
  topToolbar.updateState(canUndo, canRedo, canvasManager.hasImage());
}

/**
 * Setup Keyboard Shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z - Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canvasManager.canUndo()) {
        canvasManager.undo();
      }
    }
    
    // Ctrl+Y or Ctrl+Shift+Z - Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      if (canvasManager.canRedo()) {
        canvasManager.redo();
      }
    }
    
    // Ctrl+O - Open file
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      handleUpload();
    }
    
    // Ctrl+S - Download SVG
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (AppState.currentSVG) {
        handleDownload();
      }
    }
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
