import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { Combobox } from "@/components/ui/combobox";
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
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchBlogsList,
  deleteBlog,
  toggleBlogStatus,
  toggleBlogFeatured,
  toggleBlogShowInHome,
  updateBlogSortOrder,
  Blog,
  BlogListFilters,
  ApiError,
} from "@/services/blogs/blogApi";
import {
  fetchAllBlogCategories,
  BlogCategory,
} from "@/services/blogs/blogCategoryApi";

export default function BlogsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [flagToggle, setFlagToggle] = useState<{
    item: Blog;
    field: "is_featured" | "show_in_home";
    checked: boolean;
  } | null>(null);

  useEffect(() => {
    fetchAllBlogCategories()
      .then(setCategories)
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load blog categories",
          variant: "destructive",
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
  items: blogs,
    setItems: setBlogs,
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
  } = usePaginatedList<Blog, BlogListFilters>(fetchBlogsList, 10, {
    category_id: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const handleSortOrderChange = useSortOrder(blogs, setBlogs, updateBlogSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setBlogs,
    refetch,
    toggleStatus: toggleBlogStatus,
    label: "Blog",
  });

  const TOGGLE_LABELS = {
    is_featured: { name: "featured", on: "mark as featured", off: "remove from featured" },
    show_in_home: { name: "show in home", on: "show on the home page", off: "hide from the home page" },
  } as const;

  const confirmFlagToggle = async () => {
    if (!flagToggle) return;
    const { item, field, checked } = flagToggle;
    const label = TOGGLE_LABELS[field];
    const apply = (value: boolean) =>
      setBlogs((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, [field]: value } : b)),
      );

    setFlagToggle(null);
    // Optimistic update; roll back if the request fails.
    apply(checked);
    try {
      await (field === "is_featured" ? toggleBlogFeatured : toggleBlogShowInHome)(
        item,
        checked,
      );
      toast({ title: "Success", description: `Blog ${label.name} updated successfully` });
    } catch (error) {
      apply(!checked);
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : `Failed to update ${label.name}`,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteBlog(deleteItemId);
      // Resync from the server; step back a page if this emptied the current one.
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
      id: "id",
      header: "ID",
      cell: ({ row, table }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}
        </div>
      ),
    },
    {
      accessorKey: "thumbnail_media_path",
      header: "Thumbnail",
      cell: ({ row }) => (
        <MediaThumbnail
          path={row.original.thumbnail_media_path}
          alt={row.original.thumbnail_media_alt}
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium max-w-[240px] truncate" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category?.title ?? "—"}</div>
      ),
    },
     {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <SortOrderCell
            sortOrder={row.getValue("sort_order") as number}
            onIncrement={() => handleSortOrderChange(item, 1)}
            onDecrement={() => handleSortOrderChange(item, -1)}
          />
        );
      },
    },
    {
      accessorKey: "show_in_home",
      header: "Show in Home",
      cell: ({ row }) => (
        <StatusToggleCell
          status={Boolean(row.original.show_in_home)}
          onCheckedChange={(checked) =>
            setFlagToggle({ item: row.original, field: "show_in_home", checked })
          }
        />
      ),
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => (
        <StatusToggleCell
          status={Boolean(row.original.is_featured)}
          onCheckedChange={(checked) =>
            setFlagToggle({ item: row.original, field: "is_featured", checked })
          }
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusToggleCell
          status={row.getValue("status") as boolean}
          onCheckedChange={(checked) =>
            setStatusToggleItem({ item: row.original, newStatus: checked })
          }
        />
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
        data={blogs}
        title="Blogs"
        searchPlaceholder="Search by Title, Excerpt or Category..."
        onAdd={() => navigate("/blogs/new")}
        addButtonText="Add Blog"
        toolbarExtra={
          <Combobox
            options={[
              { value: "all", label: "All categories" },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.title,
              })),
            ]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="All categories"
            searchPlaceholder="Search categories..."
            emptyText="No categories found."
            maxVisibleItems={6}
            autoWidth
          />
        }
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

      <AlertDialog
        open={!!flagToggle}
        onOpenChange={(open) => !open && setFlagToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {flagToggle ? TOGGLE_LABELS[flagToggle.field].name : ""} change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {flagToggle
                ? TOGGLE_LABELS[flagToggle.field][flagToggle.checked ? "on" : "off"]
                : ""}{" "}
              for this blog?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFlagToggle}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="blog"
      />
    </>
  );
}
