import fs, { readdir } from "node:fs/promises";
import path from "node:path";
import { env } from "~/env";

export const saveFile = async (file: File) => {
  await fs.mkdir(env.UPLOADS_FOLDER, { recursive: true });

  const newFileName = `local_${Bun.randomUUIDv7()}.png`;
  await Bun.write(`${env.UPLOADS_FOLDER}/${newFileName}`, file);

  return `/api/files?filename=${newFileName}`;
};

export const readFile = async (fileName: string) => {
  return Bun.file(path.join(env.UPLOADS_FOLDER, fileName));
};

export const cleanUpFiles = async (filesInUse: (string | null)[]) => {
  for (const file of await readdir(env.UPLOADS_FOLDER)) {
    if (filesInUse.includes(file)) {
      continue;
    }
    console.log("Deleting file", file);
    await Bun.file(`${env.UPLOADS_FOLDER}/${file}`).delete();
  }
};
