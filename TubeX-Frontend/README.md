# TubeX Frontend

React + Vite + Tailwind CSS frontend for the uploaded TubeX Express/MongoDB backend.

## Run

1. Start the backend on port `9000`.
2. Copy `.env.example` to `.env` if desired.
3. Run:

```bash
npm install
npm run dev
```

The Vite proxy forwards `/api/*` to `http://localhost:9000`.

## Important backend compatibility notes

- Login returns `accessToken` and `refreshToken` in JSON, so the frontend stores the tokens and sends `Authorization: Bearer <accessToken>`.
- The backend also creates `Secure` cookies. Plain HTTP localhost should not be expected to rely on those cookies.
- Registration requires an avatar file.
- Video upload requires both `video` and `thumbnail` files.
- Comments currently return only the owner ObjectId because the backend does not populate the comment owner; the UI therefore cannot know another comment owner's name from that endpoint alone.
- Video and thumbnail fields are handled defensively because the schema describes nested objects while the publish controller currently saves Cloudinary URLs directly.
