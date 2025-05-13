import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Maksymalne rozmiary plików dla różnych typów
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB dla zdjęć
  document: 10 * 1024 * 1024, // 10MB dla dokumentów
  certificate: 8 * 1024 * 1024, // 8MB dla certyfikatów
};

// Dozwolone typy plików
const ALLOWED_FILE_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  document: ['.pdf', '.doc', '.docx', '.txt', '.odt'],
  certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
};

// Tworzenie katalogów na pliki, jeśli nie istnieją
const createUploadsDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'uploads/documents',
    'uploads/certificates',
    'uploads/temp'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

// Tworzymy katalogi na pliki
createUploadsDirectories();

// Konfiguracja przechowywania plików lokalnie
const createStorage = (fileType: 'image' | 'document' | 'certificate') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      
      switch (fileType) {
        case 'image':
          uploadPath = path.join(__dirname, '../../uploads/images');
          break;
        case 'document':
          uploadPath = path.join(__dirname, '../../uploads/documents');
          break;
        case 'certificate':
          uploadPath = path.join(__dirname, '../../uploads/certificates');
          break;
        default:
          uploadPath = path.join(__dirname, '../../uploads/temp');
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Tworzymy unikalną nazwę pliku
      const uniqueName = `${Date.now()}-${uuidv4()}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueName}${ext}`);
    },
  });
};

// Funkcja sprawdzająca typ pliku
const fileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Nieprawidłowy typ pliku. Dozwolone formaty: ${allowedTypes.join(', ')}`));
    }
  };
};

// Middleware do obsługi błędów uploadów
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Plik jest za duży.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Błąd uploadu: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Konfiguracje multera dla różnych typów plików
export const uploadImage = multer({
  storage: createStorage('image'),
  limits: { fileSize: FILE_SIZE_LIMITS.image },
  fileFilter: fileFilter(ALLOWED_FILE_TYPES.image),
});

export const uploadDocument = multer({
  storage: createStorage('document'),
  limits: { fileSize: FILE_SIZE_LIMITS.document },
  fileFilter: fileFilter(ALLOWED_FILE_TYPES.document),
});

export const uploadCertificate = multer({
  storage: createStorage('certificate'),
  limits: { fileSize: FILE_SIZE_LIMITS.certificate },
  fileFilter: fileFilter(ALLOWED_FILE_TYPES.certificate),
});

// Middleware czyszczący pliki tymczasowe po zakończeniu obsługi żądania
export const cleanupTempFiles = (req: Request, res: Response, next: NextFunction) => {
  const originalEnd = res.end;

  res.end = function (...args: any) {
    // Jeśli są pliki tymczasowe do usunięcia
    if (req.files) {
      // Usuwamy pliki tymczasowe (np. gdy błąd podczas przetwarzania)
      if (res.statusCode >= 400 && Array.isArray(req.files)) {
        req.files.forEach((file: Express.Multer.File) => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`Nie można usunąć pliku: ${file.path}`, err);
          }
        });
      }
    }

    originalEnd.apply(res, args);
  };

  next();
};