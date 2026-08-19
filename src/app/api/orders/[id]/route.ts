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
        const email = decodedToken.email;

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

        if (orderData?.uid !== uid &&
            email !== "admin123@gmail.com"
        ) {
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

export async function PATCH(
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
                { status: 401 }
            );
        }

        const idToken = authorization.split("Bearer ")[1];

        const decodedToken = await auth.verifyIdToken(idToken);

        const email = decodedToken.email;

        // Hanya admin yang boleh mengubah status
        if (email !== "admin123@gmail.com") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forbidden",
                },
                { status: 403 }
            );
        }

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

        const body = await request.json();

        const { status } = body;

        const allowedStatuses = [
            "pending",
            "printing",
            "completed",
        ];

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid status",
                },
                { status: 400 }
            );
        }

        const orderRef = db
            .collection("orders")
            .doc(id);

        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Order not found",
                },
                { status: 404 }
            );
        }

        await orderRef.update({
            status,
        });

        return NextResponse.json({
            success: true,
            message: "Order status updated",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update order",
            },
            { status: 500 }
        );
    }
}