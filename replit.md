# Auto Wiki - Automotive Encyclopedia & Blog Platform

## Project Overview

Auto Wiki is a comprehensive web application for automotive enthusiasts, featuring a searchable database of cars with detailed specifications, a blog platform for automotive articles, user authentication with role-based access control, and an admin panel for content management. Built as an HCI (Human-Computer Interaction) project for FESB.

## Features

### Core Functionality
- **Car Database**: Browse and search automobiles with detailed technical specifications
- **Car Comparison**: Select up to 3 cars and compare their specifications side-by-side
- **Blog Platform**: Read expert articles about automotive history, technology, and reviews
- **User Authentication**: Register, login, and role-based access control (admin/user)
- **Admin Panel**: Add and manage cars and blog posts (admin-only)
- **Contact Page**: Send messages to the team
- **About Page**: Learn about the project and technologies used

### Technical Features
- Responsive design (mobile-first approach)
- Real-time search and filtering
- Form validation with Zod schemas
- Type-safe API with TypeScript
- PostgreSQL database with Drizzle ORM
- Session-based authentication with Passport.js
- Beautiful UI with Shadcn components
- Dark mode support (configured but not actively toggled)

## Technology Stack

### Frontend
- React 18
- TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- Shadcn UI (component library)
- React Hook Form + Zod (form validation)
- Lucide React (icons)

### Backend
- Express.js
- TypeScript
- PostgreSQL (Neon-backed)
- Drizzle ORM
- Passport.js + express-session (authentication)
- bcryptjs (password hashing)
- Zod validation

## Project Structure

