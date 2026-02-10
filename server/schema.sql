-- Matches your Render "items" table: id (UUID), list_id (UUID), description (TEXT), status (TEXT).
-- No "title" column; the app stores the item name in "description" and maps it to "title" in API responses.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL,
  description TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS user_accounts (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);
