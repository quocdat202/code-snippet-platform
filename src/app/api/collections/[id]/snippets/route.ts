import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Add snippet to collection
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { snippetId } = body;

    if (!snippetId) {
      return NextResponse.json(
        { error: "Snippet ID is required" },
        { status: 400 }
      );
    }

    // Check if snippet exists
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.collectionSnippet.findUnique({
      where: {
        collectionId_snippetId: {
          collectionId: parseInt(id),
          snippetId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Snippet already in collection" },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxOrder = await prisma.collectionSnippet.findFirst({
      where: { collectionId: parseInt(id) },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const collectionSnippet = await prisma.collectionSnippet.create({
      data: {
        collectionId: parseInt(id),
        snippetId,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    // Update collection timestamp
    await prisma.collection.update({
      where: { id: parseInt(id) },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(collectionSnippet, { status: 201 });
  } catch (error) {
    console.error("Add to collection error:", error);
    return NextResponse.json(
      { error: "Failed to add snippet to collection" },
      { status: 500 }
    );
  }
}

// Remove snippet from collection
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const snippetId = searchParams.get("snippetId");

    if (!snippetId) {
      return NextResponse.json(
        { error: "Snippet ID is required" },
        { status: 400 }
      );
    }

    await prisma.collectionSnippet.delete({
      where: {
        collectionId_snippetId: {
          collectionId: parseInt(id),
          snippetId,
        },
      },
    });

    return NextResponse.json({ message: "Removed from collection" });
  } catch (error) {
    console.error("Remove from collection error:", error);
    return NextResponse.json(
      { error: "Failed to remove snippet from collection" },
      { status: 500 }
    );
  }
}
