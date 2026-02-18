import { auth, db } from "./config";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    User
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signUp = async (email: string, password: string, name: string, role: 'reporter' | 'supervisor') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Create user document in Firestore with role
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        throw error;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        throw error;
    }
}
