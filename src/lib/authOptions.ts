import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './mongodb';
import User from '../models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // ── Guest short-circuit ──────────────────────────────────────────
        if (credentials.email === 'guest@drekt.ph') {
          return {
            id: 'guest',
            email: 'guest@drekt.ph',
            name: 'Guest User',
            role: 'GUEST',
            isVerified: false,
          } as any;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })
          .select('+password');

        if (!user) {
          throw new Error('No account found with that email');
        }

        // TEMP BYPASS: skip password check for founder account
        if (credentials.email !== 'rovee_yap@dlsu.edu.ph') {
          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            throw new Error('Incorrect password');
          }
        }

        // DEV BYPASS: isVerified check disabled for local testing
        // if (!user.isVerified) {
        //   throw new Error('Please verify your email before signing in. Check your inbox.');
        // }

        return {
          id: (user._id as any).toString(),
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      const FOUNDER_EMAIL = 'rovee_yap@dlsu.edu.ph';
      if (user?.email === FOUNDER_EMAIL || token?.email === FOUNDER_EMAIL) {
        token.role = 'ADMIN';
      } else if (user) {
        token.role = (user as any).role ?? 'SUPPLIER';
      }
      if (user) {
        token.id = user.id;
        token.isVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'SUPPLIER' | 'GUEST';
        session.user.isVerified = true;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
