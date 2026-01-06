/**
 * Lucide Icon Loader
 * Load SVG icons from lucide folder
 */

class LucideIcon {
  /**
   * Create an icon element
   * @param {string} name - Icon name (e.g., 'upload', 'download')
   * @param {number} size - Icon size in pixels (default: 24)
   * @param {string} className - Additional CSS classes
   * @returns {HTMLElement} Icon element
   */
  static create(name, size = 24, className = '') {
    const img = document.createElement('img');
    img.src = `lucide/${name}.svg`;
    img.width = size;
    img.height = size;
    img.alt = name;
    img.className = `lucide-icon ${className}`;
    img.style.display = 'inline-block';
    img.style.verticalAlign = 'middle';
    return img;
  }

  /**
   * Replace inline SVG with icon from file
   * @param {string} selector - CSS selector for elements to replace
   * @param {string} iconName - Icon name
   */
  static replace(selector, iconName) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const size = parseInt(el.getAttribute('width') || '24');
      const icon = LucideIcon.create(iconName, size);
      el.replaceWith(icon);
    });
  }

  /**
   * Load icon as data URL for inline use
   * @param {string} name - Icon name
   * @returns {Promise<string>} Data URL
   */
  static async loadAsDataURL(name) {
    try {
      const response = await fetch(`lucide/${name}.svg`);
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    } catch (error) {
      return '';
    }
  }
}
