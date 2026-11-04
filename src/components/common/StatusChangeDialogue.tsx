import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"

const StatusChangeDialogue = ({
    statusToggleItem,
    setStatusToggleItem,
    confirmStatusToggle,
    itemLabel = "item",

}) => {
  return (
    <div>
       <AlertDialog
              open={!!statusToggleItem}
              onOpenChange={() => setStatusToggleItem(null)}
            >
              <AlertDialogContent>
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
                  <AlertDialogAction onClick={confirmStatusToggle}>
                    {statusToggleItem?.newStatus ? "Activate" : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

    </div>
  )
}

export default StatusChangeDialogue
