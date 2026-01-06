/**
 * Donate Modal Component
 * Manages donation modal and batch converter unlock
 */

class DonateModal {
  constructor() {
    this.modal = null;
    this.isUnlocked = this.checkUnlockStatus();
  }

  /**
   * Check if batch converter is unlocked
   */
  checkUnlockStatus() {
    return localStorage.getItem('batchConverterUnlocked') === 'true';
  }

  /**
   * Unlock batch converter
   */
  unlock() {
    localStorage.setItem('batchConverterUnlocked', 'true');
    this.isUnlocked = true;
  }

  /**
   * Initialize donate modal
   */
  init() {
    this.createModal();
    this.attachEventListeners();
  }

  /**
   * Create modal HTML
   */
  createModal() {
    const modalHTML = `
      <div class="donate-modal" id="donateModal">
        <div class="donate-content">
          <div class="donate-header">
            <div class="donate-icon">
              <img src="lucide/heart.svg" width="32" height="32" alt="heart">
            </div>
            <div class="donate-title">Support SVGify</div>
            <div class="donate-subtitle">Pay what you want</div>
          </div>
          
          <div class="donate-body">
            <div class="donate-message">
              <p>SVGify is free and open for everyone. If you find it useful, consider supporting the development!</p>
              <p>Your contribution helps keep this tool free and continuously improved.</p>
            </div>
            
            <div class="donate-stats">
              <div class="donate-stat">
                <span class="donate-stat-value">100%</span>
                <span class="donate-stat-label">Free</span>
              </div>
              <div class="donate-stat">
                <span class="donate-stat-value">∞</span>
                <span class="donate-stat-label">Usage</span>
              </div>
            </div>
            
            <div class="donate-actions">
              <button class="btn-donate btn-donate-primary" id="btnDonateNow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                Support Development
              </button>
              <button class="btn-donate btn-donate-secondary" id="btnDonateLater">
                Continue for Free
              </button>
            </div>
          </div>
          
          <div class="donate-footer">
            No payment required • 100% optional
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('donateModal');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Heart button click
    const heartBtn = document.getElementById('heartButton');
    if (heartBtn) {
      heartBtn.addEventListener('click', () => this.show('support'));
    }

    // Donate now button
    const donateBtn = document.getElementById('btnDonateNow');
    if (donateBtn) {
      donateBtn.addEventListener('click', () => this.openDonateLink());
    }

    // Continue for free button
    const laterBtn = document.getElementById('btnDonateLater');
    if (laterBtn) {
      laterBtn.addEventListener('click', () => this.hide());
    }

    // Close on overlay click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hide();
        }
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.hide();
      }
    });
  }

  /**
   * Show modal
   * @param {string} context - 'support' or 'unlock'
   */
  show(context = 'support') {
    if (!this.modal) return;

    // Update content based on context
    const title = this.modal.querySelector('.donate-title');
    const subtitle = this.modal.querySelector('.donate-subtitle');
    const message = this.modal.querySelector('.donate-message');
    const primaryBtn = this.modal.querySelector('.btn-donate-primary');
    const secondaryBtn = this.modal.querySelector('.btn-donate-secondary');

    if (context === 'unlock') {
      title.textContent = 'Unlock Batch Converter';
      subtitle.textContent = 'Pay what you want (or nothing!)';
      message.innerHTML = `
        <p><strong>Batch Converter</strong> lets you convert multiple images at once - a huge time saver!</p>
        <p>Support the development if you can, or simply click the link to unlock it for free. Your choice!</p>
      `;
      primaryBtn.innerHTML = `
        <img src="lucide/unlock.svg" width="20" height="20" alt="unlock">
        Unlock Feature (Free or Donate)
      `;
      secondaryBtn.style.display = 'none';
    } else {
      title.textContent = 'Support SVGify';
      subtitle.textContent = 'Pay what you want';
      message.innerHTML = `
        <p>SVGify is free and open for everyone. If you find it useful, consider supporting the development!</p>
        <p>Your contribution helps keep this tool free and continuously improved.</p>
      `;
      primaryBtn.innerHTML = `
        <img src="lucide/heart.svg" width="20" height="20" alt="heart">
        Support Development
      `;
      secondaryBtn.style.display = 'flex';
    }

    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide modal
   */
  hide() {
    if (!this.modal) return;
    
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  /**
   * Open donate link
   */
  openDonateLink() {
    // Open Lemon Squeezy link
    window.open('https://tech365hub.lemonsqueezy.com/buy/ea2ff6b8-4614-415f-a0b7-9c871a91b983', '_blank');
    
    // Unlock batch converter immediately (user clicked the link)
    this.unlock();
    
    // Hide modal
    this.hide();
    
    // Show success message after a short delay
    setTimeout(() => {
      if (window.ErrorHandler) {
        ErrorHandler.showSuccess('Batch Converter unlocked! Thank you for your support! 💖');
      }
      
      // Automatically open batch converter
      if (window.batchConverter) {
        window.batchConverter.show();
      }
    }, 300);
  }

  /**
   * Check if batch converter should be unlocked
   * Returns true if unlocked, false if should show modal
   */
  checkBatchAccess() {
    if (this.isUnlocked) {
      return true;
    }
    
    // Show unlock modal
    this.show('unlock');
    return false;
  }
}

// Initialize donate modal and expose globally
window.donateModal = new DonateModal();
document.addEventListener('DOMContentLoaded', () => {
  window.donateModal.init();
});
