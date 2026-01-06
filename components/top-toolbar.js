/**
 * TopToolbar Component
 * Manages the top toolbar with canvas control actions
 */
class TopToolbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    
    this.actions = [
      { 
        id: 'undo', 
        icon: 'undo', 
        tooltip: 'Undo (Ctrl+Z)',
        enabled: false
      },
      { 
        id: 'redo', 
        icon: 'redo', 
        tooltip: 'Redo (Ctrl+Y)',
        enabled: false
      },
      { type: 'separator' },
      { 
        id: 'zoom-in', 
        icon: 'zoom-in', 
        tooltip: 'Zoom In',
        enabled: false
      },
      { 
        id: 'zoom-out', 
        icon: 'zoom-out', 
        tooltip: 'Zoom Out',
        enabled: false
      },
      { 
        id: 'fit-screen', 
        icon: 'maximize', 
        tooltip: 'Fit to Screen',
        enabled: false
      }
    ];
    
    this.state = {
      canUndo: false,
      canRedo: false,
      hasImage: false
    };
  }
  
  /**
   * Render the toolbar with action buttons
   */
  render() {
    // Icons already in HTML, no need to render
  }
  
  /**
   * Attach event listeners to toolbar buttons
   */
  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('.toolbar-btn');
      if (!button || button.disabled) return;
      
      const action = button.getAttribute('data-action');
      if (!action) return;
      
      // Dispatch custom event for the action
      const event = new CustomEvent('toolbarAction', {
        detail: { action },
        bubbles: true
      });
      
      document.dispatchEvent(event);
    });
  }
  
  /**
   * Update toolbar button states
   */
  updateState(canUndo, canRedo, hasImage = null) {
    this.state.canUndo = canUndo;
    this.state.canRedo = canRedo;
    
    if (hasImage !== null) {
      this.state.hasImage = hasImage;
    }
    
    // Update undo button
    const undoBtn = document.getElementById('toolbar-undo');
    if (undoBtn) {
      undoBtn.disabled = !this.state.canUndo;
    }
    
    // Update redo button
    const redoBtn = document.getElementById('toolbar-redo');
    if (redoBtn) {
      redoBtn.disabled = !this.state.canRedo;
    }
    
    // Update zoom buttons based on whether image is loaded
    const zoomInBtn = document.getElementById('toolbar-zoom-in');
    const zoomOutBtn = document.getElementById('toolbar-zoom-out');
    const fitScreenBtn = document.getElementById('toolbar-fit-screen');
    
    if (zoomInBtn) zoomInBtn.disabled = !this.state.hasImage;
    if (zoomOutBtn) zoomOutBtn.disabled = !this.state.hasImage;
    if (fitScreenBtn) fitScreenBtn.disabled = !this.state.hasImage;
  }
  
  /**
   * Enable or disable a specific action button
   */
  setActionEnabled(actionId, enabled) {
    const button = document.getElementById(`toolbar-${actionId}`);
    if (button) {
      button.disabled = !enabled;
    }
  }
  
  /**
   * Initialize the toolbar
   */
  init() {
    this.render();
    this.attachEventListeners();
    this.updateState(false, false, false);
  }
}
