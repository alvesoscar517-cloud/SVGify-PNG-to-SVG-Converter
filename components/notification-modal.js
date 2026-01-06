/**
 * NotificationModal - Custom Modal System
 * Modern, minimalist design using Lucide icons
 */

class NotificationModal {
  constructor() {
    this.container = null;
    this.currentModal = null;
    this.init();
  }

  /**
   * Initialize modal container
   */
  init() {
    // Ensure document.body is ready
    if (!document.body) {
      // If body not ready, wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }
    }
    
    // Create container if not exists
    if (!document.getElementById('notificationContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      document.body.appendChild(container);
      this.container = container;
    } else {
      this.container = document.getElementById('notificationContainer');
    }
  }

  /**
   * Show notification modal
   * @param {Object} options - Modal configuration
   */
  show(options = {}) {
    // Ensure container is initialized
    if (!this.container) {
      this.init();
    }
    
    const {
      type = 'info', // info, success, warning, error, confirm
      title = '',
      message = '',
      icon = null,
      confirmText = 'OK',
      cancelText = 'Cancel',
      onConfirm = null,
      onCancel = null,
      autoClose = false,
      duration = 3000
    } = options;

    // Remove old modal if exists
    this.close();

    // Create new modal
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    // Determine icon and color by type
    const iconConfig = this.getIconConfig(type, icon);
    
    modal.innerHTML = `
      <div class="custom-modal-overlay"></div>
      <div class="custom-modal-content ${type}">
        <div class="custom-modal-icon ${iconConfig.colorClass}">
          <img src="${iconConfig.icon}" alt="${type}" width="32" height="32">
        </div>
        ${title ? `<div class="custom-modal-title">${title}</div>` : ''}
        <div class="custom-modal-message">${message}</div>
        <div class="custom-modal-actions">
          ${type === 'confirm' ? `
            <button class="custom-modal-btn custom-modal-btn-cancel" data-action="cancel">
              <img src="lucide/x.svg" width="16" height="16" alt="cancel">
              ${cancelText}
            </button>
          ` : ''}
          <button class="custom-modal-btn custom-modal-btn-confirm ${iconConfig.btnClass}" data-action="confirm">
            <img src="lucide/check.svg" width="16" height="16" alt="confirm">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    // Add to container
    this.container.appendChild(modal);
    this.currentModal = modal;

    // Add animation
    setTimeout(() => modal.classList.add('show'), 10);

    // Handle events
    const overlay = modal.querySelector('.custom-modal-overlay');
    const confirmBtn = modal.querySelector('[data-action="confirm"]');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');

    // Click overlay to close (only for info, success, warning)
    if (type !== 'confirm' && type !== 'error') {
      overlay.addEventListener('click', () => this.close());
    }

    // Confirm button
    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.close();
    });

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        this.close();
      });
    }

    // Auto close
    if (autoClose) {
      setTimeout(() => this.close(), duration);
    }

    // Keyboard shortcuts
    const handleKeyboard = (e) => {
      if (e.key === 'Escape') {
        if (type === 'confirm' && onCancel) onCancel();
        this.close();
      } else if (e.key === 'Enter') {
        if (onConfirm) onConfirm();
        this.close();
      }
    };
    modal.addEventListener('keydown', handleKeyboard);

    return this;
  }

  /**
   * Get icon configuration by type
   */
  getIconConfig(type, customIcon) {
    if (customIcon) {
      return {
        icon: customIcon,
        colorClass: 'icon-info',
        btnClass: 'btn-info'
      };
    }

    const configs = {
      info: {
        icon: 'lucide/info.svg',
        colorClass: 'icon-info',
        btnClass: 'btn-info'
      },
      success: {
        icon: 'lucide/check-circle.svg',
        colorClass: 'icon-success',
        btnClass: 'btn-success'
      },
      warning: {
        icon: 'lucide/alert-triangle.svg',
        colorClass: 'icon-warning',
        btnClass: 'btn-warning'
      },
      error: {
        icon: 'lucide/alert-circle.svg',
        colorClass: 'icon-error',
        btnClass: 'btn-error'
      },
      confirm: {
        icon: 'lucide/help-circle.svg',
        colorClass: 'icon-confirm',
        btnClass: 'btn-confirm'
      }
    };

    return configs[type] || configs.info;
  }

  /**
   * Close current modal
   */
  close() {
    if (this.currentModal) {
      this.currentModal.classList.remove('show');
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }

  /**
   * Show success notification
   */
  success(message, title = 'Success', autoClose = true) {
    return this.show({
      type: 'success',
      title,
      message,
      confirmText: 'OK',
      autoClose,
      duration: 3000
    });
  }

  /**
   * Show error notification
   */
  error(message, title = 'Error') {
    return this.show({
      type: 'error',
      title,
      message,
      confirmText: 'Close',
      autoClose: false
    });
  }

  /**
   * Show warning
   */
  warning(message, title = 'Warning', autoClose = true) {
    return this.show({
      type: 'warning',
      title,
      message,
      confirmText: 'Got it',
      autoClose,
      duration: 4000
    });
  }

  /**
   * Show info
   */
  info(message, title = 'Information', autoClose = true) {
    return this.show({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      autoClose,
      duration: 3000
    });
  }

  /**
   * Show confirmation
   */
  confirm(message, title = 'Confirm', onConfirm, onCancel) {
    return this.show({
      type: 'confirm',
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      autoClose: false
    });
  }

  /**
   * Show custom modal
   */
  custom(options) {
    return this.show(options);
  }
}

/**
 * Toast Notification System
 * Compact notifications in screen corner
 */
class ToastNotification {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  /**
   * Initialize container
   */
  init() {
    // Ensure document.body is ready
    if (!document.body) {
      // If body not ready, wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }
    }
    
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
      this.container = container;
    } else {
      this.container = document.getElementById('toastContainer');
    }
  }

  /**
   * Show toast notification
   */
  show(options = {}) {
    // Ensure container is initialized
    if (!this.container) {
      this.init();
    }
    
    const {
      type = 'info',
      message = '',
      duration = 3000,
      icon = null
    } = options;

    const iconConfig = this.getIconConfig(type, icon);
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    toast.innerHTML = `
      <div class="toast-icon ${iconConfig.colorClass}">
        <img src="${iconConfig.icon}" alt="${type}" width="20" height="20">
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">
        <img src="lucide/x.svg" width="16" height="16" alt="close">
      </button>
    `;

    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto remove
    setTimeout(() => this.remove(toast), duration);

    return toast;
  }

  /**
   * Remove toast
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Get icon configuration
   */
  getIconConfig(type, customIcon) {
    if (customIcon) {
      return { icon: customIcon, colorClass: 'icon-info' };
    }

    const configs = {
      info: { icon: 'lucide/info.svg', colorClass: 'icon-info' },
      success: { icon: 'lucide/check-circle.svg', colorClass: 'icon-success' },
      warning: { icon: 'lucide/alert-triangle.svg', colorClass: 'icon-warning' },
      error: { icon: 'lucide/alert-circle.svg', colorClass: 'icon-error' }
    };

    return configs[type] || configs.info;
  }

  success(message, duration = 3000) {
    return this.show({ type: 'success', message, duration });
  }

  error(message, duration = 4000) {
    return this.show({ type: 'error', message, duration });
  }

  warning(message, duration = 3500) {
    return this.show({ type: 'warning', message, duration });
  }

  info(message, duration = 3000) {
    return this.show({ type: 'info', message, duration });
  }
}

// Export classes first
window.NotificationModalClass = NotificationModal;
window.ToastNotificationClass = ToastNotification;

// Export global instances immediately (synchronously)
window.NotificationModal = new NotificationModal();
window.Toast = new ToastNotification();
