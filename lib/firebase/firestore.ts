import { db } from "./config";
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (uid: string) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().role as 'reporter' | 'supervisor';
        }
        return null;
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
};
