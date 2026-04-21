import type { BunFile } from "bun";

export const saveFile = async (file: File | BunFile) => {
	const fileName = `s3_${Bun.randomUUIDv7()}.png`;

	try {
		await Bun.s3.file(fileName).write(file);

		return `/api/files?filename=${fileName}`;
	} catch (e) {
		console.log(e);
	}
};

export const readFile = async (filename: string) => {
	// TODO Make it work with presigned urls -- Current problem is that next/image does not follow redirect
	return Bun.s3.file(filename);
};

export const cleanUpFiles = async (filesInUse: (string | null)[]) => {
	const s3Files = await Bun.s3.list();
	if (!s3Files.contents) {
		return;
	}
	for (const file of s3Files.contents) {
		if (filesInUse.includes(file.key)) {
			continue;
		}
		console.log("Deleting file", file.key, "from s3");
		await Bun.s3.delete(file.key);
	}
};
