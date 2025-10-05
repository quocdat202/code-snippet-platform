import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET single snippet
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
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
    const { title, description, code, language, topics, complexity } = body;

    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: {
        title,
        description,
        code,
        language,
        topics,
        complexity,
      },
    });

    return NextResponse.json(updatedSnippet);
  } catch (error) {
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

    return NextResponse.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    );
  }
}
