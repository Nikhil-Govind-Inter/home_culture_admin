import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchStateList,
  deleteState,
  toggleStateStatus,
  updateStateSortOrder,
  State,
} from "@/services/masters/stateApi";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function StateList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items: rows,
    setItems: setRows,
    page,
    setPage,
    limit,
    setLimit,
    itemsPage,
    itemsLimit,
    searchInput,
    setSearchInput,
    totalCount,
    totalPages,
    loading,
    searching,
    refetch,
  } = usePaginatedList<State>(fetchStateList);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleSortOrderChange = useSortOrder(
    rows,
    setRows,
    updateStateSortOrder,
    (item) => item.slug,
  );
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } =
    useStatusToggle({
      setItems: setRows,
      refetch,
      toggleStatus: toggleStateStatus,
      label: "State",
      getKey: (item) => item.slug,
    });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteState(deleteItemId);
      // Resync from the server; step back a page if this emptied the current one.
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "State deleted successfully",
      });
    } catch (error) {
      // The server refuses to delete a record that still has dependent records; show its message.
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete State",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<State>[] = [
    {
      id: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium max-w-[300px] truncate">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => {
        const item = row.original;
        const sortOrder = row.getValue("sort_order") as number;
        return (
          <SortOrderCell
            sortOrder={sortOrder}
            onIncrement={() => handleSortOrderChange(item, 1)}
            onDecrement={() => handleSortOrderChange(item, -1)}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <StatusToggleCell
            status={status}
            onCheckedChange={(checked) =>
              setStatusToggleItem({
                item: row.original,
                newStatus: checked,
              })
            }
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <RowActionsMenu
            onEdit={() => navigate(`/states/${item.slug}/edit`)}
            onDelete={() => setDeleteItemId(item.slug)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        title="States"
        searchPlaceholder="Search by Name or Slug..."
        onAdd={() => navigate("/states/new")}
        addButtonText="Add State"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        pagination={{
          currentPage: page,
          totalPages,
          totalCount,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: (size) => {
            setLimit(size);
            setPage(1);
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialogue
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        confirmDelete={confirmDelete}
      />

      {/* Status Toggle Confirmation Dialog */}
      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="State"
      />
    </>
  );
}
