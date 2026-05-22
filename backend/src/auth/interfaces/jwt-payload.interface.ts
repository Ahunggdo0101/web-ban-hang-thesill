export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  tokenId?: string; // unique identifier for the refresh token
}
