import Image from "next/image";
import { CreateCategoryDialog } from "~/components/settings/categories/create";
import { DeleteCategoryDialog } from "~/components/settings/categories/delete";
import { EditCategoryDialog } from "~/components/settings/categories/edit";
import { CreatePaymentMethodDialog } from "~/components/settings/payment-methods/create";
import { DeletePaymentMethodDialog } from "~/components/settings/payment-methods/delete";
import { EditPaymentMethodDialog } from "~/components/settings/payment-methods/edit";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";

export default function SettingsPage() {
	const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
	const categoriesQuery = api.category.getAll.useQuery();

	if (paymentMethodsQuery.isError || categoriesQuery.isError) {
		return (
			<div>
				Error:{" "}
				{paymentMethodsQuery.error?.message ?? categoriesQuery.error?.message}
			</div>
		);
	}

	return (
		<div className="grid max-w-[100vw] items-start gap-4">
			<section>
				<header className="flex flex-wrap items-center justify-between">
					<h1 className="font-bold text-3xl">Payment Methods</h1>
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
									<TableCell>
										<Skeleton className="h-4 w-28" />
									</TableCell>
									<TableCell />
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
										<DeletePaymentMethodDialog paymentMethod={paymentMethod} />
										<EditPaymentMethodDialog paymentMethod={paymentMethod} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</section>
			<section>
				<header className="flex flex-wrap items-center justify-between">
					<h1 className="font-bold text-3xl">Categories</h1>
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
										<Skeleton className="size-6" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell />
								</TableRow>
							)}
							{categoriesQuery.data?.map((category) => (
								<TableRow key={category.id}>
									<TableCell>
										<CategoryIcon icon={category.icon} />
									</TableCell>
									<TableCell className="font-medium">{category.name}</TableCell>
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
		</div>
	);
}
