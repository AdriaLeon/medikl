import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

/** Returns true if the token is missing an exp claim, unparsable, or already expired. */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<DecodedToken>(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
