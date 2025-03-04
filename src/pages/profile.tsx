import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { EditUserProfile } from "~/components/users/edit";
import { passkey, useSession } from "~/lib/auth-client";
import type { UserRole } from "~/lib/constant";

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();

  const registerPasskey = () => {
    passkey
      .addPasskey()
      .then((data) => {
        console.log(data);
        router.reload();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const user = session.data?.user;
  return (
    <div className="grid max-w-[100vw] items-start gap-4">
      <h1>Profile</h1>
      <Button onClick={registerPasskey}>Register passkey</Button>
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
