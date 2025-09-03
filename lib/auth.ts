import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        username: { label: 'Username', type: 'text' },
        phone: { label: 'Phone', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.username || !credentials?.phone) {
          return null;
        }

        await connectDB();

        // Check if user exists by phone or username
        let user = await User.findOne({ 
          $or: [
            { phone: credentials.phone },
            { username: credentials.username.toLowerCase() }
          ]
        });

        if (!user) {
          // Check if username is already taken
          const existingUsername = await User.findOne({ username: credentials.username.toLowerCase() });
          if (existingUsername) {
            throw new Error('Username already taken');
          }

          // Check if phone is already taken
          const existingPhone = await User.findOne({ phone: credentials.phone });
          if (existingPhone) {
            throw new Error('Phone number already registered');
          }

          user = await User.create({
            name: credentials.name,
            username: credentials.username.toLowerCase(),
            phone: credentials.phone,
          });
        } else {
          // Update name if it has changed
          if (user.name !== credentials.name) {
            user.name = credentials.name;
            await user.save();
          }
        }

        if (user.isBlocked) {
          throw new Error('User is blocked');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};