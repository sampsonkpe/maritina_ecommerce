import api from "../api/axios";

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string | null;
    phone: string | null;
    full_name: string;
    is_staff: boolean;
  };

  tokens: {
    access: string;
    refresh: string;
  };
}

export const authService = {
  async login(
    identifier: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post(
      "/auth/login/",
      {
        identifier,
        password,
      }
    );

    return response.data;
  },

  async register(
    data: {
      username: string;
      full_name: string;
      email?: string;
      phone?: string;
      password: string;
    }
  ): Promise<AuthResponse> {
    const response = await api.post(
      "/auth/register/",
      data
    );

    return response.data;
  },

  async logout(refresh: string): Promise<void> {
    await api.post("/auth/logout/", {
      refresh,
    });
  },
};