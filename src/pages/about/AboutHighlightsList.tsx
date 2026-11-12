import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchAboutHighlightList,
  deleteAboutHighlight,
  toggleAboutHighlightStatus,
  updateAboutHighlightSortOrder,
  AboutHighlight,
} from "@/services/about/aboutHighlightApi";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function AboutHighlightsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items: highlightItems,
    setItems: setAboutHighlightItems,
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
  } = usePaginatedList<AboutHighlight>(fetchAboutHighlightList);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  // Mirrors highlightItems so the debounced sort-order commit (below) can
  // read the latest optimistic value at fire time, instead of a stale one
  // captured when the timer was first scheduled.

  // Per-item debounce state for sort-order changes: the pending commit timer,
  // and the last server-confirmed value to revert to if the eventual commit
  // fails.
  const handleSortOrderChange = useSortOrder(highlightItems, setAboutHighlightItems, updateAboutHighlightSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setAboutHighlightItems,
    refetch,
    toggleStatus: toggleAboutHighlightStatus,
    label: "Highlight",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteAboutHighlight(deleteItemId);
      // Deleting shrinks totalCount and can empty the current page, so
      // resync from the server rather than just splicing the local array.
      // If this was the last row on a page beyond the first, step back a
      // page first so the refetch doesn't land on a now-empty page.
      if (highlightItems.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "Highlight deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete highlight",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<AboutHighlight>[] = [
    {
      id: "id",
      header: "ID",
      // Serial ID that increments from 1 and stays continuous across
      // pagination. Uses itemsPage/itemsLimit (the page/limit the currently
      // loaded data actually corresponds to) rather than page/limit
      // directly, so it doesn't flash the next page's numbers over the
      // still-loading current page's rows.
      cell: ({ row, table }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}
        </div>
      ),
    },
    {
      accessorKey: "icon_media_path",
      header: "Icon",
      cell: ({ row }) => (
        <MediaThumbnail
          path={row.getValue("icon_media_path")}
          alt={row.original.title}
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
          {row.getValue("description")}
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
            onEdit={() => navigate(`/about-highlights/${item.id}/edit`)}
            onDelete={() => setDeleteItemId(item.id!)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={highlightItems}
        title="About Highlights"
        searchPlaceholder="Search by Title or Description..."
        onAdd={() => navigate("/about-highlights/new")}
        addButtonText="Add Highlight"
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
        itemLabel="highlight"
      />
    </>
  );
}