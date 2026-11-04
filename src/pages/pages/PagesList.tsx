import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchPagesList,
  deletePage,
  Page,
  ApiError,
} from "@/services/pages/pageApi";

export default function PagesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items: pages,
    page,
    setPage,
    limit,
    setLimit,
    totalCount,
    totalPages,
    loading,
    itemsPage,
    itemsLimit,
    refetch,
  } = usePaginatedList<Page>(fetchPagesList);

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deletePage(deleteItemId);
      if (pages.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Page deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete page",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Page>[] = [
    {
      // id
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row }) => (
        <div className="font-medium">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-muted-foreground">{row.original.slug}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("createdAt")
            ? new Date(row.getValue("createdAt")).toLocaleDateString()
            : "-"}
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
            onEdit={() => navigate(`/pages/${item.id}/edit`)}
            onDelete={() => setDeleteItemId(item.id)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={pages}
        title="Pages"
        searchPlaceholder="Search pages..."
        onAdd={() => navigate("/pages/new")}
        addButtonText="Add Page"
        loading={loading}
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
    </>
  );
}
