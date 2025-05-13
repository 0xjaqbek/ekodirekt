import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// Rozszerzenie schematu User o pola potrzebne do autentykacji
export const updateUserSchema = () => {
  // Pobranie schematu User
  const UserSchema = mongoose.model('User').schema as Schema;
  
  // Dodanie pól do autentykacji jeśli jeszcze ich nie ma
  if (!UserSchema.path('refreshToken')) {
    UserSchema.add({
      refreshToken: {
        type: String,
      },
    });
  }
  
  if (!UserSchema.path('verificationToken')) {
    UserSchema.add({
      verificationToken: {
        type: String,
      },
    });
  }
  
  if (!UserSchema.path('resetPasswordToken')) {
    UserSchema.add({
      resetPasswordToken: {
        type: String,
      },
    });
  }
  
  if (!UserSchema.path('resetPasswordExpires')) {
    UserSchema.add({
      resetPasswordExpires: {
        type: Date,
      },
    });
  }
  
  // Metoda do porównywania hasła
  if (!UserSchema.methods.comparePassword) {
    UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
      try {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(candidatePassword, this.passwordHash);
      } catch (error) {
        throw new Error('Błąd podczas porównywania hasła');
      }
    };
  }
};

// Funkcja inicjalizująca modele autentykacji
export const initAuthModels = () => {
  // Aktualizuj schemat User o pola potrzebne do autentykacji
  updateUserSchema();
  
  // Zarejestruj wszystkie modele potrzebne do autentykacji (jeśli są dodatkowe)
  // Na przykład, model BlacklistedToken jeśli implementujemy czarną listę tokenów
  
  console.log('Modele autentykacji zostały zainicjalizowane');
};