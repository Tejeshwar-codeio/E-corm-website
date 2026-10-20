const BASE_URL = 'http://localhost:5000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  let token = '';
  if (typeof window !== 'undefined') {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        token = userInfo.token || '';
      } catch (err) {
        console.error('Failed to parse userInfo token', err);
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}
