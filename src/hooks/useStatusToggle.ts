import { useState, Dispatch, SetStateAction } from "react";
import { useToast } from "@/hooks/use-toast";

interface Toggleable {
  id?: number;
  slug?: string;
  status?: boolean;
}

interface Options<T extends Toggleable> {
  setItems: Dispatch<SetStateAction<T[]>>;
  /** Unused now (rows update locally); kept so existing call sites compile. */
  refetch?: () => unknown;
  toggleStatus: (item: T, isActive: boolean) => Promise<unknown>;
  /** Shown in the success toast, e.g. "History entry". */
  label: string;
  /** Identifies a row; defaults to `id`. Pass e.g. `(i) => i.slug` for resources addressed by slug. */
  getKey?: (item: T) => string | number;
}

/** Confirm-then-update status flow shared by list pages. */
export function useStatusToggle<T extends Toggleable>({
  setItems,
  toggleStatus,
  label,
  getKey = (item) => item.id!,
}: Options<T>) {
  const { toast } = useToast();
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: T;
    newStatus: boolean;
  } | null>(null);

  const confirmStatusToggle = async () => {
    if (!statusToggleItem) return;
    const { item, newStatus } = statusToggleItem;

    const apply = (value: boolean) =>
      setItems((prev) =>
        prev.map((i) => (getKey(i) === getKey(item) ? { ...i, status: value } : i)),
      );

    // Update the row first so the switch flips at once; roll back if the request fails.
    setStatusToggleItem(null);
    apply(newStatus);
    try {
      await toggleStatus(item, newStatus);
      toast({
        title: "Success",
        description: `${label} status updated successfully`,
      });
    } catch (error) {
      apply(!newStatus);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return { statusToggleItem, setStatusToggleItem, confirmStatusToggle };
}
