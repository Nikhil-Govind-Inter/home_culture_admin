import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchBannersList,
  deleteBanner,
  Banner,
  ApiError,
} from "@/services/siteSettings/bannerApi";

export default function BannersList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items: banners,
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
  } = usePaginatedList<Banner>(fetchBannersList);

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteBanner(deleteItemId);
      if (banners.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Banner deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete banner",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Banner>[] = [
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
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <MediaThumbnail path={row.original.image} alt={row.original.title} />
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
      accessorKey: "subtitle",
      header: "Sub Title",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate text-muted-foreground"
          title={row.original.subtitle ?? ""}
        >
          {row.original.subtitle || "-"}
        </div>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: "Sort Order",
      cell: ({ row }) => <div>{row.original.sortOrder ?? 0}</div>,
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
            onEdit={() => navigate(`/banners/${item.id}/edit`)}
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
        data={banners}
        title="Banners"
        searchPlaceholder="Search banners..."
        onAdd={() => navigate("/banners/new")}
        addButtonText="Add Banner"
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
