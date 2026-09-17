import api from "../api/axios";

import type { SiteImage } from "../types/siteContent";

export const siteContentService = {
  async getSiteImages(): Promise<SiteImage[]> {
    const response = await api.get<SiteImage[]>(
      "/site-content/"
    );

    return response.data;
  },
};