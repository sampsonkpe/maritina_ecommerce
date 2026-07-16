import type { User } from "../types/user";

const USER_KEY = "user";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function saveUser(user: User) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function getUser(): User | null {
  const user = localStorage.getItem(USER_KEY);

  return user ? JSON.parse(user) : null;
}

export function saveTokens(
  access: string,
  refresh: string
) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    access
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refresh
  );
}

export function getAccessToken() {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken() {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function clearTokens() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function logout() {
  clearTokens();
  clearUser();
}