import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET user's collections
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = userId || session!.user!.id;
    const isOwner = session?.user?.id === targetUserId;

    const collections = await prisma.collection.findMany({
      where: {
        userId: targetUserId,
        ...(isOwner ? {} : { isPublic: true }),
      },
      include: {
        _count: {
          select: {
            snippets: true,
          },
        },
        snippets: {
          take: 3,
          orderBy: { addedAt: "desc" },
          include: {
            snippet: {
              select: {
                id: true,
                title: true,
                language: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Get collections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// CREATE new collection
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists for this user
    const existingCollection = await prisma.collection.findUnique({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug,
        },
      },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "Collection with this name already exists" },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        isPublic: isPublic ?? true,
        userId: session.user.id,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