```
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CarCard.tsx
│   │   │   ├── BlogCard.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Cars.tsx
│   │   │   ├── CarDetail.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── BlogPost.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Compare.tsx
│   │   ├── lib/
│   │   │   └── auth.tsx  # Auth context and hooks
│   │   └── App.tsx
│   └── index.html
├── server/                # Backend application
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage layer
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Passport.js configuration
│   ├── seed.ts            # Database seeding
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts
├── attached_assets/       # Generated images
└── design_guidelines.md   # Design system documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Cars (protected: POST/PUT/DELETE require admin role)
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car (admin only)
- `PUT /api/cars/:id` - Update car (admin only)
- `DELETE /api/cars/:id` - Delete car (admin only)

### Blog (protected: POST/PUT/DELETE require admin role)
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get blog post by ID
- `POST /api/blog` - Create new blog post (admin only)
- `PUT /api/blog/:id` - Update blog post (admin only)
- `DELETE /api/blog/:id` - Delete blog post (admin only)

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all contact messages

## Data Models

### User
- ID, Email (unique), Password (hashed), Name, Role (admin/user), CreatedAt

### Car
- Brand, Model, Year
- Description
- Image URL
- Specifications: Engine, Power, Acceleration, Consumption, Drive Type
- Category (Compact, Sedan, SUV, Electric, Sports)
- Optional video URL

### Blog Post
- Title, Content, Excerpt
- Author, Date
- Category (Povijest, Tehnologija, Recenzije, Vijesti)
- Featured image

### Contact Message
- Name, Email, Message
- Timestamp

## Design System

### Color Palette
- Primary: Blue (#3b82f6)
- Accent: Cyan
- Backgrounds: Slate/Black tones
- Tech-automotive aesthetic

### Typography
- Font Family: Inter (sans-serif)
- Responsive font sizes
- Clear hierarchy with bold headings

### Components
- Cards with hover effects
- Sticky navigation
- Full-width hero sections
- Grid layouts for content
- Form inputs with validation

## Recent Changes

- **2024-12-15**: Upload Slika u Admin Panelu
  - Implementirana funkcionalnost uploada slika umjesto unosa URL-a
  - Kreiran ObjectUploader komponent za drag & drop upload
  - Dodani server-side object storage service i ACL datoteke
  - API rute za upload (`POST /api/objects/upload`) i potvrdu (`PUT /api/objects/confirm`)
  - Slike se serviraju s `/objects/:objectPath` rute
  - Potrebna PRIVATE_OBJECT_DIR environment varijabla za konfiguraciju

- **2024-12-04**: Poboljšana Stranica Usporedbe Automobila
  - Svi automobili sada prikazani u kompaktnim karticama za direktni odabir
  - Pretraživanje i filtriranje po kategorijama (Sve kategorije, Compact, SUV, Sedan, Electric, Sports)
  - Grid sa 2-6 stupaca ovisno o veličini ekrana za bolji responsive dizajn
  - Vizualna indikacija odabranih automobila (plavi prsten i kvačica)
  - Onemogućeni automobili kada je već odabrano 3 (max za usporedbu)
  - Brojač odabranih automobila (0/3 odabrano) u naslovu
  - Usporedba se prikazuje iznad grida kada su automobili odabrani
  - Zadržana kompatibilnost sa URL parametrima za deep-linking

- **2024-11-11**: Klikabilni Feature Banneri na Početnoj Stranici
  - Svi banneri (Baza Automobila, Blog & Vijesti, Pouzdani Podaci) sada vode na odgovarajuće stranice
  - Link komponente sa `block` display-om omogućavaju klik na cijelu karticu
  - Dodani hover/active efekti (`hover-elevate`, `active-elevate-2`) za bolju interaktivnost
  - Potpuna pokrivenost sa `data-testid` atributima za E2E testiranje
  - Navigacija: Baza Automobila → `/automobili`, Blog & Vijesti → `/blog`, Pouzdani Podaci → `/o-nama`

- **2024-11-11**: Complete Car Database Restoration - 100 Vehicles
  - Restored full database of 100 popular cars from Croatian market (2024-2025)
  - Created `server/carData.ts` as single source of truth for all vehicle data
  - Category distribution: SUV (48), Compact (22), Sedan (12), Electric (12), Sports (6)
  - Fixed critical categorization: Nissan Qashqai correctly classified as SUV (pioneer of crossover segment)
  - All vehicles include Croatian descriptions, realistic specifications, and Unsplash images
  - Seed script implements bulk insert with idempotent seeding (onConflictDoNothing)
  - Featured brands: VW, Škoda, Renault, Dacia, Opel, Peugeot, Toyota, BMW, Mercedes, Audi, Tesla, and more
  - Budget to premium range: Dacia Sandero to Porsche Taycan
  - Database verified: All 100 cars successfully seeded and displayed in UI

- **2024-11-11**: Responsive Mobile Navigation
  - Implemented hamburger menu for mobile devices
  - Desktop: Horizontal navbar with all links visible
  - Mobile: Logo and hamburger icon, dropdown menu below navbar
  - Menu automatically closes when link is clicked
  - Added aria-label and aria-expanded for accessibility
  - Mobile-specific data-testid attributes for testing

- **2024-11-11**: Car Comparison Feature & Route Localization
  - Implemented complete side-by-side car comparison functionality
  - Added Compare.tsx page with grid layout for up to 3 cars
  - Added selection UI on Cars page with checkboxes and floating action bar
  - Created `/usporedi` localized Croatian route
  - Fixed UUID ID type handling (string IDs instead of numbers throughout)
  - Fixed all DOM nesting errors (removed nested `<a>` tags from wouter Link components)
  - Implemented proper query parameter handling using wouter's `useSearch()` hook
  - All pages now use Croatian localized routes: `/automobili`, `/usporedi`, `/prijava`, `/registracija`, `/kontakt`, `/o-nama`
  - Updated all internal links to use localized routes (Home, CarDetail, Login, Register)
  - Added data-testid attributes to interactive elements for E2E testing
  - Replaced `space-x-*` with `gap-*` and added `flex-wrap` for better responsive layouts

- **2024-10-30**: Database migration from in-memory to PostgreSQL
  - Implemented Drizzle ORM for type-safe database queries
  - Created seed script for populating initial data
  - All data now persists across server restarts

- **2024-10-30**: User authentication system
  - Implemented Passport.js with local strategy
  - Session-based authentication with secure cookies
  - Role-based access control (admin/user)
  - Protected admin routes (POST/PUT/DELETE endpoints)
  - Created Login and Register pages
  - Created auth context for frontend state management
  - Default admin user: admin@autowiki.com / admin123
  - Fixed security vulnerability preventing role escalation during registration

- **2024-10-30**: Video embedding support
  - Added YouTube and Vimeo video embedding on car detail pages
  - Robust URL parsing using URL API to extract video IDs
  - Handles YouTube watch?v=, youtu.be/, and Vimeo URLs
  - Responsive 16:9 aspect ratio video player
  - Graceful fallback if URL parsing fails

- **2024-10-30**: Social sharing features
  - Created ShareButtons component with Facebook, Twitter, LinkedIn, and copy-to-clipboard
  - Added share buttons to both CarDetail and BlogPost pages
  - Toast notifications for successful link copy
  - Implemented MetaTags component for Open Graph metadata
  - Dynamic OG tags (title, description, image, url, type) on car and blog pages
  - Proper cleanup prevents metadata pollution between pages

- **2024-10-30**: 100 Popular Cars in Croatia Database
  - Populated database with 100 most popular cars based on 2024-2025 Croatian market data
  - Created `server/carData.ts` with comprehensive car data including Croatian descriptions
  - Sourced real vehicle images via stock_image_tool (10 stock photos for top models)
  - Generated category-specific placeholder images (6 images covering all categories)
  - Implemented intelligent image mapping in seed.ts (stock photos → category fallbacks)
  - Performed 33 category corrections to ensure accurate classification:
    * **Compact**: C-segment hatchbacks (Clio, Corsa, Fabia, Golf, Polo, i20, i30, Ceed, Astra, A-Class, Mazda 3, Focus, etc.)
    * **Sedan**: D-segment family sedans (Octavia, Superb, Passat, Corolla, Civic, BMW 3, Mercedes C, Audi A3/A4, etc.)
    * **SUV**: All crossovers and SUVs (50+ models including T-Cross, Vitara, Duster, Tiguan, Tucson, all premium SUVs)
    * **Electric**: 19 electric vehicles (Tesla, Enyaq iV, ID.4, Ioniq 5, EV6, etc.)
    * **Sports**: 4 performance cars (BMW M4, CUPRA Formentor, Alfa Romeo Giulia, Porsche Taycan)
  - Database now contains authentic Croatian automotive market representation
  - All cars include realistic specifications and Croatian-language descriptions

## Getting Started

The application runs automatically via the "Start application" workflow. Access it at the Replit webview URL.

### Default Credentials
- **Admin**: admin@autowiki.com / admin123

### Using the Application

1. **Browse Cars**: Navigate to "Automobili" to see all cars, use search and filters
2. **Read Blog**: Visit "Blog" to read articles, filter by category
3. **Login**: Use /login to access your account
4. **Register**: Create new user account at /register
5. **Admin Panel**: Login as admin to add/edit cars and blog posts
6. **Contact**: Use "Kontakt" page to send messages

## Future Enhancements

- User reviews and ratings system for cars
- Advanced search with autocomplete
- Filter persistence in URL parameters
- User profile management
- Image upload functionality
- Comments system for blog posts

## Development

### Database Seeding
```bash
tsx server/seed.ts
```

### Database Schema Push
```bash
npm run db:push
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
