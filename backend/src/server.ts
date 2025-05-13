import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Załaduj zmienne środowiskowe z pliku .env
dotenv.config();

// Importuj aplikację Express
import app from './app';

// Importuj funkcję do połączenia z bazą danych
import { connectToDatabase } from './models';

// Obsługa nieobsłużonych wyjątków
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Port aplikacji
const PORT = process.env.PORT || 5000;

// Serwer HTTP
const server = createServer(app);

// Uruchomienie serwera
async function startServer() {
  try {
    // Połącz z bazą danych
    await connectToDatabase();
    
    // Uruchom serwer HTTP
    server.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Uruchom serwer
startServer();

// Obsługa nieobsłużonych odrzuceń Promise
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Obsługa sygnałów zamknięcia
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});