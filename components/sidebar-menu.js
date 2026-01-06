/**
 * SidebarMenu Component
 * Manages the sidebar navigation with tool icons and actions
 */
class SidebarMenu {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    
    this.tools = [
      { 
        id: 'upload', 
        icon: 'upload', 
        label: 'Upload Image', 
        action: 'upload',
        tooltip: 'Upload JPG, PNG images for vectorization'
      },
      { 
        id: 'vectorize', 
        icon: 'wand-sparkles', 
        label: 'Vectorize', 
        action: 'vectorize',
        tooltip: 'Automatically convert image to SVG vector'
      },
      { 
        id: 'download', 
        icon: 'download', 
        label: 'Download SVG', 
        action: 'download',
        tooltip: 'Download vectorized SVG file'
      },
      { 
        id: 'clear', 
        icon: 'trash-2', 
        label: 'Clear Canvas', 
        action: 'clear',
        tooltip: 'Clear all and start over'
      }
    ];
    
    this.activeToolId = null;
  }
  
  /**
   * Render the sidebar menu with Lucide icons
   */
  render() {
    // Icons already in HTML, no need to render
  }
  
  /**
   * Attach event listeners to tool buttons
   */
  attachEventListeners() {
    // Handle info icon clicks separately
    document.querySelectorAll('.sidebar-info-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Don't show tooltip on click, only on hover
        return false;
      });
      
      icon.addEventListener('mouseenter', () => {
        this.showInfoTooltip(icon);
      });
      
      icon.addEventListener('mouseleave', () => {
        this.hideInfoTooltip();
      });
    });
    
    // Handle button clicks
    this.container.addEventListener('click', (e) => {
      // Ignore if clicking on info icon
      if (e.target.closest('.sidebar-info-icon')) {
        return;
      }
      
      const button = e.target.closest('.sidebar-nav-item');
      if (!button) return;
      
      const action = button.getAttribute('data-action');
      if (!action) return;
      
      // Dispatch custom event for the action
      const event = new CustomEvent('sidebarAction', {
        detail: { action },
        bubbles: true
      });
      
      document.dispatchEvent(event);
    });
  }
  
  /**
   * Show info tooltip
   */
  showInfoTooltip(iconElement) {
    const infoType = iconElement.getAttribute('data-info');
    
    const tooltips = {
      embed: 'Embed PNG image into SVG (fast, preserves original quality). Suitable when you want to quickly get an SVG file.',
      vectorize: 'Convert to true vector (editable, infinitely scalable). Suitable for logos, icons, and graphics that need editing.'
    };
    
    const text = tooltips[infoType];
    if (!text) return;
    
    // Remove existing tooltip
    this.hideInfoTooltip();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'info-tooltip';
    tooltip.textContent = text;
    tooltip.id = 'active-info-tooltip';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = iconElement.getBoundingClientRect();
    tooltip.style.left = (rect.right + 10) + 'px';
    tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';
  }
  
  /**
   * Hide info tooltip
   */
  hideInfoTooltip() {
    const tooltip = document.getElementById('active-info-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  /**
   * Set active tool (visual feedback)
   */
  setActiveTool(toolId) {
    // Remove active class from all tools
    const allButtons = this.container.querySelectorAll('.sidebar-nav-item');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected tool
    if (toolId) {
      const activeButton = document.getElementById(`tool-${toolId}`);
      if (activeButton) {
        activeButton.classList.add('active');
        this.activeToolId = toolId;
      }
    }
  }
  
  /**
   * Enable or disable a specific tool
   */
  setToolEnabled(toolId, enabled) {
    const button = document.getElementById(`tool-${toolId}`);
    if (button) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? '1' : '0.5';
      button.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  }
  
  /**
   * Initialize the sidebar menu
   */
  init() {
    this.render();
    this.attachEventListeners();
    
    // Initially disable embed, vectorize and download tools
    this.setToolEnabled('embed', false);
    this.setToolEnabled('vectorize', false);
    this.setToolEnabled('download', false);
  }
}
