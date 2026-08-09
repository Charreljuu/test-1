CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  city_ascii TEXT,
  lat REAL,
  lon REAL,
  admin_name TEXT,
  population INTEGER DEFAULT 0,
  name_cn TEXT,
  country_cn TEXT,
  admin_cn TEXT
);

CREATE INDEX IF NOT EXISTS idx_city ON cities(city);
CREATE INDEX IF NOT EXISTS idx_country_cn ON cities(country_cn);
CREATE INDEX IF NOT EXISTS idx_population ON cities(population);
