import { supabase } from "@/lib/supabase";

export async function uploadSTL(uid:string, file: File) {
    const fileName = `${uid}/${file.name}`;

    const { data, error } = await supabase.storage
        .from("3d-posm")
        .upload(fileName, file, {
            contentType: "model/stl"
        });

    if(error) {
        throw error;
    }

    return data;
}