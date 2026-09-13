export function notifyProfileUpdated() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('profileUpdated'));
}
