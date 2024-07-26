const API_BASE_URL = 'http://localhost:5215/api/';


async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
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
  const response = await fetchWithAuth('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    mode: 'no-cors'
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


// New functions for meeting room operations
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
    headers: {
      'Content-Type': 'application/json',
      // Include other headers as needed, such as Authorization
    },
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
    body: JSON.stringify({ ...meetingData, id }), // Include id in the body
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