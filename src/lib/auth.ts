import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase.config';

declare module 'next-auth'{
  interface Session {
    user: {
      role?: any;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: any;
      
    }
  }
}

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials) {
            return null;
          }
  
          try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

            // Recuperar roles do Firestore
            const userDoc = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDoc);
            const userData:any = userSnapshot.data();

            if(!userData.role){
                userData.role = 'common'
            }        
  
            if (user) {
              return {
                id: user.uid,
                email: user.email,
                name: userData.fullname,
                role: userData.role
              };
            }
          } catch (error) {
            console.error('Error during sign in:', error);
            return null;
          }
  
          return null;
        },
      }),
    ],
    callbacks:{
      async session({ session, token}){        
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
        };

        return session;
      },
      async jwt({ token, user }) {
        let userData:any = user;

        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = userData.role;
        }
        return token;
      },

    },
    pages: {
      signIn: '/login', // Caminho para sua página de login
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET, // Defina um segredo para a autenticação
  };