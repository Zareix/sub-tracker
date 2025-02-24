import { Drawer } from "vaul";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { useWindowSize } from "~/lib/hook";

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
  const { isMobile } = useWindowSize();
  if (isMobile) {
    return (
      <>
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
          {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content
              className="fixed bottom-0 left-0 right-0 h-fit outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2 rounded-t-xl bg-white p-4">
                <div
                  aria-hidden
                  className="mx-auto mb-2 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300"
                />
                {children}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </>
    );
  }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent onClick={(e) => e.stopPropagation()}>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};
