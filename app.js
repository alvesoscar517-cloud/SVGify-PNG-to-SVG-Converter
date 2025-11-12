// ============================================
// SVGIFY - IMAGE TO VECTOR CONVERTER
// Bitmap to Vector Converter - Chrome Extension
// ============================================

console.log('🚀 SVGify Loading...');

// Application State
const state = {
  results: [], // Array of converted results
  batchFiles: [],
  batchResults: [],
  conversionCount: 0,
  donateModalShown: false
};

// Optimized SVG Settings - Balance between quality and simplicity
const HIGH_QUALITY_OPTIONS = {
  // Thresholds for smooth curves
  ltres: 1,
  qtres: 1,
  
  // Path simplification
  pathomit: 8,
  
  // Color settings - reduced to avoid too many layers
  colorsampling: 2,
  numberofcolors: 16,
  mincolorratio: 0.02,
  colorquantcycles: 3,
  
  // Blur for smoothing
  blurradius: 5,
  blurdelta: 20,
  
  // Layering
  layering: 0,
  
  // No stroke
  strokewidth: 0,
  
  // Line filter for smoothing
  linefilter: true,
  
  // Scaling
  scale: 1,
  roundcoords: 1,
  
  // Output
  viewbox: true,
  desc: false,
  
  // Enhanced options
  rightangleenhance: true
};

// Simple Gaussian blur for smoothing
function applyGaussianBlur(ctx, width, height, radius) {
  // Use canvas built-in filter for performance
  ctx.filter = `blur(${radius}px)`;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';
  ctx.drawImage(tempCanvas, 0, 0);
}

// SVG optimization - add smoothing attributes
function optimizeSVG(svgString) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.documentElement;
    
    // Add shape-rendering for smooth curves
    svg.setAttribute('shape-rendering', 'geometricPrecision');
    
    // Get all path elements and add smoothing
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
      path.setAttribute('shape-rendering', 'geometricPrecision');
    });
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  } catch (error) {
    console.warn('SVG optimization failed:', error);
    return svgString;
  }
}

// Initialize Libraries
function initializeLibraries() {
  const libs = {
    ImageTracer: typeof ImageTracer !== 'undefined',
    FileSaver: typeof saveAs !== 'undefined',
    Lucide: typeof lucide !== 'undefined'
  };
  
  console.log('Libraries Status:', libs);
  
  const allLoaded = Object.values(libs).every(v => v);
  if (!allLoaded) {
    console.warn('Some libraries failed to load:', libs);
  }
  
  return allLoaded;
}

initializeLibraries();

// DOM Elements Cache - will be initialized after DOM loads
const el = {};

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.dataset.view + '-view';
      navItems.forEach(nav => nav.classList.remove('active'));
      views.forEach(view => view.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(viewId).classList.add('active');
    });
  });

  // Upload zone
  if (el.uploadZone) {
    el.uploadZone.addEventListener('click', () => el.fileInput.click());
    el.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.uploadZone.classList.add('dragover');
    });
    el.uploadZone.addEventListener('dragleave', () => {
      el.uploadZone.classList.remove('dragover');
    });
    el.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      el.uploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    });
  }

  // File input
  if (el.fileInput) {
    el.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageUpload(file);
    });
  }



  // Batch processing
  if (el.selectBatchFiles) {
    el.selectBatchFiles.addEventListener('click', () => el.batchFileInput.click());
  }

  if (el.batchFileInput) {
    el.batchFileInput.addEventListener('change', (e) => {
      state.batchFiles = Array.from(e.target.files);
      renderBatchFileList();
      if (el.startBatchProcess) {
        el.startBatchProcess.disabled = state.batchFiles.length === 0;
      }
    });
  }

  if (el.clearBatch) {
    el.clearBatch.addEventListener('click', () => {
      state.batchFiles = [];
      state.batchResults = [];
      el.batchFileList.innerHTML = '<p style="text-align: center; padding: 24px; color: #94a3b8;">No files selected</p>';
      el.batchControls.style.display = 'none';
      el.downloadAllBatch.style.display = 'none';
      el.batchProgress.style.display = 'none';
      el.batchFileInput.value = '';
    });
  }

  if (el.startBatchProcess) {
    el.startBatchProcess.addEventListener('click', async () => {
      if (state.batchFiles.length === 0) return;

      el.batchProgress.style.display = 'block';
      el.startBatchProcess.disabled = true;
      state.batchResults = [];

      const items = el.batchFileList.querySelectorAll('.batch-file-item');

      for (let i = 0; i < state.batchFiles.length; i++) {
        const file = state.batchFiles[i];
        const item = items[i];
        const status = item.querySelector('.batch-file-status');

        status.textContent = 'Processing';
        status.className = 'batch-file-status processing';

        try {
          const result = await processBatchFile(file);
          state.batchResults.push(result);
          
          status.textContent = 'Done';
          status.className = 'batch-file-status completed';
        } catch (error) {
          status.textContent = 'Error';
          status.className = 'batch-file-status error';
        }

        const progress = ((i + 1) / state.batchFiles.length) * 100;
        el.batchProgressFill.style.width = `${progress}%`;
        el.batchProgressText.textContent = `${i + 1}/${state.batchFiles.length}`;
      }

      el.startBatchProcess.disabled = false;
      el.downloadAllBatch.style.display = 'block';
    });
  }

  if (el.downloadAllBatch) {
    el.downloadAllBatch.addEventListener('click', () => {
      if (state.batchResults.length === 0) return;

      try {
        const zip = new JSZip();
        
        for (const result of state.batchResults) {
          const fileName = result.name.replace(/\.[^/.]+$/, '') + '.svg';
          zip.file(fileName, result.svg);
        }

        zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        }).then(blob => {
          saveAs(blob, `vector-magic-batch-${Date.now()}.zip`);
        }).catch(error => {
          console.error('ZIP creation error:', error);
        });
      } catch (error) {
        console.error('ZIP creation error:', error);
      }
    });
  }

  // Heart button
  if (el.heartButton) {
    el.heartButton.addEventListener('click', () => {
      showDonateModal();
    });
  }

  // Close donate modal
  if (el.closeDonateModal) {
    el.closeDonateModal.addEventListener('click', () => {
      hideDonateModal();
    });
  }

  // Close modal on backdrop click
  if (el.donateModal) {
    el.donateModal.addEventListener('click', (e) => {
      if (e.target === el.donateModal) {
        hideDonateModal();
      }
    });
  }

  console.log('✓ Event listeners setup complete');
}

