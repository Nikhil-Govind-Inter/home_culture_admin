import { useRef } from "react";
import { AlertDialog,AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"

const StatusChangeDialogue = ({
    statusToggleItem,
    setStatusToggleItem,
    confirmStatusToggle,
    itemLabel = "item",

}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
       <AlertDialog
              open={!!statusToggleItem}
              onOpenChange={() => setStatusToggleItem(null)}
            >
              <AlertDialogContent
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  confirmRef.current?.focus();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to{" "}
                    {statusToggleItem?.newStatus ? "activate" : "deactivate"} this{" "}
                    {itemLabel}? This will change its visibility and availability in the
                    system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction ref={confirmRef} onClick={confirmStatusToggle}>
                    {statusToggleItem?.newStatus ? "Activate" : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

    </div>
  )
}

export default StatusChangeDialogue
