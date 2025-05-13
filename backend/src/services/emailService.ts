import nodemailer from 'nodemailer';

/**
 * Konfiguracja transportera dla nodemailer
 * W środowisku produkcyjnym powinien być używany prawdziwy serwer SMTP
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Konfiguracja dla środowiska produkcyjnego (np. Amazon SES, SendGrid, itp.)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Dla środowiska deweloperskiego używamy ethereal.email (fałszywy serwer SMTP)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.DEV_EMAIL_USER || 'ethereal_user',
        pass: process.env.DEV_EMAIL_PASS || 'ethereal_pass',
      },
    });
  }
};

/**
 * Wysyłanie emaila weryfikacyjnego
 * @param email Adres email odbiorcy
 * @param token Token weryfikacyjny
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const transporter = createTransporter();
    
    // URL weryfikacji (powinien być skonfigurowany w zmiennych środowiskowych)
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    // Konfiguracja wiadomości
    const mailOptions = {
      from: `"EkoDirekt" <${process.env.EMAIL_FROM || 'noreply@ekodirekt.pl'}>`,
      to: email,
      subject: 'Weryfikacja adresu email - EkoDirekt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Witaj w serwisie EkoDirekt!</h2>
          <p>Dziękujemy za rejestrację. Aby aktywować konto, kliknij w poniższy link:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #2E7D32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Zweryfikuj adres email
            </a>
          </p>
          <p>Jeśli nie rejestrowałeś się w serwisie EkoDirekt, zignoruj tę wiadomość.</p>
          <p>Link jest ważny przez 24 godziny.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">EkoDirekt - łączymy ekologicznych rolników z konsumentami</p>
        </div>
      `,
    };
    
    // Wysłanie emaila
    const info = await transporter.sendMail(mailOptions);
    
    // W środowisku deweloperskim wyświetl URL do podglądu emaila
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Email weryfikacyjny wysłany: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłania emaila weryfikacyjnego:', error);
    throw error;
  }
};

/**
 * Wysyłanie emaila z instrukcjami resetowania hasła
 * @param email Adres email odbiorcy
 * @param token Token resetowania hasła
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const transporter = createTransporter();
    
    // URL resetowania hasła
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    // Konfiguracja wiadomości
    const mailOptions = {
      from: `"EkoDirekt" <${process.env.EMAIL_FROM || 'noreply@ekodirekt.pl'}>`,
      to: email,
      subject: 'Resetowanie hasła - EkoDirekt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Resetowanie hasła</h2>
          <p>Otrzymaliśmy prośbę o resetowanie hasła dla Twojego konta. Aby ustawić nowe hasło, kliknij w poniższy link:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #2E7D32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Resetuj hasło
            </a>
          </p>
          <p>Jeśli nie prosiłeś o resetowanie hasła, zignoruj tę wiadomość.</p>
          <p>Link jest ważny przez 1 godzinę.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">EkoDirekt - łączymy ekologicznych rolników z konsumentami</p>
        </div>
      `,
    };
    
    // Wysłanie emaila
    const info = await transporter.sendMail(mailOptions);
    
    // W środowisku deweloperskim wyświetl URL do podglądu emaila
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Email z resetowaniem hasła wysłany: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłania emaila z resetowaniem hasła:', error);
    throw error;
  }
};