import { EditUserProfile } from "~/components/users/edit";
import { useSession } from "~/lib/auth-client";
import type { UserRole } from "~/lib/constant";

export default function ProfilePage() {
  const session = useSession();

  const user = session.data?.user;
  return (
    <div className="grid max-w-[100vw] items-start gap-4">
      <h1>Profile</h1>
      {user && (
        <EditUserProfile
          user={{
            ...user,
            image: user.image ?? null,
            role: user.role as UserRole,
          }}
        />
      )}
    </div>
  );
}
