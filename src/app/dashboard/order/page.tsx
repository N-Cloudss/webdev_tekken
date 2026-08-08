"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { uploadSTL } from "@/services/storage";

export default function Order() {
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        if (!file) return;

        const user = auth.currentUser;

        if (!user) {
            alert("Please login first.");
            return;
        }

        try {
            await uploadSTL(user.uid, file);
            alert("Upload successful!");
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".stl"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button onClick={handleUpload}>
                Upload
            </button>
        </div>
    );
}