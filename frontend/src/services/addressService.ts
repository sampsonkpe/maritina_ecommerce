import api from "../api/axios";

export const addressService = {
  async getAddresses() {
    const response = await api.get(
      "/addresses/"
    );

    return response.data;
  },

  async createAddress(
    label: string,
    addressText: string
  ) {
    const response = await api.post(
      "/addresses/",
      {
        label,
        address_text: addressText,
      }
    );

    return response.data;
  },
};