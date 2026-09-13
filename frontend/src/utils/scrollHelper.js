export const scrollToFeedback = (type = 'top') => {
  window.setTimeout(() => {
    const scrollContainer = document.querySelector('main, .overflow-y-auto, #dashboard-content, [data-scrollable="true"]') || document.documentElement || document.body;

    if (type === 'error') {
      const targetError = document.querySelector('#error-banner, [role="alert"], .text-red-500, .border-red-500, :invalid, .input-error');
      if (targetError) {
        targetError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof targetError.focus === 'function') targetError.focus({ preventScroll: true });
        return;
      }
    }

    if (typeof scrollContainer.scrollTo === 'function') scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 60);
};
