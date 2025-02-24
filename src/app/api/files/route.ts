import { type NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "path";
import { env } from "~/env";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    await fs.mkdir(env.UPLOADS_FOLDER, { recursive: true });

    const newFileName = Bun.randomUUIDv7() + ".png";
    await Bun.write(`${env.UPLOADS_FOLDER}/${newFileName}`, file);

    return NextResponse.json(
      { url: `/api/files?filename=${newFileName}` },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get("filename");
    if (!filename) {
      return NextResponse.json(
        { error: "No filename provided" },
        { status: 400 },
      );
    }

    const fileName = filename.split("/").pop();
    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid filename provided" },
        { status: 400 },
      );
    }

    const file = Bun.file(path.join(env.UPLOADS_FOLDER, fileName));

    return new NextResponse(file, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
