import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return NextResponse.json(
        {
          error:
            "GitHub configuration missing. Set GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN in environment variables.",
        },
        { status: 500 },
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();
    const filename = `${timestamp}-${sanitizedName}`;
    const filePath = `${folder}/${filename}`;

    // Upload to GitHub
    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Upload spa image: ${filePath}`,
          content: base64Content,
          branch,
        }),
      },
    );

    if (!githubRes.ok) {
      const errBody = await githubRes.json();
      return NextResponse.json(
        { error: errBody.message || "Failed to upload to GitHub" },
        { status: githubRes.status },
      );
    }

    // Build jsDelivr CDN URL (cached, fast, free)
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;

    return NextResponse.json({ url: cdnUrl, path: filePath });
  } catch (error) {
    console.error("GitHub upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
