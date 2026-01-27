import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET user profile
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        location: true,
        isVerified: true,
        followerCount: true,
        followingCount: true,
        snippetCount: true,
        totalLikesReceived: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user follows this user
    let isFollowing = false;
    if (session?.user?.id && session.user.id !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      ...user,
      isFollowing,
      isOwnProfile: session?.user?.id === id,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, bio, website, github, twitter, location, avatarUrl } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        github: github?.trim() || null,
        twitter: twitter?.trim() || null,
        location: location?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        location: true,
        isVerified: true,
        followerCount: true,
        followingCount: true,
        snippetCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
