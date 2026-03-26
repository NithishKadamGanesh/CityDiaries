# CityDiaries

CityDiaries is a full-stack travel diary application built with Node.js, Express, EJS, MongoDB, Mongoose, Passport, and Cloudinary. It helps users document memorable places, upload photos, leave reviews, organize saved spots, and build lightweight trip collections for future travel plans.

## Highlights

- Create and manage city spot diary entries
- Upload one or more photos per spot
- Register and log in with session-based authentication
- Leave ratings and text reviews
- Search, filter, sort, and paginate the shared feed
- Save spots to Travel Plans
- Track saved spots as `Want to visit`, `Visited`, or `Recommended`
- Group places into named Collections for itinerary planning
- Run with local MongoDB persistence or an in-memory preview database fallback

## Tech Stack

### Backend

- Node.js
- Express
- Mongoose
- Passport + passport-local-mongoose
- Joi
- Multer
- Cloudinary

### Frontend

- EJS + ejs-mate layouts
- Bootstrap 5
- Custom CSS

### Security / Middleware

- Helmet
- `express-mongo-sanitize`
- `csurf`
- `express-session`
- `connect-flash`

## System Overview

CityDiaries is a server-rendered MVC application.

### Request Flow

1. Browser sends request to Express route
2. Route delegates to a controller
3. Controller reads or writes data through Mongoose models
4. Response is rendered through EJS templates
5. Static assets are served from `public/`

### Main Modules

- [app.js](./app.js): app bootstrap, middleware, auth wiring, DB startup
- [routes](./routes): route definitions for users, spots, reviews, and collections
- [controllers](./controllers): business logic and request handling
- [models](./models): Mongoose schemas and data relationships
- [views](./views): EJS templates
- [public](./public): stylesheets, client JS, uploads
- [utils](./utils): DB helpers, seed data, constants, shared helpers

## Architecture

### Pattern

The codebase follows a straightforward MVC structure:

- Models define persistent data and relationships
- Controllers contain feature logic
- Routes map HTTP endpoints to controller methods
- Views render HTML on the server

### Authentication

- Passport LocalStrategy handles username/password login
- Sessions are stored with `express-session`
- `passport-local-mongoose` manages hashing and auth helpers
- Protected routes use middleware such as `isLoggedIn`

### Image Upload Strategy

- If Cloudinary credentials are present, uploads go to Cloudinary
- If Cloudinary is not configured, uploads fall back to local disk storage in [public/uploads](./public/uploads)

### Database Strategy

- If `MONGO_URL` is set, the app connects to your real MongoDB instance
- If `MONGO_URL` is missing, the app starts an in-memory MongoDB instance using `mongodb-memory-server`
- On a fresh database, seed data is inserted automatically so the app is demo-ready

## Database Design

The application currently uses three main top-level collections in MongoDB.

### User

Defined in [models/user.js](./models/user.js)

Main fields:

- `username`
- `email`
- `favorites[]`
  - `spot`
  - `status`
  - `savedAt`
- `collections[]`
  - `name`
  - `description`
  - `spots[]`
  - `createdAt`

Purpose:

- authentication
- travel plan tracking
- trip collection ownership

### Spot

Defined in [models/spot.js](./models/spot.js)

Main fields:

- `title`
- `images[]`
- `category`
- `description`
- `location`
- `ratingAverage`
- `ratingCount`
- `author`
- `reviews[]`
- timestamps

Purpose:

- main diary entry object
- feed listing and detail pages

### Review

Defined in [models/review.js](./models/review.js)

Main fields:

- `body`
- `rating`
- `author`
- timestamps

Purpose:

- user-generated feedback for each spot

## Relationship Model

- A `User` can create many `Spot` entries
- A `Spot` belongs to one `User` as author
- A `Spot` can have many `Review` documents
- A `Review` belongs to one `User`
- A `User` can save many spots with a travel status
- A `User` can create many named collections
- A `Collection` can contain many spots

## Route Surface

### User Routes

- `GET /register`
- `POST /register`
- `GET /login`
- `POST /login`
- `GET /logout`

### Spot Routes

- `GET /`
- `GET /spots`
- `GET /spots/new`
- `POST /spots`
- `GET /spots/:id`
- `GET /spots/:id/edit`
- `PUT /spots/:id`
- `DELETE /spots/:id`
- `GET /spots/myspots`
- `GET /spots/saved`
- `POST /spots/:id/favorite`
- `POST /spots/:id/saved-status`

### Review Routes

- `POST /spots/:id/reviews`
- `DELETE /spots/:id/reviews/:reviewId`

### Collection Routes

- `GET /collections`
- `POST /collections`
- `GET /collections/:collectionId`
- `POST /collections/:collectionId/spots`
- `POST /collections/:collectionId/spots/:spotId/remove`

## Local Development

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file.

Example:

```env
PORT=8000
SESSION_SECRET=change-this-session-secret
MONGO_URL=mongodb://127.0.0.1:27017/CityDiaries
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret
```

### Start

```bash
npm start
```

Open:

- [http://localhost:8000](http://localhost:8000)

## Local MongoDB Setup

This project works with local MongoDB Community Server.

Current expected local connection string:

```env
MONGO_URL=mongodb://127.0.0.1:27017/CityDiaries
```

If MongoDB is installed and the Windows service is running, the app will persist data across restarts.

## Preview Mode

If you remove `MONGO_URL`, the app automatically switches to an in-memory preview database and seeds demo content.

Demo account:

- Username: `demo`
- Password: `citydiaries123`

## Feature Notes

### Travel Plans

Saved spots can be assigned one of these statuses:

- `Want to visit`
- `Visited`
- `Recommended`

### Collections

Collections are lightweight trip groups such as:

- `Prague Weekend`
- `Mumbai Food Crawl`
- `NYC Rooftops`

Each collection can contain multiple saved spots.

## Security Notes

- CSRF protection is enabled for forms
- Mongo query sanitization is enabled
- Helmet is enabled
- Session cookies use `httpOnly`
- Secrets should always live in `.env`, never in committed files

## Current Limitations

- No automated tests yet
- Session store is still the default memory store
- No public user profile pages yet
- No map-first browse experience yet

## Suggested Next Features

- public user profiles
- follow other diarists
- map-based explore page
- comments beyond star reviews
- draft entries
- trip date ranges and itinerary ordering

## API Docs

[Postman documentation](https://documenter.getpostman.com/view/15824392/TzRXA5vS)
