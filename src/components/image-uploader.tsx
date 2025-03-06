import { useMutation } from "@tanstack/react-query";
import imageCompression, { type Options } from "browser-image-compression";
import { ImageIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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
      const data = (await response.json()) as
        | { url: string }
        | { error: string };
      if (!response.ok) {
        throw new Error(
          "Failed to upload file" + ("error" in data ? data.error : ""),
        );
      }
      return data;
    },
    onSuccess: (data) => {
      if ("url" in data) {
        setFileUrl(data.url);
      } else {
        toast.error(data.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  return (
    <div className="group relative col-span-2 grid cursor-pointer place-content-center">
      {uploadFileMutation.isPending ? (
        <LoaderCircleIcon className="size-8 animate-spin" />
      ) : fileUrl ? (
        <Image
          src={fileUrl}
          alt="Uploaded image"
          width={64}
          height={70}
          className="max-h-[70px] object-contain"
        />
      ) : (
        <ImageIcon className="group-hover:text-primary size-8" />
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
