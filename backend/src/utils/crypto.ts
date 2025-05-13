import crypto from 'crypto';

/**
 * Generuje losowy token weryfikacyjny
 * @returns Token weryfikacyjny (32 znaki hex)
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generuje losową sól do hashowania haseł
 * @param length Długość soli
 * @returns Sól w postaci ciągu znaków
 */
export const generateSalt = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('base64');
};

/**
 * Hashuje hasło przy użyciu algorytmu PBKDF2
 * @param password Hasło do hashowania
 * @param salt Sól do hashowania (opcjonalna)
 * @returns Hash i użyta sól
 */
export const hashPassword = async (password: string, salt?: string): Promise<{ hash: string; salt: string }> => {
  // Jeśli sól nie została podana, wygeneruj nową
  const passwordSalt = salt || generateSalt();
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, passwordSalt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({
        hash: derivedKey.toString('hex'),
        salt: passwordSalt,
      });
    });
  });
};

/**
 * Weryfikuje hasło porównując je z przechowywanym hashem
 * @param password Hasło do weryfikacji
 * @param storedHash Przechowywany hash
 * @param salt Sól użyta do hashowania
 * @returns True jeśli hasło jest poprawne, false w przeciwnym razie
 */
export const verifyPassword = async (password: string, storedHash: string, salt: string): Promise<boolean> => {
  try {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
  } catch (error) {
    return false;
  }
};