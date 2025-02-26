import Head from "next/head";
import Image from "next/image";
import { CreateUserDialog } from "~/components/admin/users/create";
import { api, type RouterInputs } from "~/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { DeleteUserDialog } from "~/components/admin/users/delete";
import { EditUserDialog } from "~/components/admin/users/edit";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function AdminPage() {
  const apiUtils = api.useUtils();
  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
  const categoriesQuery = api.category.getAll.useQuery();
  const cleanUpFilesMutation = api.admin.cleanUpFiles.useMutation({
    onSuccess: () => {
      toast.success("Cleaned up unused files");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateExchangeRatesMutation = api.admin.updateExchangeRates.useMutation(
    {
      onSuccess: () => {
        toast.success("Updated exchange rates");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );
  const exportDataMutation = api.admin.exportData.useMutation({
    onSuccess: (data) => {
      const res = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(res);
      link.download = "data.json";
      link.click();
      toast.success("Successfully exported data");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const importDataMutation = api.admin.importData.useMutation({
    onSuccess: () => {
      toast.success("Successfully imported data");
      apiUtils.user.getAll.invalidate().catch(console.error);
      apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
      apiUtils.category.getAll.invalidate().catch(console.error);
      apiUtils.subscription.getAll.invalidate().catch(console.error);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (
    usersQuery.isError ||
    paymentMethodsQuery.isError ||
    categoriesQuery.isError
  ) {
    return (
      <div>
        Error:{" "}
        {usersQuery.error?.message ??
          paymentMethodsQuery.error?.message ??
          categoriesQuery.error?.message}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sub Tracker - Admin</title>
      </Head>
      <div className="grid max-w-[100vw] items-start gap-4">
        <section>
          <header className="flex flex-wrap items-center justify-between">
            <h1 className="text-3xl font-bold">Users</h1>
            <CreateUserDialog />
          </header>
          <div className="mt-2 max-w-[calc(100vw-2rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Image</TableHead>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading && (
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-10 w-16" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2"></TableCell>
                  </TableRow>
                )}
                {usersQuery.data?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.image && (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={64}
                          height={40}
                          className="max-h-[40px] max-w-[64px] object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      <DeleteUserDialog user={user} />
                      <EditUserDialog user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Misc</h1>
          </header>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                cleanUpFilesMutation.mutate();
              }}
              disabled={cleanUpFilesMutation.isPending}
            >
              Clean up unused files
            </Button>
            <Button
              onClick={() => {
                updateExchangeRatesMutation.mutate();
              }}
              disabled={updateExchangeRatesMutation.isPending}
            >
              Update exchange rates
            </Button>
            <Button
              onClick={() => {
                exportDataMutation.mutate();
              }}
              disabled={exportDataMutation.isPending}
            >
              Export data
            </Button>
            <div className="flex max-w-64 flex-col gap-2">
              <Label>Import data</Label>
              <Input
                disabled={importDataMutation.isPending}
                placeholder="Import data"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  const text = await file.text();
                  importDataMutation.mutate(
                    JSON.parse(text) as RouterInputs["admin"]["importData"],
                  );
                }}
                type="file"
                accept=".json"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
