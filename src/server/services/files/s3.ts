export const saveFile = async (file: File) => {
  const fileName = `s3_${Bun.randomUUIDv7()}.png`;

  try {
    const s3UploadedFile = Bun.s3.file(fileName);
    await s3UploadedFile.write(file);

    return `/api/files?filename=${fileName}`;
  } catch (e) {
    console.log(e);
  }
};

export const readFile = async (filename: string) => {
  // TODO Make it work with presigned urls -- Current problem is that next/image does not follow redirect
  return Bun.s3.file(filename);
};
