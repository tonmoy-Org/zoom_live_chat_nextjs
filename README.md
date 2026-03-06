# 🎥 Zoom Live Chat

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-blue?style=flat&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

A high-performance, real-time group chat application designed for the **Zoom Live Chat** ecosystem. Built with a modern tech stack to provide seamless communication, media sharing, and administrative control.

---

## 🚀 Key Features

- **Real-Time Communication**: Instant messaging powered by Socket.io.
- **Media Sharing**: Direct image uploads and previews via Cloudinary integration.
- **Secure Authentication**: Custom NextAuth.js implementation using Username/Phone identifiers.
- **Admin Dashboard**: Comprehensive tools to manage messages, block/unblock users, and moderate chat groups.
- **Responsive UI**: Sleek, mobile-first design using Tailwind CSS and Radix UI primitives.
- **Live Notifications**: Real-time toast notifications for system alerts and user actions.

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Framework**: [Next.js 13](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Storage**: [Cloudinary](https://cloudinary.com/)

---

## ⚙️ Working Process & Logic

### 1. Authentication Flow
Users log in using their **Name**, **Username**, and **Phone Number**. 
- The system checks if the user exists in MongoDB.
- If it's a new user, an account is created automatically.
- Sessions are managed via JWT using `next-auth`.

### 2. Real-Time Socket Connection
- Upon entering a chat room (`/chat/[groupId]`), the client initializes a connection to `/api/socket`.
- The client emits `join-group` with the `groupId`.
- Messages sent via `send-message` are broadcasted to all users in the specific room using `socket.to(groupId).emit('new-message')`.

### 3. Media Handling
- Images are processed using `next-cloudinary`.
- When a user uploads an image, it is sent to Cloudinary.
- The returned image URL is then wrapped in a message object and sent through the socket and saved to the database.

### 4. Admin Management
- Admins have access to extended permissions.
- **Moderation**: Can delete or edit any message in the group.
- **User Control**: Ability to block/unblock users by updating their status in the database.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- MongoDB instance (Atlas or local)
- Cloudinary account for media storage

### Step-by-Step Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/react-labs-org/zoom_live_chat.git
   cd zoom_live_chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_uri

   # Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_UPLOAD_PRESET=your_preset

   # Public API
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

---

## 🧪 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/socket` | GET | Initializes the Socket.io server |
| `/api/messages` | GET | Fetches message history for a group |
| `/api/admin/users` | PATCH | Block/Unblock users |
| `/api/groups/settings`| PATCH | Update group configuration |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Developed with ❤️ by [Tonmoy](https://github.com/tonmoy-Org)
