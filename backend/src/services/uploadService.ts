import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Konfiguracja Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Przesyła pliki do Cloudinary
 * @param files Pliki do przesłania
 * @param folder Folder w Cloudinary (opcjonalny)
 * @returns Tablica URL-i przesłanych plików
 */
export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
  folder = 'ekodirekt/products'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      // Unikalny identyfikator dla nazwy pliku
      const fileId = uuidv4();
      
      // Pełna ścieżka do pliku
      const filePath = file.path;
      
      // Przesłanie pliku do Cloudinary
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: folder,
        public_id: fileId,
        // Opcje transformacji obrazu
        transformation: [
          { width: 1200, crop: 'limit' }, // Ogranicz szerokość do 1200px
          { quality: 'auto:good' }, // Automatyczna optymalizacja jakości
        ],
      });
      
      // Usuń plik tymczasowy
      fs.unlinkSync(filePath);
      
      // Zwróć URL przesłanego pliku
      return result.secure_url;
    });
    
    // Czekaj na przesłanie wszystkich plików
    const imageUrls = await Promise.all(uploadPromises);
    
    return imageUrls;
  } catch (error) {
    // Usuń pliki tymczasowe w przypadku błędu
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    throw error;
  }
};

/**
 * Usuwa obraz z Cloudinary
 * @param imageUrl URL obrazu do usunięcia
 * @returns Informacja o powodzeniu operacji
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    // Wyodrębnij public_id z URL
    const urlParts = imageUrl.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folderPath = urlParts.slice(urlParts.indexOf('ekodirekt'), urlParts.length - 1).join('/');
    const publicId = `${folderPath}/${filename}`;
    
    // Usuń obraz
    const result = await cloudinary.v2.uploader.destroy(publicId);
    
    return result.result === 'ok';
  } catch (error) {
    console.error('Błąd podczas usuwania obrazu z Cloudinary:', error);
    return false;
  }
};