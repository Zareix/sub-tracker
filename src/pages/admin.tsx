import Head from "next/head";
import Image from "next/image";
import { CreatePaymentMethodDialog } from "~/components/admin/payment-methods/create";
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
import { DeletePaymentMethodDialog } from "~/components/admin/payment-methods/delete";
import { EditPaymentMethodDialog } from "~/components/admin/payment-methods/edit";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { CreateCategoryDialog } from "~/components/admin/categories/create";
import { DeleteCategoryDialog } from "~/components/admin/categories/delete";
import { EditCategoryDialog } from "~/components/admin/categories/edit";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { Input } from "~/components/ui/input";

export default function Home() {
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
        Error: {usersQuery.error?.message ?? paymentMethodsQuery.error?.message}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sub Tracker - Admin</title>
      </Head>
      <div className="grid items-start gap-4">
        <section>
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Users</h1>
            <CreateUserDialog />
          </header>
          <div className="mt-2 max-w-[calc(100vw-2rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading && (
                  <TableRow>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2"></TableCell>
                  </TableRow>
                )}
                {usersQuery.data?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
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
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <CreatePaymentMethodDialog />
          </header>
          <div className="mt-2 max-w-[calc(100vw-2rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethodsQuery.isLoading && (
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-10 w-16" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2"></TableCell>
                  </TableRow>
                )}
                {paymentMethodsQuery.data?.map((paymentMethod) => (
                  <TableRow key={paymentMethod.id}>
                    <TableCell>
                      {paymentMethod.image && (
                        <Image
                          src={paymentMethod.image}
                          alt={paymentMethod.name}
                          width={64}
                          height={40}
                          className="max-h-[40px] max-w-[64px] object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {paymentMethod.name}
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      <DeletePaymentMethodDialog
                        paymentMethod={paymentMethod}
                      />
                      <EditPaymentMethodDialog paymentMethod={paymentMethod} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Categories</h1>
            <CreateCategoryDialog />
          </header>
          <div className="mt-2 max-w-[calc(100vw-2rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesQuery.isLoading && (
                  <TableRow>
                    <TableCell>
                      <Skeleton className="h-6 w-6" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2"></TableCell>
                  </TableRow>
                )}
                {categoriesQuery.data?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <CategoryIcon icon={category.icon} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2">
                      <DeleteCategoryDialog category={category} />
                      <EditCategoryDialog category={category} />
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
          <div className="mt-2 flex items-center gap-2">
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
            <Input
              disabled={importDataMutation.isPending}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  return;
                }
                const text = await file.text();
                importDataMutation
                  .mutateAsync(
                    JSON.parse(text) as RouterInputs["admin"]["importData"],
                  )
                  .then(() => {
                    e.target.files = null;
                  })
                  .catch(console.error);
              }}
              type="file"
              accept=".json"
            />
          </div>
        </section>
      </div>
    </>
  );
}
