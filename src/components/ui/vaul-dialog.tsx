import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { useIsMobile } from "~/lib/hooks/use-mobile";

export const WrapperDialogVaul = ({
  trigger,
  children,
  isOpen,
  setIsOpen,
}: {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
          <DrawerContent>{children}</DrawerContent>
        </Drawer>
      </>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
