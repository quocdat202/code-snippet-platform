import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all snippets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const topic = searchParams.get("topic");
    const userId = searchParams.get("userId");

    const where: {
      isPublic: boolean;
      language?: string;
      topics?: { has: string };
      userId?: string;
    } = { isPublic: true };

    if (language) where.language = language;
    if (topic) where.topics = { has: topic };
    if (userId) where.userId = userId;

    const snippets = await prisma.snippet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

// CREATE snippet
export async function POST(req: Request) {
  console.log("🤔🤔🤔 ~ POST ~ req:", req);
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, code, language, topics, complexity } = body;
    console.log("🤔🤔🤔 ~ POST ~ body:", body);

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
        userId: session.user.id,
      },
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