// ============================================
// CONVERT VIEW
// ============================================

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Show loading overlay
      showLoadingOverlay();
      
      // Start conversion process
      convertImage(img, file.name);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showLoadingOverlay() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Converting...</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

async function convertImage(img, fileName) {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);
    
    // Apply blur for smoothing
    applyGaussianBlur(ctx, canvas.width, canvas.height, 2);
    
    // Get image data and convert to SVG
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let svgString = ImageTracer.imagedataToSVG(imageData, HIGH_QUALITY_OPTIONS);
    
    // Optimize SVG
    svgString = optimizeSVG(svgString);
    
    // Add to results
    const result = {
      id: Date.now(),
      fileName: fileName,
      svg: svgString,
      timestamp: new Date()
    };
    
    state.results.unshift(result); // Add to beginning
    
    // Render result card
    renderResultCard(result);
    
    // Hide loading
    hideLoadingOverlay();
    
    // Re-initialize icons for new card
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Increment conversion count
    state.conversionCount++;
    saveState();
    
    // Show donate modal after 10 conversions (only once)
    if (state.conversionCount === 10 && !state.donateModalShown) {
      setTimeout(() => showDonateModal(), 1000);
    }
    
  } catch (error) {
    console.error('Conversion error:', error);
    hideLoadingOverlay();
  }
}

// Show donate modal
function showDonateModal() {
  if (!el.donateModal) return;
  
  // Update conversion count in modal
  const countEl = document.getElementById('conversionCount');
  const totalEl = document.getElementById('totalConversions');
  if (countEl) countEl.textContent = state.conversionCount;
  if (totalEl) totalEl.textContent = state.conversionCount;
  
  el.donateModal.classList.add('show');
  state.donateModalShown = true;
  saveState();
}

// Hide donate modal
function hideDonateModal() {
  if (!el.donateModal) return;
  el.donateModal.classList.remove('show');
}

function renderResultCard(result) {
  const card = document.createElement('div');
  card.className = 'result-card';
  card.dataset.id = result.id;
  
  card.innerHTML = `
    <div class="result-card-preview">
      ${result.svg}
    </div>
    <div class="result-card-info">
      <div class="result-card-name">${escapeHtml(result.fileName)}</div>
      <div class="result-card-time">${formatTime(result.timestamp)}</div>
    </div>
    <div class="result-card-actions">
      <button class="btn btn-primary btn-download" data-id="${result.id}">
        <i data-lucide="download"></i>
        Download SVG
      </button>
      <button class="btn btn-secondary btn-delete" data-id="${result.id}">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `;
  
  // Add event listeners
  const downloadBtn = card.querySelector('.btn-download');
  const deleteBtn = card.querySelector('.btn-delete');
  
  downloadBtn.addEventListener('click', () => downloadResult(result.id));
  deleteBtn.addEventListener('click', () => deleteResult(result.id));
  
  // Insert at beginning
  el.resultsHistory.insertBefore(card, el.resultsHistory.firstChild);
}

function downloadResult(id) {
  const result = state.results.find(r => r.id === id);
  if (!result) return;
  
  const blob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
  const fileName = result.fileName.replace(/\.[^/.]+$/, '') + '.svg';
  saveAs(blob, fileName);
}

