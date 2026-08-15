# Event Booking Engine — Backend API

A backend REST API inspired by a simplified BookMyShow, built with Node.js, Express, and MongoDB.  
This is **Phase 0** — the clean foundation: server bootstrap, database connection, and health-check endpoint.

---

## Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| Runtime      | Node.js            |
| Framework    | Express.js         |
| Database     | MongoDB (Mongoose) |
| Config       | dotenv             |
| CORS         | cors               |
| Dev Server   | nodemon            |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── health.controller.js   # Health endpoint handler
│   ├── middleware/                 # (reserved for future phases)
│   ├── models/                    # (reserved for future phases)
│   ├── routes/
│   │   └── health.routes.js       # Health route definitions
│   ├── services/                  # (reserved for future phases)
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── .env.example                   # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

> You can get a free MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 3. Run in development

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or whichever `PORT` you set).  
Nodemon will automatically restart on file changes.

---

## API Endpoints

### Health Check

```
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "Event Booking Engine API is running"
}
```

---

## Available Scripts

| Script        | Command              | Description                          |
|---------------|----------------------|--------------------------------------|
| `npm run dev` | `nodemon src/server.js` | Start dev server with auto-reload |
| `npm start`   | `node src/server.js`    | Start production server           |

---

## Notes

- The server **only starts after MongoDB connects successfully**.  
- If the DB connection fails, the process exits with code 1 — no silent failures.  
- `.env` is excluded from version control via `.gitignore`.
