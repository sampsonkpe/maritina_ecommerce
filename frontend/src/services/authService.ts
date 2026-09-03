import api from "../api/axios";

import type { User } from "../types/user";

export interface AuthResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}

export interface UpdateProfileData {
  username?: string;
  phone?: string | null;
  full_name?: string;
}

export interface Profile extends User {
  email_verified: boolean;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const authService = {
  async register(data: {
    username?: string;
    email?: string;
    phone?: string;
    full_name: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/register/",
      data
    );

    return response.data;
  },

  async login(
    identifier: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/login/",
      {
        identifier,
        password,
      }
    );

    return response.data;
  },

  async logout(refresh: string): Promise<void> {
    await api.post("/auth/logout/", { refresh });
  },

  async getProfile(): Promise<Profile> {
    const response = await api.get<{ user: Profile }>("/auth/me/");
    return response.data.user;
  },

  async updateProfile(
    data: UpdateProfileData
  ): Promise<Profile> {
    const response = await api.patch<{ user: Profile }>(
      "/auth/me/",
      data
    );

    return response.data.user;
  },

  async changePassword(
    data: ChangePasswordData
  ): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>(
      "/auth/change-password/",
      data
    );

    return response.data;
  },
};