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
  fetchBlogsList,
  deleteBlog,
  Blog,
  ApiError,
} from "@/services/blogs/blogApi";

export default function BlogsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items: blogs,
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
  } = usePaginatedList<Blog>(fetchBlogsList);

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteBlog(deleteItemId);
      if (blogs.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Blog deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete blog",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Blog>[] = [
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
            onEdit={() => navigate(`/blogs/${item.id}/edit`)}
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
        data={blogs}
        title="Blogs"
        searchPlaceholder="Search blogs..."
        onAdd={() => navigate("/blogs/new")}
        addButtonText="Add Blog"
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
