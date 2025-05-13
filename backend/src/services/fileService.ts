import cloudinary from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Konfiguracja Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Interfejs dla opcji uploadu
interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
  useFilename?: boolean;
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
}

// Serwis obsługi plików
class FileService {
  /**
   * Przesyła pojedynczy plik do Cloudinary
   * @param filePath - Ścieżka do pliku lokalnego
   * @param options - Opcje uploadu
   * @returns Informacje o przesłanym pliku
   */
  async uploadToCloudinary(filePath: string, options: UploadOptions = {}) {
    try {
      // Domyślne opcje
      const defaultOptions: UploadOptions = {
        folder: 'ekodirekt/general',
        transformation: [],
        useFilename: false,
        resourceType: 'auto',
      };

      // Połącz opcje
      const uploadOptions = { ...defaultOptions, ...options };
      
      // Generuj unikalny publicId, jeśli nie podano
      if (!uploadOptions.publicId) {
        uploadOptions.publicId = uuidv4();
      }

      // Wykonaj upload do Cloudinary
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: uploadOptions.folder,
        public_id: uploadOptions.publicId,
        transformation: uploadOptions.transformation,
        use_filename: uploadOptions.useFilename,
        resource_type: uploadOptions.resourceType,
      });
      
      // Usuń plik tymczasowy po przesłaniu
      this.removeLocalFile(filePath);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      };
    } catch (error) {
      // Nie usuwaj pliku w przypadku błędu (może być potrzebny do debugowania)
      console.error('Błąd podczas przesyłania pliku do Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Przesyła wiele plików do Cloudinary
   * @param files - Tablica plików z multera
   * @param options - Opcje uploadu
   * @returns Tablica informacji o przesłanych plikach
   */
  async uploadMultipleToCloudinary(files: Express.Multer.File[], options: UploadOptions = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadToCloudinary(file.path, options));
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Błąd podczas przesyłania wielu plików do Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Usuwa plik z Cloudinary
   * @param publicId - Publiczne ID pliku w Cloudinary
   * @param resourceType - Typ zasobu (image, raw, video)
   * @returns Informacje o usuniętym pliku
   */
  async deleteFromCloudinary(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image') {
    try {
      const result = await cloudinary.v2.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      
      return result;
    } catch (error) {
      console.error('Błąd podczas usuwania pliku z Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Usuwa plik lokalny
   * @param filePath - Ścieżka do pliku
   */
  removeLocalFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Nie można usunąć pliku: ${filePath}`, error);
    }
  }

  /**
   * Zapisuje plik lokalnie (bez przesyłania do Cloudinary)
   * @param file - Plik z multera
   * @param destination - Ścieżka docelowa
   * @returns Informacje o zapisanym pliku
   */
  saveLocalFile(file: Express.Multer.File, destination: string) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}-${uuidv4()}${ext}`;
      const targetPath = path.join(destination, filename);
      
      // Utwórz katalog docelowy, jeśli nie istnieje
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      
      // Kopiuj plik
      fs.copyFileSync(file.path, targetPath);
      
      // Usuń plik tymczasowy
      this.removeLocalFile(file.path);
      
      return {
        filename,
        path: targetPath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error('Błąd podczas zapisywania pliku lokalnie:', error);
      throw error;
    }
  }

  /**
   * Przygotowuje URL dla plików przechowywanych lokalnie
   * @param relativePath - Względna ścieżka pliku
   * @returns Pełny URL do pliku
   */
  getFileUrl(relativePath: string) {
    // Bazowy URL API + ścieżka względna
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Pobiera publicId z URL Cloudinary
   * @param url - URL pliku Cloudinary
   * @returns Public ID pliku
   */
  getPublicIdFromUrl(url: string) {
    try {
      const parts = url.split('/');
      const fileName = parts.pop() || '';
      const folderPath = parts[parts.length - 2] === 'upload' ? '' : parts.slice(parts.indexOf('upload') + 1).join('/');
      const fileNameWithoutExtension = fileName.split('.')[0];
      
      return folderPath ? `${folderPath}/${fileNameWithoutExtension}` : fileNameWithoutExtension;
    } catch (error) {
      console.error('Błąd podczas pobierania publicId z URL:', error);
      return null;
    }
  }

  /**
   * Obsługuje przesyłanie zdjęć produktów do Cloudinary
   * @param files - Pliki z multera
   * @returns Tablica URL zdjęć
   */
  async uploadProductImages(files: Express.Multer.File[]) {
    const options: UploadOptions = {
      folder: 'ekodirekt/products',
      transformation: [
        { width: 1200, crop: 'limit' }, // Ogranicz szerokość do 1200px
        { quality: 'auto:good' }, // Automatyczna optymalizacja jakości
      ],
    };
    
    const results = await this.uploadMultipleToCloudinary(files, options);
    return results.map(result => result.url);
  }

  /**
   * Obsługuje przesyłanie certyfikatów do Cloudinary
   * @param files - Pliki z multera
   * @returns Tablica URL certyfikatów
   */
  async uploadCertificates(files: Express.Multer.File[]) {
    const options: UploadOptions = {
      folder: 'ekodirekt/certificates',
      resourceType: 'auto', // Automatycznie wykryj typ zasobu (PDF lub obraz)
    };
    
    const results = await this.uploadMultipleToCloudinary(files, options);
    return results.map(result => result.url);
  }

  /**
   * Obsługuje przesyłanie dokumentów do Cloudinary
   * @param files - Pliki z multera
   * @returns Tablica URL dokumentów
   */
  async uploadDocuments(files: Express.Multer.File[]) {
    const options: UploadOptions = {
      folder: 'ekodirekt/documents',
      resourceType: 'auto', // Automatycznie wykryj typ zasobu
    };
    
    const results = await this.uploadMultipleToCloudinary(files, options);
    return results.map(result => result.url);
  }

  /**
   * Obsługuje przesyłanie zdjęcia profilowego użytkownika
   * @param file - Plik z multera
   * @returns URL zdjęcia profilowego
   */
  async uploadProfileImage(file: Express.Multer.File) {
    const options: UploadOptions = {
      folder: 'ekodirekt/profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Przytnij do kwadratu, wycentruj na twarzy
        { quality: 'auto:good' }, // Automatyczna optymalizacja jakości
      ],
    };
    
    const result = await this.uploadToCloudinary(file.path, options);
    return result.url;
  }
}

export default new FileService();