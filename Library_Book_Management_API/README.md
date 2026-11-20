# Library Book Management API

A small library book manager built with Node.js, Express, and MongoDB/Mongoose. It includes a browser interface and a REST API for creating, listing, updating, and deleting books.

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

1. Install the project dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your database connection string.
3. Start the server: `npm start`
4. Open `http://localhost:3000` for the browser interface.

The server uses port `3000` by default. Set `PORT` in `.env` to use another port. The `.env` file is ignored by Git; do not commit database credentials.

## API

All book routes use the `/books` path and accept and return JSON.

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/books` | Create a book (`201`) |
| `GET` | `/books` | List books (`200`) |
| `GET` | `/books/:id` | Get a book (`200`, `400` for invalid ID, `404` if missing) |
| `PUT` | `/books/:id` | Update a book (`200`, `400` for invalid input, `404` if missing) |
| `DELETE` | `/books/:id` | Delete a book (`200`, `400` for invalid ID, `404` if missing) |
| `GET` | `/health` | Check server health (`200`) |

The schema requires `title` and `author`. Optional fields are `price` (minimum `1`), `category`, and `isAvailable` (defaults to `true`).

Example create request:

```json
{
	"title": "The Alchemist",
	"author": "Paulo Coelho",
	"price": 12.5,
	"category": "Fiction",
	"isAvailable": true
}
```

## Postman

Import `postman/Library API.postman_collection.json`. Its default base URL is `http://localhost:3000`; set the `bookId` collection variable to test the get, update, and delete requests.

The local database name is `library_api`. Mongoose creates the `books` collection when the first book is saved.
