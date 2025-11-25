"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CreateUserDialog } from "~/components/admin/users/create";
import { DeleteUserDialog } from "~/components/admin/users/delete";
import { EditUserDialog } from "~/components/admin/users/edit";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { UserRole } from "~/lib/constant";
import { api, type RouterInputs } from "~/trpc/react";

export default function AdminPage() {
	const t = useTranslations("AdminPage");
	const tCommon = useTranslations("Common");
	const apiUtils = api.useUtils();
	const usersQuery = api.user.getAll.useQuery();
	const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
	const categoriesQuery = api.category.getAll.useQuery();
	const cleanUpFilesMutation = api.admin.cleanUpFiles.useMutation({
		onSuccess: () => {
			toast.success(t("cleanedUpSuccess"));
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const updateExchangeRatesMutation = api.admin.updateExchangeRates.useMutation(
		{
			onSuccess: () => {
				toast.success(t("exchangeRatesSuccess"));
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
			toast.success(t("exportSuccess"));
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const importDataMutation = api.admin.importData.useMutation({
		onSuccess: () => {
			toast.success(t("importSuccess"));
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
				{tCommon("error")}:{" "}
				{usersQuery.error?.message ??
					paymentMethodsQuery.error?.message ??
					categoriesQuery.error?.message}
			</div>
		);
	}

	return (
		<div className="grid max-w-[100vw] items-start gap-4">
			<section>
				<header className="flex flex-wrap items-center justify-between">
					<h1 className="font-bold text-3xl">{t("title")}</h1>
					<CreateUserDialog />
				</header>
				<div className="mt-2 max-w-[calc(100vw-2rem)]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[70px]">{tCommon("image")}</TableHead>
								<TableHead className="w-[100px]">{tCommon("name")}</TableHead>
								<TableHead>{tCommon("email")}</TableHead>
								<TableHead>{tCommon("role")}</TableHead>
								<TableHead className="text-end">{tCommon("actions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{usersQuery.isLoading && (
								<TableRow>
									<TableCell>
										<Skeleton className="h-10 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell />
								</TableRow>
							)}
							{usersQuery.data?.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage
												src={user.image ?? undefined}
												alt={user.name}
											/>
											<AvatarFallback className="rounded-lg">
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell className="capitalize">{user.role}</TableCell>
									<TableCell className="flex items-center justify-end gap-2">
										<DeleteUserDialog user={user} />
										<EditUserDialog
											user={{
												...user,
												role: user.role as UserRole,
											}}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</section>

			<section>
				<header className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">{t("misc")}</h1>
				</header>
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<Button
						onClick={() => {
							cleanUpFilesMutation.mutate();
						}}
						disabled={cleanUpFilesMutation.isPending}
					>
						{t("cleanUpFiles")}
					</Button>
					<Button
						onClick={() => {
							updateExchangeRatesMutation.mutate();
						}}
						disabled={updateExchangeRatesMutation.isPending}
					>
						{t("updateExchangeRates")}
					</Button>
					<Button
						onClick={() => {
							exportDataMutation.mutate();
						}}
						disabled={exportDataMutation.isPending}
					>
						{t("exportData")}
					</Button>
					<div className="relative">
						<Button>{t("importData")}</Button>
						<Input
							className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer opacity-0 disabled:opacity-0"
							disabled={importDataMutation.isPending}
							placeholder={t("importData")}
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
	);
}
