import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Serwis do przetwarzania obrazów
 */
class ImageService {
  /**
   * Konwertuje obraz do określonego formatu i rozmiarów
   * @param inputPath Ścieżka do pliku wejściowego
   * @param options Opcje przetwarzania obrazu
   * @returns Ścieżka do przetworzonego pliku
   */
  async processImage(inputPath: string, options: ImageProcessingOptions = {}): Promise<string> {
    // Domyślne opcje
    const defaultOptions: ImageProcessingOptions = {
      width: undefined,
      height: undefined,
      quality: 85,
      format: 'webp',
      fit: 'cover',
    };
    
    // Połącz opcje
    const processingOptions = { ...defaultOptions, ...options };
    
    // Katalog dla przetworzonych plików
    const outputDir = path.join(__dirname, '../../uploads/processed');
    
    // Utwórz katalog, jeśli nie istnieje
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generuj nazwę pliku wyjściowego
    const outputFilename = `${uuidv4()}.${processingOptions.format}`;
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
      // Podstawowa konfiguracja przetwarzania
      let sharpInstance = sharp(inputPath);
      
      // Zmiana rozmiaru, jeśli podano wymiary
      if (processingOptions.width || processingOptions.height) {
        sharpInstance = sharpInstance.resize({
          width: processingOptions.width,
          height: processingOptions.height,
          fit: processingOptions.fit as keyof sharp.FitEnum,
          withoutEnlargement: true, // Nie powiększaj małych obrazów
        });
      }
      
      // Konwersja formatu i jakości
      let formatOptions = {};
      
      if (processingOptions.format === 'jpeg') {
        formatOptions = { quality: processingOptions.quality, mozjpeg: true };
        sharpInstance = sharpInstance.jpeg(formatOptions);
      } else if (processingOptions.format === 'png') {
        formatOptions = { quality: processingOptions.quality, compressionLevel: 9 };
        sharpInstance = sharpInstance.png(formatOptions);
      } else if (processingOptions.format === 'webp') {
        formatOptions = { quality: processingOptions.quality };
        sharpInstance = sharpInstance.webp(formatOptions);
      }
      
      // Zapisz przetworzony obraz
      await sharpInstance.toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Błąd podczas przetwarzania obrazu:', error);
      throw error;
    }
  }
  
  /**
   * Tworzy miniaturkę obrazu
   * @param inputPath Ścieżka do pliku wejściowego
   * @param width Szerokość miniaturki
   * @param height Wysokość miniaturki
   * @returns Ścieżka do miniaturki
   */
  async createThumbnail(inputPath: string, width: number = 200, height: number = 200): Promise<string> {
    return this.processImage(inputPath, {
      width,
      height,
      format: 'webp',
      quality: 80,
      fit: 'cover',
    });
  }
  
  /**
   * Konwertuje obraz do formatu WebP
   * @param inputPath Ścieżka do pliku wejściowego
   * @param quality Jakość obrazu (1-100)
   * @returns Ścieżka do przetworzonego pliku
   */
  async convertToWebP(inputPath: string, quality: number = 85): Promise<string> {
    return this.processImage(inputPath, {
      format: 'webp',
      quality,
    });
  }
  
  /**
   * Optymalizuje obraz bez zmiany formatu
   * @param inputPath Ścieżka do pliku wejściowego
   * @param quality Jakość obrazu (1-100)
   * @returns Ścieżka do zoptymalizowanego pliku
   */
  async optimizeImage(inputPath: string, quality: number = 85): Promise<string> {
    const ext = path.extname(inputPath).toLowerCase().substring(1);
    let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
    
    if (ext === 'png') {
      format = 'png';
    } else if (ext === 'webp') {
      format = 'webp';
    }
    
    return this.processImage(inputPath, {
      format,
      quality,
    });
  }
  
  /**
   * Zmienia rozmiar obrazu
   * @param inputPath Ścieżka do pliku wejściowego
   * @param width Szerokość
   * @param height Wysokość
   * @param fit Typ dopasowania
   * @returns Ścieżka do przetworzonego pliku
   */
  async resizeImage(
    inputPath: string, 
    width: number, 
    height?: number, 
    fit: 'cover' | 'contain' | 'fill' = 'cover'
  ): Promise<string> {
    return this.processImage(inputPath, {
      width,
      height,
      fit,
    });
  }
  
  /**
   * Pobiera metadane obrazu
   * @param inputPath Ścieżka do pliku
   * @returns Metadane obrazu
   */
  async getImageMetadata(inputPath: string) {
    try {
      const metadata = await sharp(inputPath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      console.error('Błąd podczas pobierania metadanych obrazu:', error);
      throw error;
    }
  }
}

export default new ImageService();