import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

export interface AdditionalData {
  fullname: string;
  registrationNumber: string;
}

export const registerUser = async (
  email: string,
  password: string,
  additionalData: AdditionalData
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    

    // Adicionar informações adicionais no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      ...additionalData,
      createdAt: new Date(),
    });


    await sendEmailVerification(user);

    return userCredential;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};


export const loginUser = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };