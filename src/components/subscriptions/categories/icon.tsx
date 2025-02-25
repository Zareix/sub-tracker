import { CircleEllipsis } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof DynamicIcon>, "name"> & {
  icon: string | null;
};

export const CategoryIcon = ({ icon, ...props }: Props) => {
  if (!icon) return <CircleEllipsis {...props} />;
  return (
    <DynamicIcon
      {...props}
      name={icon as ComponentProps<typeof DynamicIcon>["name"]}
    />
  );
};
