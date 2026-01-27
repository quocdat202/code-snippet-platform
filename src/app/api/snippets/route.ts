import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all snippets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const topic = searchParams.get("topic");
    const tag = searchParams.get("tag");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent"; // recent, popular, mostLiked
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Show public snippets, or private ones if user is the owner
    if (userId && session?.user?.id === userId) {
      where.userId = userId;
    } else if (userId) {
      where.userId = userId;
      where.isPublic = true;
    } else {
      where.isPublic = true;
    }

    if (language) where.language = language;
    if (topic) where.topics = { has: topic };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    // Sorting
    let orderBy: object = { createdAt: "desc" };
    if (sort === "popular") orderBy = { viewCount: "desc" };
    if (sort === "mostLiked") orderBy = { likeCount: "desc" };

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.snippet.count({ where }),
    ]);

    return NextResponse.json({
      snippets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch snippets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

// CREATE snippet
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, code, language, topics, complexity, isPublic, tagIds } = body;

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: "Title, code, and language are required" },
        { status: 400 }
      );
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        description,
        code,
        language,
        topics: topics || [],
        complexity,
        isPublic: isPublic ?? true,
        userId: session.user.id,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId: number) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Update user snippet count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { snippetCount: { increment: 1 } },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Create snippet error:", error);
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    );
  }
}
