// passwordReset.ts
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase.config";

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
  }
};
