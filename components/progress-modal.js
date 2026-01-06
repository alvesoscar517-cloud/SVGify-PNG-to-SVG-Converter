/**
 * ProgressModal Component
 * Displays progress during vectorization process
 */
class ProgressModal {
  constructor(modalId = 'progressModal') {
    this.modal = document.getElementById(modalId);
    if (!this.modal) {
      throw new Error(`Modal with id "${modalId}" not found`);
    }
    
    this.stageElement = document.getElementById('progressStage');
    this.barElement = document.getElementById('progressBar');
    this.percentageElement = document.getElementById('progressPercentage');
    
    this.stages = [
      'Color quantization...',
      'Separating bitmap layers...',
      'Tracing edges...',
      'Optimizing curves...',
      'Complete!'
    ];
    
    this.currentStage = 0;
    this.progress = 0;
  }
  
  /**
   * Show the progress modal
   */
  show() {
    this.modal.style.display = 'flex';
    this.reset();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Hide the progress modal
   */
  hide() {
    this.modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  /**
   * Update progress bar and stage text
   * @param {number} stage - Stage index (0-4)
   * @param {number} percentage - Progress percentage (0-100)
   */
  updateProgress(stage, percentage) {
    this.currentStage = stage;
    this.progress = Math.min(100, Math.max(0, percentage));
    
    // Update stage text
    if (this.stageElement && stage < this.stages.length) {
      this.stageElement.textContent = this.stages[stage];
    }
    
    // Update progress bar
    if (this.barElement) {
      this.barElement.style.width = `${this.progress}%`;
    }
    
    // Update percentage text
    if (this.percentageElement) {
      this.percentageElement.textContent = `${Math.round(this.progress)}%`;
    }
  }
  
  /**
   * Set stage by name
   * @param {string} stageName - Name of the stage
   * @param {number} percentage - Progress percentage
   */
  setStage(stageName, percentage = 0) {
    const stageIndex = this.stages.indexOf(stageName);
    if (stageIndex !== -1) {
      this.updateProgress(stageIndex, percentage);
    } else {
      // Custom stage name
      if (this.stageElement) {
        this.stageElement.textContent = stageName;
      }
      if (this.barElement) {
        this.barElement.style.width = `${percentage}%`;
      }
      if (this.percentageElement) {
        this.percentageElement.textContent = `${Math.round(percentage)}%`;
      }
    }
  }
  
  /**
   * Reset progress to initial state
   */
  reset() {
    this.currentStage = 0;
    this.progress = 0;
    this.updateProgress(0, 0);
  }
  
  /**
   * Show completion state
   */
  showComplete() {
    this.updateProgress(4, 100);
    
    // Auto-hide after a short delay
    setTimeout(() => {
      this.hide();
    }, 800);
  }
  
  /**
   * Show error state
   * @param {string} errorMessage - Error message to display
   */
  showError(errorMessage) {
    if (this.stageElement) {
      this.stageElement.textContent = `❌ ${errorMessage}`;
      this.stageElement.style.color = '#ef4444';
    }
    
    // Reset color after hiding
    setTimeout(() => {
      if (this.stageElement) {
        this.stageElement.style.color = '';
      }
    }, 3000);
  }
  
  /**
   * Get current progress percentage
   */
  getProgress() {
    return this.progress;
  }
  
  /**
   * Get current stage index
   */
  getCurrentStage() {
    return this.currentStage;
  }
}
