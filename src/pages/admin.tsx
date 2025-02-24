import Head from "next/head";
import Image from "next/image";
import { CreatePaymentMethodDialog } from "~/components/admin/payment-methods/create";
import { CreateUserDialog } from "~/components/admin/users/create";
import { api } from "~/utils/api";
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

export default function Home() {
  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
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

  if (usersQuery.isError || paymentMethodsQuery.isError) {
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
      <div className="grid items-start gap-1">
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
                  <TableHead>Email</TableHead>
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
                    <TableCell>{user.email}</TableCell>
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
          </div>
        </section>
      </div>
    </>
  );
}
