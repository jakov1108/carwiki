# Auto Wiki - Session State

## Completed Tasks
1. Implementiran upload slika za Admin panel
2. Popravljeni React hooks u Admin.tsx (hooks moraju biti prije uvjetnih return-a)
3. Dodano createdAt polje u cars tablicu
4. Automobili se sada sortiraju od najnovijih do najstarijih

## Key Changes Made
- `server/imageUpload.ts` - Jednostavan upload na lokalni filesystem
- `server/routes.ts` - Rute za upload (POST /api/upload-image) i serviranje slika (GET /uploads/:filename)
- `client/src/components/ObjectUploader.tsx` - Upload komponenta
- `client/src/pages/Admin.tsx` - Popravljeni hooks redoslijed (useMutation PRIJE uvjetnih return-a)
- `shared/schema.ts` - Dodano createdAt polje u cars tablicu
- `server/storage.ts` - Sortiranje po createdAt DESC

## Technical Notes
- Slike se spremaju u `uploads/` direktorij
- POST /api/upload-image za upload (vraća imagePath)
- GET /uploads/:filename za serviranje
- Automobili sortirani: orderBy(desc(cars.createdAt))
- VAŽNO: React hooks moraju biti na vrhu komponente PRIJE bilo kakvih uvjetnih return naredbi

## Admin Credentials
- Email: admin@autowiki.com
- Password: admin123

## Status
Server pokrenut i radi. Hooks greška popravljena.
