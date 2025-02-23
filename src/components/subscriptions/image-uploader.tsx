import { useMutation } from "@tanstack/react-query";
import { Input } from "~/components/ui/input";
import imageCompression, { type Options } from "browser-image-compression";
import { ImageIcon, LoaderCircleIcon, UploadIcon } from "lucide-react";
import Image from "next/image";

const options: Options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 128,
  useWebWorker: true,
  fileType: "image/png",
};

type Props = {
  setFileUrl: (url: string) => void;
  fileUrl?: string;
};

export const ImageFileUploader = ({ setFileUrl, fileUrl }: Props) => {
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const compressedFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append("file", compressedFile);
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url: string };
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      setFileUrl(data.url);
    },
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);

    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  return (
    <div className="group relative col-span-2 grid cursor-pointer place-content-center">
      {uploadFileMutation.isPending ? (
        <LoaderCircleIcon className="h-8 w-8 animate-spin" />
      ) : fileUrl ? (
        <Image
          src={fileUrl}
          alt="Uploaded image"
          width={64}
          height={70}
          className="max-h-[70px] object-contain"
        />
      ) : (
        <ImageIcon className="h-8 w-8 group-hover:text-primary" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 opacity-0"
      />
    </div>
  );
};
