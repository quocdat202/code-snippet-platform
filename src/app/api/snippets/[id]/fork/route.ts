import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Fork a snippet
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

    const originalSnippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!originalSnippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    if (!originalSnippet.isPublic && originalSnippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Cannot fork private snippet" }, { status: 403 });
    }

    // Create forked snippet
    const forkedSnippet = await prisma.snippet.create({
      data: {
        title: `${originalSnippet.title} (Fork)`,
        description: originalSnippet.description,
        code: originalSnippet.code,
        language: originalSnippet.language,
        topics: originalSnippet.topics,
        complexity: originalSnippet.complexity,
        isPublic: true,
        userId: session.user.id,
        tags: {
          create: originalSnippet.tags.map((t) => ({
            tagId: t.tagId,
          })),
        },
      },
    });

    // Create fork relationship
    await prisma.fork.create({
      data: {
        originalSnippetId: id,
        forkedSnippetId: forkedSnippet.id,
      },
    });

    // Update original snippet fork count
    await prisma.snippet.update({
      where: { id },
      data: { forkCount: { increment: 1 } },
    });

    // Update user snippet count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { snippetCount: { increment: 1 } },
    });

    // Create notification
    if (originalSnippet.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: originalSnippet.userId,
          type: "fork",
          actorId: session.user.id,
          snippetId: id,
        },
      });
    }

    return NextResponse.json(forkedSnippet, { status: 201 });
  } catch (error) {
    console.error("Fork error:", error);
    return NextResponse.json(
      { error: "Failed to fork snippet" },
      { status: 500 }
    );
  }
}
