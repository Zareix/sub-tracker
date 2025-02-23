import { CreatePaymentMethodDialog } from "~/components/admin/payment-methods/create";
import { CreateUserDialog } from "~/components/admin/users/create";
import { api } from "~/utils/api";

export default function Home() {
  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();

  if (usersQuery.isLoading || paymentMethodsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (usersQuery.isError || paymentMethodsQuery.isError) {
    return (
      <div>
        Error: {usersQuery.error?.message ?? paymentMethodsQuery.error?.message}
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <CreateUserDialog />
      </header>
      {usersQuery.data?.map((user) => <div key={user.id}>{user.name}</div>)}

      <header className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <CreatePaymentMethodDialog />
      </header>
      {paymentMethodsQuery.data?.map((paymentMethod) => (
        <div key={paymentMethod.id}>{paymentMethod.name}</div>
      ))}
    </div>
  );
}
