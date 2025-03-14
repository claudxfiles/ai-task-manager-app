import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getAuthHeaders = async () => {
  const session = await getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  };
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
};

export const api = {
  goals: {
    list: () => fetchWithAuth('/goals'),
    create: (data: any) => fetchWithAuth('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchWithAuth(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchWithAuth(`/goals/${id}`, {
      method: 'DELETE',
    }),
  },
  tasks: {
    list: () => fetchWithAuth('/tasks'),
    create: (data: any) => fetchWithAuth('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchWithAuth(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchWithAuth(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  },
  projects: {
    list: () => fetchWithAuth('/projects'),
    create: (data: any) => fetchWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchWithAuth(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchWithAuth(`/projects/${id}`, {
      method: 'DELETE',
    }),
  },
  chat: {
    send: (message: string) => fetchWithAuth('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  },
};