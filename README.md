# AutoWiki 🚗

Enciklopedija automobila na hrvatskom jeziku.

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, Radix UI
- **Backend:** Express.js, TypeScript
- **Baza:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Auth:** Better Auth (email/password autentifikacija)

## Postavljanje projekta

### 1. Supabase konfiguracija

1. Napravi projekt na [supabase.com](https://supabase.com)
2. U Supabase dashboardu:
   - **Settings → Database** → Kopiraj "Connection string (URI)"
   - **Settings → API** → Kopiraj "URL" i "service_role" key
   - **Storage** → Napravi novi bucket naziva `car-images` i postavi ga kao **Public**

### 2. Environment varijable

Kreiraj `.env` datoteku u root direktoriju:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters
APP_URL=http://localhost:5000
```

> **BETTER_AUTH_SECRET** mora imati minimalno 32 znaka. Možeš ga generirati s:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Instalacija i pokretanje

```bash
# Instaliraj pakete
npm install

# Kreiraj tablice u bazi
npm run db:push

# Kreiraj admin korisnika
npx tsx server/createAdmin.ts admin@autowiki.com lozinka123 Admin

# Pokreni development server
npm run dev
```

### 4. Pristup aplikaciji

- **Web:** http://localhost:5000
- **Admin panel:** http://localhost:5000/admin (nakon prijave s admin računom)

## Funkcionalnosti

- 🚘 Baza automobila s detaljnim specifikacijama
- 📷 Upload slika na Supabase Storage
- 📝 Blog sustav
- 🔐 Autentikacija s Better Auth:
  - ✅ Email/Password registracija i prijava
  - ✅ Automatsko hashiranje lozinki
  - ✅ Sigurno upravljanje sesijama
  - ✅ CSRF zaštita
  - ✅ Role-based pristup (user/admin)
- ⚖️ Usporedba automobila
- 📧 Kontakt forma

## Skripte

```bash
npm run dev      # Development server
npm run build    # Build za produkciju
npm run start    # Pokreni produkcijsku verziju
npm run db:push  # Sync sheme s bazom
```
