# EkoDirekt

Platforma łącząca ekologicznych rolników bezpośrednio z konsumentami, skracająca łańcuch dostaw i promująca zrównoważone rolnictwo.

## Opis projektu

EkoDirekt to platforma, która umożliwia:

- Rolnikom: wystawianie i sprzedaż produktów z certyfikatami
- Konsumentom: wyszukiwanie i zamawianie lokalnych produktów ekologicznych
- Śledzenie pochodzenia produktów przez kody QR
- Podstawowe funkcje społecznościowe i klimatyczne

## Technologie

### Frontend

- React + TypeScript + Vite
- Zarządzanie stanem: Zustand
- Routing: React Router 6
- Stylowanie: TailwindCSS
- API client: Axios + React Query
- Formularze: React Hook Form + Zod

### Backend

- Node.js + Express + TypeScript
- Baza danych: MongoDB (z Mongoose)
- Uwierzytelnianie: JWT
- Upload plików: Multer + Cloudinary
- Dokumentacja API: Swagger/OpenAPI
- Walidacja: Joi/Zod

### Infrastruktura

- Frontend hosting: Vercel/Netlify
- Backend hosting: Render/Railway
- Baza danych: MongoDB Atlas
- Storage: Cloudinary (zdjęcia)
- Płatności: Stripe

## Struktura projektu

Projekt jest zorganizowany jako monorepo z następującą strukturą:

- `frontend/` - aplikacja React
- `backend/` - API Express
- `shared/` - współdzielone typy i funkcje

## Instalacja i uruchomienie

### Wymagania

- Node.js (v18+)
- npm (v8+)
- MongoDB

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/twoje-repo/ekodirekt.git
cd ekodirekt

# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp backend/.env.example backend/.env
# Edytuj plik .env w katalogu backend z właściwymi wartościami
```

### Uruchomienie

```bash
# Uruchomienie frontendu i backendu jednocześnie (tryb deweloperski)
npm run dev

# Lub osobno:
npm run dev:frontend
npm run dev:backend

# Budowanie projektu
npm run build
```

## Licencja

ISC
