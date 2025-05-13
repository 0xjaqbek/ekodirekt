import multer from 'multer';
import path from 'path';

// Konfiguracja przechowywania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tymczasowo zapisz pliki w katalogu uploads
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Generowanie unikalnej nazwy pliku
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  },
});

// Filtrowanie plików - akceptuj tylko obrazy
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Akceptowane typy plików
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Akceptuj plik
    cb(null, true);
  } else {
    // Odrzuć plik
    cb(new Error('Nieprawidłowy format pliku. Akceptowane są tylko obrazy (JPEG, PNG, GIF, WEBP)'));
  }
};

// Konfiguracja multera
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit 5MB
  },
});

// Eksport middleware do obsługi błędów multera
export const handleMulterErrors = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // Błąd multera
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Plik jest za duży. Maksymalny rozmiar to 5MB.',
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Błąd przesyłania pliku: ${err.message}`,
    });
  } else if (err) {
    // Inny błąd
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};