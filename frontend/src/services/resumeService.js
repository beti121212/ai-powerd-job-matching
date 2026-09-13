const STORAGE_KEY = 'seekerResume';

function storedResume() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

function syncUserResumeName(fileName) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!fileName) {
      delete user.cvFileName;
      localStorage.setItem('user', JSON.stringify(user));
      return;
    }
    localStorage.setItem('user', JSON.stringify({ ...user, cvFileName: fileName }));
  } catch {
    // Ignore storage issues in this frontend-only flow.
  }
}

function metadata(file, fileUrl = '') {
  return { id: `resume-${Date.now()}`, fileName: file.name, fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE', fileSize: file.size, fileUrl, uploadedAt: new Date().toISOString() };
}

export async function getResume() { return storedResume(); }
export async function uploadResume(formData) { const file = formData.get('resume'); const result = metadata(file, URL.createObjectURL(file)); localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); syncUserResumeName(file.name); return result; }
export async function replaceResume(formData) { const file = formData.get('resume'); const result = metadata(file, URL.createObjectURL(file)); localStorage.setItem(STORAGE_KEY, JSON.stringify(result)); syncUserResumeName(file.name); return result; }
export async function deleteResume(id) { localStorage.removeItem(STORAGE_KEY); syncUserResumeName(''); return { id }; }
export async function downloadResume(fileUrl, fileName) { if (!fileUrl) throw new Error('Resume file is not available for download.'); const anchor = document.createElement('a'); anchor.href = fileUrl; anchor.download = fileName; document.body.appendChild(anchor); anchor.click(); anchor.remove(); }
