import fs from "node:fs/promises";
import path from "node:path";
import { env } from "~/env";

const saveToS3 = async (file: File) => {
  const fileName = Bun.randomUUIDv7() + ".png";

  try {
    const s3UploadedFile = Bun.s3.file(fileName);
    await s3UploadedFile.write(file);

    const url = s3UploadedFile.presign({
      acl: "public-read",
      method: "GET",
    });

    return url;
  } catch (e) {
    console.log(e);
  }
};

export const saveFile = async (file: unknown) => {
  if (!file || !(file instanceof File)) {
    return null;
  }

  if (process.env.S3_BUCKET) {
    return await saveToS3(file);
  }

  await fs.mkdir(env.UPLOADS_FOLDER, { recursive: true });

  const newFileName = Bun.randomUUIDv7() + ".png";
  await Bun.write(`${env.UPLOADS_FOLDER}/${newFileName}`, file);

  return `/api/files?filename=${newFileName}`;
};

export const readFile = async (filename: string | null) => {
  if (!filename) {
    return null;
  }

  const fileName = filename.split("/").pop();
  if (!fileName) {
    return null;
  }

  const file = Bun.file(path.join(env.UPLOADS_FOLDER, fileName));

  return file;
};
