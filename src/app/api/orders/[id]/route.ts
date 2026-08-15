import { NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401}
            );
        }

        const idToken = authorization.split("Bearer ")[1];

        const decodedToken = await auth.verifyIdToken(idToken);

        const uid = decodedToken.uid;

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Order ID is required",
                },
                { status: 400 }
            );
        }

        const orderDoc = await db
            .collection("orders")
            .doc(id)
            .get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Order not found",
                },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data();

        if (orderData?.uid !== uid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forbidden",
                },
                { status: 403  }
            );
        }

        return NextResponse.json({
            success: true,
            order: {
                id: orderDoc.id,
                ...orderData,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch order",
            },
            { status: 500 }
        );
    }
}