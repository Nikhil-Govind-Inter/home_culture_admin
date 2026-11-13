import { useState, Dispatch, SetStateAction } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/auth/authApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Options<T extends { id?: number; show_in_home?: boolean }> {
  setItems: Dispatch<SetStateAction<T[]>>;
  toggle: (item: T, value: boolean) => Promise<unknown>;
  /** Singular noun for messages, e.g. "product". */
  label: string;
}

/** Confirm-then-update flow for the "Show in Home" switch on list pages. */
export function useShowInHomeToggle<T extends { id?: number; show_in_home?: boolean }>({
  setItems,
  toggle,
  label,
}: Options<T>) {
  const { toast } = useToast();
  const [pending, setPending] = useState<{ item: T; checked: boolean } | null>(null);

  const confirm = async () => {
    if (!pending) return;
    const { item, checked } = pending;
    const apply = (value: boolean) =>
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, show_in_home: value } : i)));

    setPending(null);
    // Optimistic update; roll back if the request fails.
    apply(checked);
    try {
      await toggle(item, checked);
      toast({ title: "Success", description: `Show in home updated successfully` });
    } catch (error) {
      apply(!checked);
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to update show in home",
        variant: "destructive",
      });
    }
  };

  const dialog = (
    <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm show in home change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {pending?.checked ? "show" : "hide"} this {label}{" "}
            {pending?.checked ? "on" : "from"} the home page?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestToggle: (item: T, checked: boolean) => setPending({ item, checked }), dialog };
}
