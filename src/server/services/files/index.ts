import { env } from "~/env";
import * as s3 from "~/server/services/files/s3";
import * as local from "~/server/services/files/local";

export const saveFile = async (file: unknown) => {
  if (!file || !(file instanceof File)) {
    return null;
  }

  if (env.S3_ENABLED) {
    return await s3.saveFile(file);
  }

  return await local.saveFile(file);
};

export const getFileFromStorage = async (filename: string | null) => {
  if (!filename) {
    return null;
  }

  const fileName = filename.split("/").pop();
  if (!fileName) {
    return null;
  }

  if (env.S3_ENABLED && filename.startsWith("s3_")) {
    return await s3.readFile(filename);
  }

  return await local.readFile(filename);
};
