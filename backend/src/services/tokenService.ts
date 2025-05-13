import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/User';

// Interfejs dla danych przechowywanych w tokenie JWT
interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generuje access token i refresh token dla użytkownika
 */
export const generateTokens = (user: UserDocument) => {
  // Dane do przechowania w tokenie
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  // Sekrety do podpisywania tokenów
  const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret_for_development';
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_for_development';

  // Generowanie access tokenu (krótki czas życia - 15 minut)
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });

  // Generowanie refresh tokenu (dłuższy czas życia - 7 dni)
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  return { accessToken, refreshToken };
};

/**
 * Weryfikuje access token i zwraca dane użytkownika
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret_for_development';
    const decoded = jwt.verify(token, accessTokenSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Weryfikuje refresh token i zwraca dane użytkownika
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_for_development';
    const decoded = jwt.verify(token, refreshTokenSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};