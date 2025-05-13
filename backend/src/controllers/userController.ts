import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { IUser } from 'shared/types/models';
import { UpdateUserRequest } from 'shared/types/api';

/**
 * Pobiera wszystkich użytkowników (tylko dla administratorów)
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Dodaj opcje filtrowania i paginacji
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;

    // Przygotuj zapytanie
    let query: any = {};

    // Filtrowanie po roli
    if (role && ['farmer', 'consumer', 'admin'].includes(role)) {
      query.role = role;
    }

    // Wyszukiwanie po nazwie lub emailu
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Wykonaj zapytanie z paginacją
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken -resetPasswordExpires')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera użytkownika po ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;

    // Sprawdź, czy użytkownik istnieje
    const user = await User.findById(userId)
      .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken -resetPasswordExpires');

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

/**
 * Pobiera profil aktualnie zalogowanego użytkownika
 */
export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    // Znajdź użytkownika i pobierz powiązane dane
    const user = await User.findById(userId)
      .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken -resetPasswordExpires')
      .populate('certificates', 'name type issuingAuthority validUntil')
      .populate('createdProducts', 'name price status')
      .populate('orders', 'status totalPrice createdAt')
      .populate('localGroups', 'name description');

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

/**
 * Aktualizuje profil użytkownika
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userData: UpdateUserRequest = req.body;

    // Sprawdź, czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Aktualizuj dozwolone pola
    if (userData.fullName) user.fullName = userData.fullName;
    if (userData.phoneNumber) user.phoneNumber = userData.phoneNumber;
    if (userData.bio !== undefined) user.bio = userData.bio;
    if (userData.profileImage !== undefined) user.profileImage = userData.profileImage;
    
    // Aktualizuj lokalizację jeśli podana
    if (userData.location) {
      if (userData.location.coordinates) {
        user.location.coordinates = userData.location.coordinates;
      }
      if (userData.location.address) {
        user.location.address = userData.location.address;
      }
    }

    // Zapisz zaktualizowanego użytkownika
    await user.save();

    // Zwróć zaktualizowanego użytkownika bez wrażliwych danych
    const updatedUser = await User.findById(userId)
      .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken -resetPasswordExpires');

    return res.status(200).json({
      success: true,
      message: 'Profil zaktualizowany pomyślnie',
      user: updatedUser,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Aktualizuje rolę użytkownika (tylko dla administratorów)
 */
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;

    // Sprawdź czy nowa rola jest prawidłowa
    if (!['farmer', 'consumer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowa rola' });
    }

    // Sprawdź, czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Sprawdź, czy administrator nie zmienia swojej roli
    if (userId === req.user.id) {
      return res.status(403).json({ success: false, message: 'Nie możesz zmienić swojej roli' });
    }

    // Aktualizuj rolę
    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Rola użytkownika zaktualizowana pomyślnie',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Dezaktywuje konto użytkownika
 */
export const deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Sprawdź, czy użytkownik ma uprawnienia do dezaktywacji
    if (userId !== requestingUserId && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Nie masz uprawnień do dezaktywacji tego konta' 
      });
    }

    // Znajdź użytkownika
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Sprawdź, czy administrator nie dezaktywuje swojego konta
    if (isAdmin && userId === requestingUserId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Administrator nie może dezaktywować swojego konta' 
      });
    }

    // Dezaktywuj konto (zamiast usuwania go z bazy)
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Konto zostało dezaktywowane pomyślnie',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Pobiera publiczny profil użytkownika (np. profil rolnika widoczny dla konsumentów)
 */
export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;

    // Pobierz podstawowe informacje o użytkowniku oraz jego produkty i recenzje
    const user = await User.findById(userId)
      .select('fullName role bio profileImage location isVerified createdAt')
      .populate({
        path: 'createdProducts',
        select: 'name description price images averageRating category',
        match: { status: 'available' }
      })
      .populate({
        path: 'reviews',
        select: 'rating comment createdAt',
        populate: {
          path: 'author',
          select: 'fullName profileImage'
        }
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Oblicz średnią ocenę użytkownika na podstawie recenzji
    const reviews = user.reviews || [];
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

    // Przygotuj dane do odpowiedzi
    const publicProfile = {
      _id: user._id,
      fullName: user.fullName,
      role: user.role,
      bio: user.bio,
      profileImage: user.profileImage,
      location: {
        coordinates: user.location.coordinates,
        address: user.location.address
      },
      isVerified: user.isVerified,
      averageRating,
      reviewCount: reviews.length,
      productCount: user.createdProducts ? user.createdProducts.length : 0,
      products: user.role === 'farmer' ? user.createdProducts : undefined,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      profile: publicProfile,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Zarządzanie statusem weryfikacji użytkownika (tylko dla administratorów)
 */
export const updateVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isVerified } = req.body;

    // Sprawdź, czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    // Aktualizuj status weryfikacji
    user.isVerified = isVerified;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Status weryfikacji użytkownika ${isVerified ? 'potwierdzony' : 'anulowany'} pomyślnie`,
    });
  } catch (error: any) {
    next(error);
  }
};