const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async getMe(userId: string) {
    const response = await fetch(`${API_URL}/auth/me/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user profile');
    }

    return response.json();
  },

  async signup(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  async submitSupportRequest(data: {
    user_id: string;
    email: string;
    subject: string;
    description: string;
    contactNumber: string;
    screenshot?: string;
  }) {
    const response = await fetch(`${API_URL}/support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Support request failed');
    }

    return response.json();
  },

  async getUserSupportRequests(userId: string) {
    const response = await fetch(`${API_URL}/support/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch support requests');
    }

    return response.json();
  },

  async getUserProfile(userId: string) {
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  async updateUserProfile(userId: string, data: any) {
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return response.json();
  },

  async uploadProfilePhoto(userId: string, photoUrl: string) {
    const response = await fetch(`${API_URL}/profile/${userId}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile photo');
    }

    return response.json();
  },

  async deleteProfilePhoto(userId: string) {
    const response = await fetch(`${API_URL}/profile/${userId}/photo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete profile photo');
    }

    return response.json();
  },

  async shareProfile(userId: string) {
    const response = await fetch(`${API_URL}/profile/${userId}/share`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get shareable profile');
    }

    return response.json();
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    return response.json();
  },
};
