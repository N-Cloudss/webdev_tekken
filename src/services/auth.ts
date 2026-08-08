import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserProfile } from "./user";

export async function register(
    name: string,
    email: string,
    password: string
) {
    const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await createUserProfile(
        result.user.uid,
        name,
        email
    );
        
    return result;
}

export async function login(
    email: string,
    password: string
) {
    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export async function logout() {
    return signOut(auth);
}