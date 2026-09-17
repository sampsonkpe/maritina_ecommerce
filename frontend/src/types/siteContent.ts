export type SiteImageType = "HERO" | "TEAM";

export interface SiteImage {
  id: number;
  image_type: SiteImageType;
  image: string;
}