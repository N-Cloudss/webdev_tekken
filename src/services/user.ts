import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createUserProfile(
    uid: string,
    name: string,
    email: string
) {
    await setDoc(doc(db, "users", uid), {
        name,
        email,
        createdAt: serverTimestamp(),
    });
}

export async function getUserProfile(uid: string) {
    const userDoc = await getDoc(doc(db, "users", uid));

    if(!userDoc.exists()) {
        return null;
    }

    return userDoc.data();
}