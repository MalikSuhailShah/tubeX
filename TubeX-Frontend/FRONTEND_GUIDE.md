# TubeX Frontend learning guide

## 1. Start here

Read files in this order:

1. `src/main.jsx` — application entry point.
2. `src/App.jsx` — route tree.
3. `src/components/AppLayout.jsx` — common page shell.
4. `src/components/Header.jsx` — search, navigation, logout.
5. `src/components/Sidebar.jsx` — Redux + React Router navigation.
6. `src/app/store.js` — Redux store.
7. `src/features/auth/authSlice.js` — current user state and local persistence.
8. `src/api/client.js` — Axios instance and authentication interceptor.
9. `src/api/*.js` — one small module per backend feature.
10. `src/pages/Home.jsx` — first API-driven page.
11. `src/components/VideoCard.jsx` — reusable video UI.
12. `src/pages/Watch.jsx` — video detail + like + subscribe + playlist + comments.
13. `src/pages/Studio.jsx` — dashboard endpoints.

## 2. The core flow

For a video request:

`Home.jsx -> getVideos() -> Axios -> GET /api/v1/videos -> video.controller.js -> MongoDB -> ApiResponse -> Home.jsx -> VideoCard`

For login:

`Login.jsx -> loginUser() -> Axios -> POST /api/v1/users/login -> loginUser controller -> accessToken + user -> Redux setUser + localStorage -> ProtectedRoute`

For a protected request:

`Component -> Axios interceptor -> Authorization: Bearer accessToken -> verifyJWT -> controller -> response`

## 3. Why Tailwind is inline

There are no component CSS class definitions such as `.header`, `.nav-item`, `.video-card`, etc.

Instead:

```jsx
<div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
```

Each utility describes one small visual rule. This keeps the JSX and its styling together while you learn the component.

## 4. Backend mismatches found during inspection

### Video update field

Your backend route currently contains:

`upload.single("req.file?.thumbnail")`

but a frontend form naturally sends `thumbnail`. If you want thumbnail replacement to work, change the backend to:

`upload.single("thumbnail")`

### Video media schema/controller

The schema describes `videoFile` and `thumbnail` as objects containing `url` and `public_id`, while `publishVideo` currently saves only `videoUploaded.url` and `thumbnailUploaded.url`.

The frontend therefore accepts either:

- a string URL, or
- `{ url, public_id }`

### Comments

`getVideoComments` returns comments without populating `owner`, so the frontend cannot know another comment owner's username/avatar. The UI labels non-owner comments as `TubeX user` until the backend populates the owner.

### Watch history

The watch-history controller currently does not visibly update `watchHistory` when a video is watched. The frontend displays whatever the backend returns.

### Views

There is no controller in the uploaded backend that increments a video's `views` when a video is opened. The frontend displays the stored `views` value.

## 5. Security model used by this frontend

The backend returns the access token in the login response, so the frontend stores it in localStorage and sends it as a Bearer token.

This is convenient for the current local project, but storing access tokens in localStorage has XSS risks in production. A production application should normally prefer secure, appropriately configured cookies and CSRF protection.