function deleteResult(id) {
  // Remove from state
  state.results = state.results.filter(r => r.id !== id);
  
  // Remove from DOM
  const card = document.querySelector(`.result-card[data-id="${id}"]`);
  if (card) {
    card.remove();
  }
}

function formatTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString('en-US');
}









// ============================================
// BATCH PROCESSING
// ============================================

function renderBatchFileList() {
  el.batchFileList.innerHTML = '';
  
  if (state.batchFiles.length === 0) {
    el.batchFileList.innerHTML = '<p style="text-align: center; padding: 24px; color: #94a3b8;">No files selected</p>';
    el.batchControls.style.display = 'none';
    return;
  }

  el.batchControls.style.display = 'flex';

  state.batchFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement('div');
      item.className = 'batch-file-item';
      item.innerHTML = `
        <img src="${e.target.result}" class="batch-file-preview" alt="${file.name}">
        <div class="batch-file-info">
          <div class="batch-file-name">${escapeHtml(file.name)}</div>
          <div class="batch-file-size">${formatFileSize(file.size)}</div>
        </div>
        <span class="batch-file-status pending">Pending</span>
      `;
      el.batchFileList.appendChild(item);
    };
    reader.onerror = () => {
      console.error('Failed to read file:', file.name);
    };
    reader.readAsDataURL(file);
  });
}



async function processBatchFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Apply blur for smoothing
          applyGaussianBlur(ctx, canvas.width, canvas.height, 2);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Convert with high quality
          let svg = ImageTracer.imagedataToSVG(imageData, HIGH_QUALITY_OPTIONS);
          
          // Optimize SVG
          svg = optimizeSVG(svg);

          resolve({
            name: file.name,
            svg: svg
          });
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}





// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  // Toast disabled
}

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}



// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + O: Open file
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    el.fileInput?.click();
  }
  
  // Ctrl/Cmd + S: Download SVG
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (state.convertedSVG && el.downloadSVG) {
      el.downloadSVG.click();
    }
  }
  
  // Ctrl/Cmd + R: Reconvert
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    if (state.currentImage) {
      convertImage();
    }
  }
  
  // Escape: Clear/Reset
  if (e.key === 'Escape') {
    if (el.comparisonSection?.style.display !== 'none') {
      if (confirm('Xóa ảnh hiện tại?')) {
        el.comparisonSection.style.display = 'none';
        state.currentImage = null;
        state.convertedSVG = null;
      }
    }
  }
});

// ============================================
// PASTE SUPPORT
// ============================================

document.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      e.preventDefault();
      const blob = items[i].getAsFile();
      if (blob) {
        handleImageUpload(blob);
        showToast('✓ Đã dán ảnh từ clipboard', 'success');
      }
      break;
    }
  }
});

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
  // Cache DOM elements
  el.uploadSection = document.getElementById('uploadSection');
  el.uploadZone = document.getElementById('uploadZone');
  el.fileInput = document.getElementById('fileInput');
  el.resultsHistory = document.getElementById('resultsHistory');
  el.selectBatchFiles = document.getElementById('selectBatchFiles');
  el.batchFileInput = document.getElementById('batchFileInput');
  el.batchFileList = document.getElementById('batchFileList');
  el.batchControls = document.getElementById('batchControls');
  el.startBatchProcess = document.getElementById('startBatchProcess');
  el.clearBatch = document.getElementById('clearBatch');
  el.batchProgress = document.getElementById('batchProgress');
  el.batchProgressFill = document.getElementById('batchProgressFill');
  el.batchProgressText = document.getElementById('batchProgressText');
  el.downloadAllBatch = document.getElementById('downloadAllBatch');
  el.toast = document.getElementById('toast');
  el.donateModal = document.getElementById('donateModal');
  el.heartButton = document.getElementById('heartButton');
  el.closeDonateModal = document.getElementById('closeDonateModal');
  
  console.log('✓ DOM Elements cached');
  
  // Load saved state
  loadState();
  
  // Setup all event listeners
  setupEventListeners();
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({ nameAttr: 'data-lucide' });
    console.log('✓ Lucide icons initialized');
  }
  
  console.log('✓ SVGify initialized - High Quality Mode');
}

// Load state from localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('svgify_state');
    if (saved) {
      const data = JSON.parse(saved);
      state.conversionCount = data.conversionCount || 0;
      state.donateModalShown = data.donateModalShown || false;
    }
  } catch (error) {
    console.warn('Failed to load state:', error);
  }
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem('svgify_state', JSON.stringify({
      conversionCount: state.conversionCount,
      donateModalShown: state.donateModalShown
    }));
  } catch (error) {
    console.warn('Failed to save state:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

console.log('✓ Vector Magic Web App Loaded!');
