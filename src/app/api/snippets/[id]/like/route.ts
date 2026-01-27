import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Toggle like on a snippet
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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_snippetId: {
          userId: session.user.id,
          snippetId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      await Promise.all([
        prisma.snippet.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: snippet.userId },
          data: { totalLikesReceived: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ liked: false, message: "Unliked" });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          snippetId: id,
        },
      });

      await Promise.all([
        prisma.snippet.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: snippet.userId },
          data: { totalLikesReceived: { increment: 1 } },
        }),
      ]);

      // Create notification (if not self-like)
      if (snippet.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: snippet.userId,
            type: "like",
            actorId: session.user.id,
            snippetId: id,
          },
        });
      }

      return NextResponse.json({ liked: true, message: "Liked" });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET like status
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ liked: false, count: 0 });
    }

    const [like, snippet] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_snippetId: {
            userId: session.user.id,
            snippetId: id,
          },
        },
      }),
      prisma.snippet.findUnique({
        where: { id },
        select: { likeCount: true },
      }),
    ]);

    return NextResponse.json({
      liked: !!like,
      count: snippet?.likeCount || 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
