import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

// GET single snippet
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
            followerCount: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        forkedFrom: {
          include: {
            originalSnippet: {
              select: {
                id: true,
                title: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            forks: true,
          },
        },
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check if private snippet
    if (!snippet.isPublic && snippet.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Track view
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Create view record and increment count
    await Promise.all([
      prisma.snippetView.create({
        data: {
          snippetId: id,
          userId: session?.user?.id || null,
          ipHash,
          userAgent: userAgent.substring(0, 255),
        },
      }),
      prisma.snippet.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    // Check if current user liked/bookmarked this snippet
    let isLiked = false;
    let isBookmarked = false;

    if (session?.user?.id) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_snippetId: {
              userId: session.user.id,
              snippetId: id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_snippetId: {
              userId: session.user.id,
              snippetId: id,
            },
          },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({
      ...snippet,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    console.error("Fetch snippet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippet" },
      { status: 500 }
    );
  }
}

// UPDATE snippet
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

    const snippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, code, language, topics, complexity, isPublic, tagIds } = body;

    // Save version before updating
    const versionCount = await prisma.snippetVersion.count({
      where: { snippetId: id },
    });

    await prisma.snippetVersion.create({
      data: {
        snippetId: id,
        version: versionCount + 1,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        changeNote: "Auto-saved before update",
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.snippetTag.deleteMany({
        where: { snippetId: id },
      });

      if (tagIds.length > 0) {
        await prisma.snippetTag.createMany({
          data: tagIds.map((tagId: number) => ({
            snippetId: id,
            tagId,
          })),
        });
      }
    }

    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: {
        title,
        description,
        code,
        language,
        topics,
        complexity,
        isPublic,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error("Update snippet error:", error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 }
    );
  }
}

// DELETE snippet
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

    const snippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.snippet.delete({
      where: { id },
    });

    // Update user snippet count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { snippetCount: { decrement: 1 } },
    });

    return NextResponse.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.error("Delete snippet error:", error);
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    );
  }
}
