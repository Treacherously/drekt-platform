import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'ADMIN' | 'SUPPLIER' | 'GUEST';
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'SUPPLIER' | 'GUEST';
    isVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'SUPPLIER' | 'GUEST';
    isVerified: boolean;
  }
}
