import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    username: string;
    phone: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      phone: string;
      role: string;
    };
  }
}