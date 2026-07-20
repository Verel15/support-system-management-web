import { jwtDecode } from 'jwt-decode';

export type AccountType = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface JwtPayload {
  sub: string;
  email: string;
  accountType: AccountType;
  userTypeId?: string;
  permissions: string[];
}

export function decodeAccessToken(accessToken: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(accessToken);
  } catch {
    return null;
  }
}
