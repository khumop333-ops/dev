import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const productCount = await prisma.product.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      activeProducts: productCount,
      timezone: "Africa/Johannesburg",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: err instanceof Error ? err.message : "Database check failed",
      },
      { status: 500 }
    );
  }
}
