import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Toggle bookmark on a snippet
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

    const snippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_snippetId: {
          userId: session.user.id,
          snippetId: id,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });

      return NextResponse.json({ bookmarked: false, message: "Bookmark removed" });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          snippetId: id,
        },
      });

      return NextResponse.json({ bookmarked: true, message: "Bookmarked" });
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

// GET bookmark status
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ bookmarked: false });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_snippetId: {
          userId: session.user.id,
          snippetId: id,
        },
      },
    });

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch {
    return NextResponse.json(
      { error: "Failed to get bookmark status" },
      { status: 500 }
    );
  }
}
