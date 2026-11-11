import { useState, Dispatch, SetStateAction } from "react";
import { useToast } from "@/hooks/use-toast";

interface Toggleable {
  id?: number;
  slug?: string;
  is_active?: boolean;
}

interface Options<T extends Toggleable> {
  setItems: Dispatch<SetStateAction<T[]>>;
  refetch: () => unknown;
  toggleStatus: (item: T, isActive: boolean) => Promise<unknown>;
  /** Shown in the success toast, e.g. "History entry". */
  label: string;
  /** Identifies a row; defaults to `id`. Pass e.g. `(i) => i.slug` for resources addressed by slug. */
  getKey?: (item: T) => string | number;
}

/** Confirm-then-update status flow shared by list pages. */
export function useStatusToggle<T extends Toggleable>({
  setItems,
  refetch,
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

    try {
      await toggleStatus(item, newStatus);
      setItems((prev) =>
        prev.map((i) =>
          getKey(i) === getKey(item) ? { ...i, is_active: newStatus } : i,
        ),
      );
      refetch();
      toast({
        title: "Success",
        description: `${label} status updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  return { statusToggleItem, setStatusToggleItem, confirmStatusToggle };
}
