import { type NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "~/server/auth";
import { getFileFromStorage, saveFile } from "~/server/services/files";

export async function POST(req: NextRequest) {
	if (!(await isAuthenticated(req))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const formData = await req.formData();
		const url = await saveFile(formData.get("file"));

		if (!url) {
			return NextResponse.json(
				{ error: "Error uploading file" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ url }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Error uploading file" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	// if (!(await isAuthenticated(req))) {
	//   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

export const config = {
	api: {
		bodyParser: false,
	},
};
