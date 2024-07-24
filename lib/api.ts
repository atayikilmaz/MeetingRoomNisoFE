const API_BASE_URL = 'http://localhost:5215/api/';


async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    mode: 'no-cors'

  });
}

export async function register(email: string, password: string, name: string) {
  return fetchWithAuth('Auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}


