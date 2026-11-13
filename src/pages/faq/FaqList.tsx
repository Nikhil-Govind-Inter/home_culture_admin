import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchFaqList,
  deleteFaq,
  toggleFaqStatus,
  updateFaqSortOrder,
  Faq,
  FaqListFilters,
} from "@/services/faq/faqApi";
import { fetchAllFaqCategories, FaqCategory } from "@/services/faq/faqCategoryApi";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function FaqList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<FaqCategory[]>([]);

  useEffect(() => {
    fetchAllFaqCategories()
      .then(setCategories)
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load FAQ categories",
          variant: "destructive",
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    items: faqItems,
    setItems: setFaqItems,
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
  } = usePaginatedList<Faq, FaqListFilters>(fetchFaqList, 10, {
    category_id: categoryFilter === "all" ? undefined : categoryFilter,
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const handleSortOrderChange = useSortOrder(faqItems, setFaqItems, updateFaqSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setFaqItems,
    refetch,
    toggleStatus: toggleFaqStatus,
    label: "FAQ",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteFaq(deleteItemId);
      // Resync from the server; step back a page if this emptied the current one.
      if (faqItems.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Faq>[] = [
    {
      id: "id",
      header: "ID",
      // Serial ID that stays continuous across pagination.
      cell: ({ row, table }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}
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
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="font-medium max-w-[300px] truncate">
          {row.getValue("question")}
        </div>
      ),
    },
    {
      accessorKey: "answer",
      header: "Answer",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
          {row.getValue("answer")}
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
            onEdit={() => navigate(`/faqs/${item.id}/edit`)}
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
        data={faqItems}
        title="FAQs"
        searchPlaceholder="Search by Question, Answer or Category..."
        onAdd={() => navigate("/faqs/new")}
        addButtonText="Add FAQ"
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
        itemLabel="FAQ"
      />
    </>
  );
}
