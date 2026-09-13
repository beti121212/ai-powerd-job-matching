const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getCandidateId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id || user.userId || user.candidateId || '';
  } catch {
    return '';
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('jwt');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const fallbackProfile = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const savedResume = JSON.parse(localStorage.getItem('seekerResume') || 'null');

    return {
      id: getCandidateId(),
      name: profile.name || user.full_name || user.name || '',
      email: profile.email || user.email || '',
      phone: profile.phone || user.phone || '',
      location: profile.location || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      cvUploaded: Boolean(savedResume?.fileName || user?.cvFileName),
      cvFileName: savedResume?.fileName || user?.cvFileName || '',
    };
  } catch {
    return {
      id: getCandidateId(),
      cvUploaded: false,
      cvFileName: '',
    };
  }
};

const requestJson = async (url, options = {}, fallbackValue) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (fallbackValue !== undefined) {
      return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
    }
    console.error('API Error:', error);
    throw error;
  }
};

export const getCandidateProfile = async (candidateId) => {
  const url = `${BASE_URL}/candidates/${candidateId}/profile`;
  return requestJson(
    url,
    {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    },
    fallbackProfile,
  );
};

export const uploadCandidateCV = async (candidateId, file) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('candidateId', candidateId);

  const url = `${BASE_URL}/candidates/${candidateId}/cv/upload`;

  const result = await requestJson(
    url,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    },
    () => ({
      success: true,
      fileName: file.name,
      cvUploaded: true,
      candidateId,
    }),
  );

  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, cvFileName: file.name }));
    localStorage.setItem('seekerResume', JSON.stringify({
      id: `resume-${Date.now()}`,
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));
  } catch {
    // local fallback storage only
  }

  return result;
};

export const updateCandidateProfileManual = async (candidateId, profileData) => {
  const url = `${BASE_URL}/candidates/${candidateId}/profile`;
  const payload = { ...profileData };

  const result = await requestJson(
    url,
    {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
    () => {
      localStorage.setItem('userProfile', JSON.stringify(payload));
      return { ...payload, id: candidateId, success: true };
    },
  );

  return result;
};
