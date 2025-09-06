# Zoom Live Chat

## Overview

The `ChatGroup` component is a React-based group chat interface for **Zoom Live Chat** ([zoomchat.cloud](https://zoomchat.cloud)), built with Next.js and TypeScript. It enables real-time messaging via Socket.IO, image uploads through Cloudinary, and admin controls for managing messages and group settings. Integrated with `next-auth` for authentication and `shadcn/ui` for a responsive UI, it provides seamless group communication for users.

## Features

- Real-time text and image messaging with Socket.IO.
- Secure authentication via `next-auth`, redirecting unauthenticated users to login.
- Image uploads via Cloudinary, displayed inline.
- Admin controls: edit/delete messages, block/unblock users, manage group settings.
- Responsive design with mobile-friendly menu and smooth scrolling.
- Toast notifications for user actions and confirmations.
- Group banner display and searchable member list for admins.

## Installation

### Prerequisites
- Node.js (v16+)
- Next.js (v13+ with App Router)
- Cloudinary account
- Backend API with Socket.IO and MongoDB (or similar)

### Steps
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd zoom-live-chat
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   Key dependencies: `next-auth`, `socket.io-client`, `lucide-react`, `shadcn/ui`, `next/image`.

3. **Set Environment Variables**:
   In `.env.local`:
   ```env
   NEXTAUTH_URL=https://zoomchat.cloud
   NEXTAUTH_SECRET=<your-secret>
   CLOUDINARY_CLOUD_NAME=ddh86gfrm
   CLOUDINARY_UPLOAD_PRESET=ml_default
   NEXT_PUBLIC_API_URL=<backend-api-url>
   ```

4. **Run Application**:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000` or deploy to [zoomchat.cloud](https://zoomchat.cloud).

## Usage

- **Access**: Navigate to `/chat/[groupId]` on [zoomchat.cloud](https://zoomchat.cloud). Requires authentication.
- **Messaging**: Send text or images using the input field or paperclip icon.
- **Admin Features**:
  - Edit/delete messages or block/unblock users via message controls.
  - Manage messaging settings (e.g., restrict users) in the settings dialog.
- **Notifications**: Toasts confirm actions or display errors.

## Dependencies

- **Frontend**: `next-auth`, `socket.io-client`, `lucide-react`, `next/image`, `shadcn/ui` (Button, Input, Card, etc.).
- **Backend**: Assumes Node.js/Express with Socket.IO, MongoDB, and Cloudinary API.

## API Endpoints

- `GET /api/socket`: Initialize Socket.IO.
- `GET /api/groups/:groupId/messages`: Fetch messages.
- `POST /api/groups/:groupId/messages`: Send messages.
- `PATCH /api/admin/messages/:messageId`: Edit message.
- `DELETE /api/admin/messages/:messageId`: Delete message.
- `POST /api/admin/groups/:groupId/block-user`: Block/unblock user.
- `GET /api/admin/groups/:groupId/settings`: Fetch settings.
- `PATCH /api/admin/groups/:groupId/settings`: Update settings.

## Error Handling

- Redirects unauthenticated users to `/login`.
- Toasts for API errors, empty messages, or invalid image uploads.
- Validates user IDs and message content.

## Limitations

- "View Members" button lacks functionality (add `onClick` handler if needed).
- Image uploads tied to Cloudinary.
- Limited retry logic for API/socket failures.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

MIT License. See `LICENSE` file for details.