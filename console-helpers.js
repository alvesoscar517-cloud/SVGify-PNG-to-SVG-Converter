/**
 * Console Helpers for Testing Donate Feature
 * Open browser console and use these commands
 */

// Test helpers object
window.DonateTest = {
  
  // Reset unlock status (test first-time experience)
  resetUnlock() {
    localStorage.removeItem('batchConverterUnlocked');
    console.log('✅ Unlock status reset. Refresh page to test first-time flow.');
  },
  
  // Force unlock (skip modal)
  forceUnlock() {
    localStorage.setItem('batchConverterUnlocked', 'true');
    console.log('✅ Batch Converter unlocked!');
  },
  
  // Check current unlock status
  checkStatus() {
    const isUnlocked = localStorage.getItem('batchConverterUnlocked') === 'true';
    console.log(`Status: ${isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}`);
    return isUnlocked;
  },
  
  // Show support modal
  showSupportModal() {
    if (window.donateModal) {
      window.donateModal.show('support');
      console.log('✅ Support modal shown');
    } else {
      console.error('❌ donateModal not found');
    }
  },
  
  // Show unlock modal
  showUnlockModal() {
    if (window.donateModal) {
      window.donateModal.show('unlock');
      console.log('✅ Unlock modal shown');
    } else {
      console.error('❌ donateModal not found');
    }
  },
  
  // Hide modal
  hideModal() {
    if (window.donateModal) {
      window.donateModal.hide();
      console.log('✅ Modal hidden');
    }
  },
  
  // Show help
  help() {
    console.log(`
🧪 Donate Feature Test Commands:

DonateTest.resetUnlock()      - Reset unlock (test first-time)
DonateTest.forceUnlock()      - Force unlock batch converter
DonateTest.checkStatus()      - Check if unlocked
DonateTest.showSupportModal() - Show support modal
DonateTest.showUnlockModal()  - Show unlock modal
DonateTest.hideModal()        - Hide current modal
DonateTest.help()             - Show this help

Example workflow:
1. DonateTest.resetUnlock()
2. Refresh page
3. Click "Batch Convert" button
4. Modal should appear
    `);
  }
};

// Show help on load
console.log('💡 Type DonateTest.help() for testing commands');
