export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  is_staff: boolean;
}