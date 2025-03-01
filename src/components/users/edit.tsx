import type { ComponentProps } from "react";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";

export const EditUserProfile = ({
  user,
}: {
  user: ComponentProps<typeof EditCreateForm>["user"];
}) => {
  return <EditCreateForm user={user} />;
};
