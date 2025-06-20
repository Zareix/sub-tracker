import {
	CalendarSyncIcon,
	ChartColumnIcon,
	ChevronsUpDownIcon,
	HomeIcon,
	LogOutIcon,
	PlusIcon,
	ShieldIcon,
	UserCircle2Icon,
	WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export const NAV_ITEMS = [
	{
		title: "Home",
		url: "/",
		icon: HomeIcon,
		keepParams: true,
	},
	{
		title: "Stats",
		url: "/stats",
		icon: ChartColumnIcon,
		keepParams: true,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: WrenchIcon,
		keepParams: false,
	},
	{
		title: "Admin",
		url: "/admin",
		icon: ShieldIcon,
		role: "admin",
		keepParams: false,
	},
	{
		title: "Profile",
		url: "/profile",
		icon: UserCircle2Icon,
		role: "user",
		keepParams: false,
	},
] as const;

export function AppSidebar() {
	const router = useRouter();
	const session = authClient.useSession();

	return (
		<Sidebar side="left" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link
								href={{
									pathname: "/",
									query: router.query,
								}}
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-xs bg-primary text-sidebar-primary-foreground">
									<CalendarSyncIcon className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">Subtracker</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAV_ITEMS.filter((item) =>
								"role" in item ? item.role === session.data?.user.role : true,
							).map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={router.pathname === item.url}
									>
										<Link
											href={{
												pathname: item.url,
												query: item.keepParams ? router.query : null,
											}}
										>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				{session.data && (
					<SidebarMenu>
						<SidebarMenuItem>
							<CreateSubscriptionDialog
								trigger={
									<SidebarMenuButton className="flex">
										<PlusIcon />
										<span>Add subscription</span>
									</SidebarMenuButton>
								}
							/>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage
												src={session.data.user.image ?? undefined}
												alt={session.data.user.name ?? ""}
											/>
											<AvatarFallback className="rounded-lg">
												{session.data.user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{session.data.user.name}
											</span>
											<span className="truncate text-xs">
												{session.data.user.email}
											</span>
										</div>
										<ChevronsUpDownIcon className="ml-auto size-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
									side="right"
									align="end"
									sideOffset={4}
								>
									<DropdownMenuLabel className="p-0 font-normal">
										<Link
											href="/profile"
											className="flex items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm hover:bg-muted"
										>
											<Avatar className="size-8 rounded-lg">
												<AvatarImage
													src={session.data.user.image ?? undefined}
													alt={session.data.user.name}
												/>
												<AvatarFallback className="rounded-lg">
													{session.data.user.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{session.data.user.name}
												</span>
												<span className="truncate text-xs">
													{session.data.user.email}
												</span>
											</div>
										</Link>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => authClient.signOut()}>
										<LogOutIcon />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				)}
			</SidebarFooter>
			<SidebarFooter />
		</Sidebar>
	);
}

const NavbarItem = ({
	pathname,
	query,
	...item
}: (typeof NAV_ITEMS)[number] & {
	pathname: string;
	query: ReturnType<typeof useRouter>["query"];
}) => (
	<Button
		key={item.title}
		asChild
		variant="link"
		className={cn(pathname === item.url ? "text-primary" : "text-foreground")}
	>
		<Link
			href={{
				pathname: item.url,
				query: item.keepParams ? query : null,
			}}
			className="flex h-full items-center justify-center gap-2 font-bold text-xl"
		>
			<item.icon size={26} />
		</Link>
	</Button>
);

export const Navbar = () => {
	const router = useRouter();

	const navBarItems = NAV_ITEMS.filter((item) =>
		"role" in item ? item.role === "user" : true,
	);
	const middleIndex = Math.floor(navBarItems.length / 2);
	return (
		<nav className="fixed right-0 bottom-0 left-0 z-10 flex h-14 items-center justify-between border-border border-t bg-background/80 px-4 backdrop-blur md:hidden md:px-8">
			<div className="grid h-full w-full grid-cols-5 content-center items-center justify-around gap-2">
				{navBarItems
					.filter((_, i) => i < middleIndex)
					.map((item) => (
						<NavbarItem
							key={item.title}
							{...item}
							pathname={router.pathname}
							query={router.query}
						/>
					))}
				<CreateSubscriptionDialog
					trigger={
						<Button
							variant="link"
							className="flex h-full items-center gap-2 text-foreground"
						>
							<PlusIcon />
						</Button>
					}
				/>
				{navBarItems
					.filter((_, i) => i >= middleIndex)
					.map((item) => (
						<NavbarItem
							key={item.title}
							{...item}
							pathname={router.pathname}
							query={router.query}
						/>
					))}
			</div>
		</nav>
	);
};
