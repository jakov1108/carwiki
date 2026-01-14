-- Dodavanje novih atributa za varijante automobila
-- Ovi stupci su nullable tako da postojeći podaci ostaju netaknuti

-- Težina i dimenzije
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS length TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS width TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS wheelbase TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS trunk_capacity TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS fuel_tank_capacity TEXT;

-- Dodatni opisi
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS pros TEXT;
ALTER TABLE car_variants ADD COLUMN IF NOT EXISTS cons TEXT;
