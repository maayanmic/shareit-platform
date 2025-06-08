declare module "firebase-config" {
  import { User } from "firebase/auth";
  
  export const auth: any;
  export const signInWithGoogle: () => Promise<User>;
  export const signInWithFacebook: () => Promise<User>;
  export const registerWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  export const loginWithEmail: (email: string, password: string) => Promise<User>;
  export const logoutUser: () => Promise<void>;
  export const getUserData: (userId: string) => Promise<any>;
  export const handleAuthRedirect: () => Promise<any>;
} 