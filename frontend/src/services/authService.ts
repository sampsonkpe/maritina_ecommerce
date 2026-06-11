import api from "../api/axios";

export const authService = {
  async login(
    email: string,
    password: string
  ) {
    const response = await api.post(
      "/token/",
      {
        email,
        password,
      }
    );

    return response.data;
  },
};