import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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