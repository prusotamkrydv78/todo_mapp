export const API_BASE_URL = 'https://todo-app-bc.vercel.app';

export const apiEndpoints = {
  chat: `${API_BASE_URL}/api/ai-chat/chat`,
  login: `${API_BASE_URL}/api/users/login`,
  register: `${API_BASE_URL}/api/users/register`,
  me: `${API_BASE_URL}/api/users/me`,
};

export const fetchWithConfig = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Sends cookies with cross-origin requests
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window?.location?.origin || '*',
      ...options.headers,
    },
    mode: 'cors', // Enable CORS
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
