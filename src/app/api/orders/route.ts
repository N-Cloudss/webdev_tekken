import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }
    
        const idToken = authorization.split("Bearer ")[1];

        const decodedToken = await auth.verifyIdToken(idToken);

        const uid = decodedToken.uid;
        const email = decodedToken.email ?? null;
        const name = decodedToken.name ?? null;

        const body = await request.json();

        const {
            fileName,
            storagePath,
            filament,
            infill,
            layerHeight,
            wallThickness,
            filamentUsedGrams,
            price,
        } = body;

        if (
            typeof fileName !== "string" ||
            fileName.trim() === ""
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file name",
                },
                { status: 400 }
            );
        }

        if (
            typeof filament !== "string" ||
            !["PLA", "PETG", "ABS"].includes(filament)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid filament",
                },
                { status: 400 }
            );
        }

        if (
            typeof infill !== "number" ||
            !Number.isFinite(infill) ||
            infill < 10 ||
            infill > 95 ||
            infill % 5 !== 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid infill",
                },
                { status: 400 }
            );
        }

        if (
            typeof layerHeight !== "number" ||
            ![0.12, 0.16, 0.20, 0.24, 0.28].includes(layerHeight)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid layer height",
                },
                { status: 400 }
            );
        }

        if (
            typeof wallThickness !== "number" ||
            ![0.4, 0.8, 1.2, 1.6, 2.0].includes(wallThickness)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid wall thickness",
                },
                { status: 400 }
            );
        }

        if (
            typeof filamentUsedGrams !== "number" ||
            !Number.isFinite(filamentUsedGrams) ||
            filamentUsedGrams <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid filament usage",
                },
                { status: 400 }
            );
        }

        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid price",
                },
                { status: 400 }
            );
        }

        if (
            typeof storagePath !== "string" ||
            storagePath.trim() === "" 
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid storage path",
                },
                { status: 400 }
            )
        }

        const orderRef = await db.collection("orders").add({
            uid,
            email,
            name,

            fileName,
            storagePath,
            
            filament,
            infill,
            layerHeight,
            wallThickness,
            filamentUsedGrams,
            price,

            status: "pending",
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            orderId: orderRef.id,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create order",
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const authorization = 
            request.headers.get("Authorization");
        
        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const idToken = 
            authorization.split("Bearer ")[1];

        const decodedToken = 
            await auth.verifyIdToken(idToken);

        const uid = decodedToken.uid;

        const snapshot = await db
            .collection("orders")
            .where("uid", "==", uid)
            .get();
        
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}