import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchProductTrimList,
  deleteProductTrim,
  toggleProductTrimStatus,
  updateProductTrimSortOrder,
  ProductTrim,
} from "@/services/product/productTrimApi";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function ProductTrimList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items,
    setItems,
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
  } = usePaginatedList<ProductTrim>(fetchProductTrimList);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const handleSortOrderChange = useSortOrder(items, setItems, updateProductTrimSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleProductTrimStatus,
    label: "Trim",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteProductTrim(deleteItemId);
      // Deleting can empty the current page: step back a page first if so.
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Trim deleted successfully" });
    } catch (error) {
      // The server refuses to delete a trim that is still used by a product.
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trim",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ProductTrim>[] = [
    {
      id: "id",
      header: "ID",
      // Serial ID that stays continuous across pagination.
      cell: ({ row, table }) => (
        <div className="font-mono text-sm">{(itemsPage - 1) * itemsLimit + table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}</div>
      ),
    },
    {
      accessorKey: "media_path",
      header: "Image",
      cell: ({ row }) => (
        <MediaThumbnail path={row.getValue("media_path")} alt={row.original.title} />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{String(row.getValue("title") ?? "") || "-"}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[320px] truncate">{String(row.getValue("description") ?? "") || "-"}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">{String(row.getValue("slug") ?? "") || "-"}</div>
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
              setStatusToggleItem({ item: row.original, newStatus: checked })
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
            onEdit={() => navigate(`/product-trims/${item.id}/edit`)}
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
        data={items}
        title="Product Trims"
        searchPlaceholder="Search by Title or Description..."
        onAdd={() => navigate("/product-trims/new")}
        addButtonText="Add Trim"
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

      <DeleteDialogue
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        confirmDelete={confirmDelete}
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="trim"
      />
    </>
  );
}
