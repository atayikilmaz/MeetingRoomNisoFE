const API_BASE_URL = 'http://localhost:5215/api/';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (!url.includes('login') && !url.includes('register')) {
    const token = localStorage.getItem('token');
    console.log('Token retrieved for API call:', token);
    if (token) {

      
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log(`Making request to: ${fullUrl}`);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log(`Response status for ${url}:`, response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}


export async function login(email: string, password: string) {
  const response = await fetchWithAuth('Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.token) {
    localStorage.setItem('token', response.token);
  }

  return response;
}

export async function register(email: string, password: string, name: string) {
  return fetchWithAuth('Auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function getMeetingRooms() {
  return fetchWithAuth('MeetingRoom');
}

export async function createMeetingRoom(name: string) {
  return fetchWithAuth('MeetingRoom', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteMeetingRoom(id: number) {
  return fetchWithAuth(`MeetingRoom/${id}`, {
    method: 'DELETE',
  });
}

export async function getMeetings() {
  return fetchWithAuth('Meetings');
}

export async function createMeeting(meetingData: any) {
  return fetchWithAuth('Meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
}

export async function updateMeeting(id: number, meetingData: any) {
  return fetchWithAuth(`Meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...meetingData, id }),
  });
}

export async function deleteMeeting(id: number) {
  return fetchWithAuth(`Meetings/${id}`, {
    method: 'DELETE',
  });
}

export async function getUsers() {
  return fetchWithAuth('User');
}

export async function deleteUser(id: string) {
  return fetchWithAuth(`User/${id}`, {
    method: 'DELETE',
  });
}

export async function changeUserRole(id: string, role: string) {
  return fetchWithAuth(`User/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify(role),
  });
}

export function googleLogin() {
  window.location.href = 'http://localhost:5215/api/Auth/google-login';
}

export const verify2FA = async (email: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}auth/verify-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify 2FA');
  }

  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};


export const fetchAvailableSlots = async (roomId: string, date: string, excludeMeetingId?: number) => {
  const baseUrl = 'http://localhost:5215/api/Meetings/available-slots';
  const formattedDate = new Date(date).toISOString();
  let url = `${baseUrl}?roomId=${roomId}&date=${encodeURIComponent(formattedDate)}`;
  
  if (excludeMeetingId) {
    url += `&excludeMeetingId=${excludeMeetingId}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
};