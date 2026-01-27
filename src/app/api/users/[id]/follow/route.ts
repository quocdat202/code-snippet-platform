import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Toggle follow
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

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });

      await Promise.all([
        prisma.user.update({
          where: { id: session.user.id },
          data: { followingCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id },
          data: { followerCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ following: false, message: "Unfollowed" });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: id,
        },
      });

      await Promise.all([
        prisma.user.update({
          where: { id: session.user.id },
          data: { followingCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id },
          data: { followerCount: { increment: 1 } },
        }),
      ]);

      // Create notification
      await prisma.notification.create({
        data: {
          userId: id,
          type: "follow",
          actorId: session.user.id,
        },
      });

      return NextResponse.json({ following: true, message: "Followed" });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

// GET follow status
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ following: false });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: id,
        },
      },
    });

    return NextResponse.json({ following: !!follow });
  } catch {
    return NextResponse.json(
      { error: "Failed to get follow status" },
      { status: 500 }
    );
  }
}
