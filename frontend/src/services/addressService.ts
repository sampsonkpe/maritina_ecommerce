import api from "../api/axios";

export const addressService = {
  async getAddresses() {
    const response = await api.get("/addresses/");

    return response.data;
  },

  async createAddress(
    label: string,
    addressText: string
  ) {
    const response = await api.post("/addresses/", {
      label,
      address_text: addressText,
    });

    return response.data;
  },

  async updateAddress(
    id: number,
    data: {
      label?: string;
      address_text?: string;
    }
  ) {
    const response = await api.put(
      `/addresses/${id}/`,
      data
    );

    return response.data;
  },

  async deleteAddress(id: number) {
    await api.delete(`/addresses/${id}/`);
  },

  async setDefaultAddress(id: number) {
    const response = await api.post(
      `/addresses/${id}/set-default/`
    );

    return response.data;
  },
};