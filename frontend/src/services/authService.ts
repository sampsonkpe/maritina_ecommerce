import api from "../api/axios";

export const authService = {
  async login(
    identifier: string,
    password: string
  ) {
    const response = await api.post(
      "/auth/login/",
      {
        identifier,
        password,
      }
    );

    return response.data;
  },
};