import api from "../api/axios";

import type { Address } from "../types/address";

interface DefaultAddressResponse {
  message: string;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get(
      "/addresses/"
    );

    return response.data;
  },

  async createAddress(
    label: string,
    addressText: string
  ): Promise<Address> {
    const response = await api.post(
      "/addresses/",
      {
        label,
        address_text: addressText,
      }
    );

    return response.data;
  },

  async updateAddress(
    id: number,
    data: {
      label?: string;
      address_text?: string;
    }
  ): Promise<Address> {
    const response = await api.put(
      `/addresses/${id}/`,
      data
    );

    return response.data;
  },

  async deleteAddress(
    id: number
  ): Promise<void> {
    await api.delete(
      `/addresses/${id}/`
    );
  },

  async setDefaultAddress(
    id: number
  ): Promise<DefaultAddressResponse> {
    const response = await api.post(
      `/addresses/${id}/set-default/`
    );

    return response.data;
  },
};