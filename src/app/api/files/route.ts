import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isAuthenticated } from "~/server/auth";
import { getFileFromStorage, saveFile } from "~/server/services/files";

export async function POST(req: NextRequest) {
	if (!(await isAuthenticated())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const formData = await req.formData();
		if (!formData.has("file") && !formData.has("imageUrl")) {
			return NextResponse.json(
				{ error: "No file or image URL provided" },
				{ status: 400 },
			);
		}
		if (formData.has("imageUrl")) {
			const imageUrl = formData.get("imageUrl") as string;
			if (!imageUrl) {
				return NextResponse.json(
					{ error: "Image URL is required" },
					{ status: 400 },
				);
			}
			const response = await fetch(imageUrl);
			if (!response.ok) {
				return NextResponse.json(
					{ error: "Error fetching image from URL" },
					{ status: 400 },
				);
			}

			const blob = await response.blob();
			const contentType = response.headers.get("Content-Type");
			console.log("imageUrl", imageUrl);
			console.log("contentType", contentType);

			if (!contentType || !contentType.startsWith("image/")) {
				return NextResponse.json(
					{ error: "Invalid image URL" },
					{ status: 400 },
				);
			}
			const compressedFile = new File(
				[blob],
				`compressed_image.${contentType.split("/")[1]}`,
				{
					type: contentType,
				},
			);

			formData.set("file", compressedFile);
		}
		if (!formData.has("file")) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}
		const file = formData.get("file");
		if (!(file instanceof File)) {
			return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
		}
		let fileToSave = formData.get("file");

		if (file.type.startsWith("image/")) {
			const fileBuffer = Buffer.from(await file.arrayBuffer());
			const compressedBuffer = await sharp(fileBuffer)
				.resize({ width: 128, height: 128, fit: "inside" })
				.withMetadata()
				.png({ quality: 80 })
				.toArray();

			const compressedFile = new File(
				compressedBuffer,
				file.name.replace(/\.[^/.]+$/, ".png"),
				{ type: "image/png" },
			);

			fileToSave = compressedFile;
		}

		const url = await saveFile(fileToSave);

		if (!url) {
			return NextResponse.json(
				{ error: "Error uploading file" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ url }, { status: 200 });
	} catch (e) {
		console.error("Error uploading file:", e);
		return NextResponse.json(
			{ error: "Error uploading file" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	// if (!(await isAuthenticated(req))) {
	// 	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	// }
	try {
		const filename = req.nextUrl.searchParams.get("filename");
		const file = await getFileFromStorage(filename);

		if (!file) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}
		if (typeof file === "string") {
			return NextResponse.redirect(file);
		}
		return new NextResponse(await file.arrayBuffer(), {
			headers: {
				"Content-Type": file.type,
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}
}
