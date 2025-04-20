import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${process.env.OWNER}/${process.env.REPO}`,
      {
        headers: {
          "Authorization": process.env.GITHUB_TOKEN ? 
            `Bearer ${process.env.GITHUB_TOKEN}` : '',
          "User-Agent": "watermark-remover-app"
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ stars: data.stargazers_count }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch GitHub stars:", error);
    return NextResponse.json({ stars: 0 }, { status: 200 });
  }
} 