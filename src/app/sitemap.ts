import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const snippets = await prisma.snippet.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const users = await prisma.user.findMany({
    where: {
      snippets: {
        some: {
          isPublic: true,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const snippetUrls = snippets.map((snippet) => ({
    url: `${baseUrl}/snippets/${snippet.id}`,
    lastModified: snippet.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const profileUrls = users.map((user) => ({
    url: `${baseUrl}/profile/${user.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...snippetUrls,
    ...profileUrls,
  ];
}
