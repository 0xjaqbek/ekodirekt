import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';
import fileRoutes from './routes/fileRoutes';
import * as fileController from './controllers/fileController';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Importuj inne trasy

import { handleMulterErrors } from './middleware/uploadMiddleware';
import { handleUploadErrors } from './middleware/uploadMiddleware';


// Middleware do obsługi błędów
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Domyślna odpowiedź na błąd
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Wystąpił błąd serwera';
  
  // Dodatkowe informacje o błędzie w trybie deweloperskim
  const error = process.env.NODE_ENV === 'development' 
    ? { ...err, stack: err.stack } 
    : {};
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error }),
  });
};

const app = express();

app.use(handleUploadErrors);

// Serwowanie statycznych plików z katalogu uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Trasy dla obsługi plików
app.use('/api/files', fileRoutes);

// Trasy dla obsługi serwowania plików statycznych
app.get('/uploads/:type/:filename', fileController.serveStaticFile);

// Ustawienia bezpieczeństwa
app.use(helmet()); // Zabezpieczenia nagłówków HTTP
app.use(mongoSanitize()); // Zapobiega atakom NoSQL injection
app.use(xss()); // Zapobiega atakom XSS
app.use(hpp()); // Zapobiega zanieczyszczeniu parametrów HTTP

// Ogranicz liczbę żądań (zabezpieczenie przed atakami DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // 100 żądań na IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware parsowania
app.use(express.json({ limit: '10kb' })); // Limit wielkości JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parsowanie ciasteczek

// Compression - zmniejsza rozmiar odpowiedzi
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Umożliwia przesyłanie ciasteczek
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Statyczny folder dla plików uploads (potrzebny dla multera)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logowanie w trybie deweloperskim
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Obsługa błędów multera
app.use(handleMulterErrors);

// Trasy API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// Rejestruj inne trasy

// Obsługa nieistniejących tras
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Nie znaleziono: ${req.originalUrl}`,
  });
});

app.use('/api/orders', orderRoutes);

app.use('/api/payments', paymentRoutes);

// Middleware obsługi błędów
app.use(errorHandler);

export default app;