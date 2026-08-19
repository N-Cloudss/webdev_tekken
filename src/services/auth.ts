import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserProfile } from "./user";
import { pass } from "three/tsl";

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
    const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    if (result.user.email === "admin123@gmail.com") {
        return {
            user: result.user,
            role: "admin",
        };
    }

    return {
        user: result.user,
        role: "client",
    };
}

export async function logout() {
    return signOut(auth);
}