import { Request, Response, NextFunction } from 'express';
import fileService from '../services/fileService';
import path from 'path';
import fs from 'fs';
import { Product, Certificate, User } from '../models';

/**
 * Obsługuje upload zdjęć produktu
 * @route POST /api/files/products/images
 * @access Private (farmer, admin)
 */
export const uploadProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sprawdź, czy pliki zostały przesłane
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Brak przesłanych plików',
      });
    }

    // Pobierz ID produktu z zapytania (opcjonalne)
    const productId = req.query.productId as string;

    // Przesyłanie plików do Cloudinary
    const imageUrls = await fileService.uploadProductImages(req.files as Express.Multer.File[]);

    // Jeśli podano ID produktu, zaktualizuj go o nowe zdjęcia
    if (productId) {
      const product = await Product.findById(productId);
      
      if (product) {
        // Dodanie nowych zdjęć do istniejących
        product.images = [...(product.images || []), ...imageUrls];
        await product.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Zdjęcia zostały przesłane pomyślnie',
      images: imageUrls,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Obsługuje upload certyfikatów
 * @route POST /api/files/certificates
 * @access Private (farmer, admin)
 */
export const uploadCertificateFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sprawdź, czy pliki zostały przesłane
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Brak przesłanych plików',
      });
    }
    
    // Pobierz ID certyfikatu z zapytania (opcjonalne)
    const certificateId = req.query.certificateId as string;
    
    // Przesyłanie plików do Cloudinary
    const documentUrls = await fileService.uploadCertificates(req.files as Express.Multer.File[]);
    
    // Jeśli podano ID certyfikatu, zaktualizuj go o nowe dokumenty
    if (certificateId) {
      const certificate = await Certificate.findById(certificateId);
      
      if (certificate) {
        // Ustaw URL dokumentu (zwykle certyfikat ma jeden główny dokument)
        certificate.documentUrl = documentUrls[0];
        await certificate.save();
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Dokumenty certyfikatów zostały przesłane pomyślnie',
      documents: documentUrls,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Obsługuje upload ogólnych dokumentów
 * @route POST /api/files/documents
 * @access Private
 */
export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sprawdź, czy pliki zostały przesłane
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Brak przesłanych plików',
      });
    }
    
    // Przesyłanie plików do Cloudinary
    const documentUrls = await fileService.uploadDocuments(req.files as Express.Multer.File[]);
    
    return res.status(200).json({
      success: true,
      message: 'Dokumenty zostały przesłane pomyślnie',
      documents: documentUrls,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Obsługuje upload zdjęcia profilowego
 * @route POST /api/files/profile-image
 * @access Private
 */
export const uploadProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Sprawdź, czy plik został przesłany
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Brak przesłanego pliku',
      });
    }
    
    // Przesyłanie pliku do Cloudinary
    const imageUrl = await fileService.uploadProfileImage(req.file);
    
    // Aktualizuj profil użytkownika o nowe zdjęcie
    const user = await User.findById(userId);
    
    if (user) {
      // Jeśli użytkownik już miał zdjęcie, usuń stare
      if (user.profileImage) {
        const publicId = fileService.getPublicIdFromUrl(user.profileImage);
        if (publicId) {
          await fileService.deleteFromCloudinary(publicId);
        }
      }
      
      user.profileImage = imageUrl;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Zdjęcie profilowe zostało zaktualizowane',
      profileImage: imageUrl,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Usuwa plik z Cloudinary
 * @route DELETE /api/files
 * @access Private
 */
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, type = 'image' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL pliku jest wymagany',
      });
    }
    
    // Pobierz publicId z URL
    const publicId = fileService.getPublicIdFromUrl(url);
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Nie można pobrać publicId z podanego URL',
      });
    }
    
    // Usuń plik z Cloudinary
    const result = await fileService.deleteFromCloudinary(
      publicId, 
      type as 'image' | 'raw' | 'video'
    );
    
    if (result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'Nie udało się usunąć pliku',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Plik został usunięty pomyślnie',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Serwuje plik statyczny
 * @route GET /uploads/:type/:filename
 * @access Public
 */
export const serveStaticFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, filename } = req.params;
    
    // Sprawdź, czy typ jest dozwolony
    const allowedTypes = ['images', 'documents', 'certificates'];
    if (!allowedTypes.includes(type)) {
      return res.status(404).json({
        success: false,
        message: 'Nieprawidłowy typ pliku',
      });
    }
    
    // Ścieżka do pliku
    const filePath = path.join(__dirname, `../../uploads/${type}/${filename}`);
    
    // Sprawdź, czy plik istnieje
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Plik nie istnieje',
      });
    }
    
    // Zwróć plik
    return res.sendFile(filePath);
  } catch (error: any) {
    next(error);
  }
};