import {
  BadgeCheckIcon,
  BellIcon,
  CalendarSyncIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  GalleryVerticalEndIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export const NAV_ITEMS = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Stats",
    url: "/stats",
    icon: ChartColumnIcon,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: WrenchIcon,
  },
] as const;

export function AppSidebar() {
  const router = useRouter();
  const session = useSession();

  return (
    <Sidebar side="left">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg
                    bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <CalendarSyncIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Subtracker</span>
                  {/* <span className="">v1.0.0</span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.pathname === item.url}
                  >
                    <Link href={item.url}>
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
        {session.status === "authenticated" && (
          <SidebarMenu>
            <SidebarMenuItem className="rounded-md border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent
                      data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
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
                        {session.data.user.username}
                      </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
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
                          {session.data.user.username}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
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
  ...item
}: (typeof NAV_ITEMS)[number] & {
  pathname: string;
}) => (
  <Button
    key={item.title}
    asChild
    variant="link"
    data-active={pathname === item.url}
    className="text-foreground data-[active=true]:text-primary"
  >
    <Link
      href={item.url}
      className="flex h-full items-center justify-center gap-2 text-xl font-bold"
    >
      <item.icon size={26} />
    </Link>
  </Button>
);

export const Navbar = () => {
  const router = useRouter();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-between
        border-t border-border bg-background/80 px-4 backdrop-blur md:hidden md:px-8"
    >
      <div className="grid h-full w-full grid-cols-4 items-center justify-around gap-2">
        {NAV_ITEMS.filter((_, i) => i < 2).map((item) => (
          <NavbarItem key={item.title} {...item} pathname={router.pathname} />
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
        {NAV_ITEMS.filter((_, i) => i >= 2).map((item) => (
          <NavbarItem key={item.title} {...item} pathname={router.pathname} />
        ))}
      </div>
    </nav>
  );
};
