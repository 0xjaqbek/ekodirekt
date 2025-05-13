import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateTokens, verifyRefreshToken } from '../../src/services/tokenService';
import { IUser } from 'shared/types/models';
import { LoginRequest, RegisterRequest } from 'shared/types/api';
import { sendVerificationEmail } from '../../src/services/emailService';
import { generateVerificationToken } from '../../src/utils/crypto';
import { rateLimit } from 'express-rate-limit';

// Ogranicznik liczby prób logowania - zabezpieczenie przed atakami brute-force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // 5 prób z jednego IP
  message: { success: false, message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rejestracja nowego użytkownika
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: RegisterRequest = req.body;

    // Sprawdź czy użytkownik o podanym emailu już istnieje
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Użytkownik o podanym adresie email już istnieje' });
    }

    // Hashowanie hasła
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Tworzenie tokenu weryfikacyjnego
    const verificationToken = generateVerificationToken();

    // Tworzenie nowego użytkownika
    const newUser = new User({
      email: userData.email,
      passwordHash: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      phoneNumber: userData.phoneNumber,
      location: {
        type: 'Point',
        coordinates: userData.location.coordinates,
        address: userData.location.address,
      },
      isVerified: false, // Użytkownik musi potwierdzić adres email
      verificationToken, // Dodajemy token weryfikacyjny
    });

    // Zapisanie użytkownika w bazie
    await newUser.save();

    // Wysłanie emaila weryfikacyjnego
    await sendVerificationEmail(userData.email, verificationToken);

    // Zwracanie odpowiedzi bez wrażliwych danych
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    };

    return res.status(201).json({
      success: true,
      message: 'Rejestracja przebiegła pomyślnie. Sprawdź swoją skrzynkę email, aby zweryfikować konto.',
      user: userResponse,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Weryfikacja adresu email użytkownika
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    // Znajdź użytkownika z podanym tokenem weryfikacyjnym
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy token weryfikacyjny' });
    }

    // Aktualizuj status weryfikacji i usuń token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Adres email został zweryfikowany. Możesz się teraz zalogować.',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Logowanie użytkownika
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Znajdź użytkownika
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy email lub hasło' });
    }

    // Sprawdź czy konto zostało zweryfikowane
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.' });
    }

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy email lub hasło' });
    }

    // Generuj tokeny
    const { accessToken, refreshToken } = generateTokens(user);

    // Zapisz refresh token w bazie danych
    user.refreshToken = refreshToken;
    await user.save();

    // Ustaw refresh token jako httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
    });

    // Zwróć access token
    return res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Wylogowanie użytkownika
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pobierz token z ciasteczka
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(200).json({ success: true, message: 'Wylogowano' });
    }

    // Znajdź użytkownika po refresh tokenie
    const user = await User.findOne({ refreshToken });
    if (user) {
      // Usuń refresh token z bazy danych
      user.refreshToken = undefined;
      await user.save();
    }

    // Usuń ciasteczko z refresh tokenem
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ success: true, message: 'Wylogowano pomyślnie' });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Odświeżanie tokenu
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pobierz token z ciasteczka
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Brak tokenu odświeżania' });
    }

    // Weryfikuj token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy token odświeżania' });
    }

    // Znajdź użytkownika po ID i sprawdź token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy token odświeżania' });
    }

    // Generuj nowe tokeny
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Aktualizuj refresh token w bazie danych
    user.refreshToken = newRefreshToken;
    await user.save();

    // Ustaw nowy refresh token jako httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni
    });

    // Zwróć nowy access token
    return res.status(200).json({
      success: true,
      token: accessToken,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Zmiana hasła użytkownika
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Znajdź użytkownika
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Sprawdź aktualne hasło
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowe aktualne hasło' });
    }

    // Sprawdź czy nowe hasło jest wystarczająco silne
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Hasło musi zawierać co najmniej 8 znaków' });
    }

    // Hashuj nowe hasło
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Aktualizuj hasło
    user.passwordHash = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Hasło zostało zmienione pomyślnie',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Resetowanie zapomnianego hasła - generowanie tokenu
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Znajdź użytkownika
    const user = await User.findOne({ email });
    if (!user) {
      // Nie informuj, czy użytkownik istnieje (bezpieczeństwo)
      return res.status(200).json({ 
        success: true, 
        message: 'Jeśli konto o podanym adresie email istnieje, otrzymasz wiadomość z instrukcjami resetowania hasła.' 
      });
    }

    // Generuj token resetowania
    const resetToken = generateVerificationToken();
    
    // Zapisz token i czas wygaśnięcia (1 godzina)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 godzina
    await user.save();

    // Wyślij email z instrukcjami
    // await sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({
      success: true,
      message: 'Jeśli konto o podanym adresie email istnieje, otrzymasz wiadomość z instrukcjami resetowania hasła.',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Resetowanie zapomnianego hasła - weryfikacja tokenu i zmiana hasła
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Znajdź użytkownika z podanym tokenem resetowania
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token musi być wciąż ważny
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy lub wygasły token resetowania hasła' });
    }

    // Sprawdź czy nowe hasło jest wystarczająco silne
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Hasło musi zawierać co najmniej 8 znaków' });
    }

    // Hashuj nowe hasło
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Aktualizuj hasło i usuń token resetowania
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Hasło zostało zresetowane pomyślnie. Możesz się teraz zalogować.',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobranie profilu aktualnie zalogowanego użytkownika
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Pobierz dane użytkownika bez wrażliwych informacji
    const user = await User.findById(userId).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    next(error);
  }
};