const API_BASE_URL = 'http://localhost:5215/api/';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add Authorization header for all requests except login and register
  if (!url.includes('login') && !url.includes('register')) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

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
  const response = await fetchWithAuth('login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Save the token to localStorage
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

// The rest of your functions remain the same
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