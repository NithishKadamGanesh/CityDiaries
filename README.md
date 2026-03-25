# CityDiaries

CityDiaries is a full-stack Express app for collecting memorable places from your travels. Users can create diary entries for spots they love, upload photos, leave reviews, browse a shared feed, and keep a personal "My Diary" collection.

## What Changed

This upgraded version includes:

- safer app config with environment-based secrets
- in-memory Mongo preview mode when `MONGO_URL` is not set
- seeded demo data for local previews
- local upload fallback when Cloudinary is not configured
- search, category filters, sorting, and pagination on the explore feed
- rating averages and review counts on cards and detail pages
- stronger validation, CSRF protection, Helmet, and Mongo sanitization
- refreshed landing page, explore feed, auth screens, and detail layout

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optionally create a `.env` file from `.env.example`.

3. Start the app:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Preview Mode

If you do not set `MONGO_URL`, the app automatically starts an in-memory MongoDB instance and seeds a demo account plus sample spots.

Demo login:

- Username: `demo`
- Password: `citydiaries123`

This makes the project runnable even without a local MongoDB install.

## Optional Environment Variables

See [.env.example](./.env.example)

Useful values:

- `MONGO_URL`
- `SESSION_SECRET`
- `PORT`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`

## File Uploads

- With Cloudinary credentials, uploads go to Cloudinary.
- Without Cloudinary credentials, uploads are stored locally in `public/uploads`.

## Notes

- The map preview uses a Google Maps embed query URL and no longer requires hardcoding an API key in the template.
- The repo still does not include automated tests yet.

## API Docs

[Postman documentation](https://documenter.getpostman.com/view/15824392/TzRXA5vS)
