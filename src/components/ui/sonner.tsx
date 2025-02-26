"use client";

import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { useIsMobile } from "~/lib/hooks/use-mobile";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const isMobile = useIsMobile();
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:text-destructive",
        },
      }}
      icons={{
        success: <CheckCircle2Icon size={18} className="text-primary" />,
        error: <XCircleIcon size={18} className="text-destructive" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
