import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";
import {
  fetchProductList,
  deleteProduct,
  toggleProductStatus,
  updateProductSortOrder,
  Product,
  ProductRelation,
  ProductListFilters,
} from "@/services/product/productApi";
import { fetchActiveProductStyles } from "@/services/product/productStyleApi";
import { fetchActiveProductTrims } from "@/services/product/productTrimApi";
import { fetchActiveProductSizes } from "@/services/product/productSizeApi";
import { fetchActiveProductAddOns } from "@/services/product/productAddOnApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

// Compact "name, name +2" summary of a selection column.
const relationName = (item: ProductRelation) => item.title || item.subtitle || item.slug || String(item.id);

const RelationCell = ({ items }: { items?: ProductRelation[] }) => {
  if (!items?.length) return <span className="text-sm text-muted-foreground">-</span>;
  return (
    <div className="flex flex-wrap gap-1 max-w-[260px]">
      {items.slice(0, 2).map((item) => (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="block max-w-[130px] truncate whitespace-nowrap">
              {relationName(item)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{relationName(item)}</TooltipContent>
        </Tooltip>
      ))}
      {items.length > 2 && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="whitespace-nowrap">
              +{items.length - 2}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{items.slice(2).map(relationName).join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

interface FilterOption {
  slug: string;
  label: string;
}

const ALL = "all";

export default function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [styleFilter, setStyleFilter] = useState(ALL);
  const [trimFilter, setTrimFilter] = useState(ALL);
  const [sizeFilter, setSizeFilter] = useState(ALL);
  const [addOnFilter, setAddOnFilter] = useState(ALL);
  const [filterOptions, setFilterOptions] = useState<{
    styles: FilterOption[];
    trims: FilterOption[];
    sizes: FilterOption[];
    addOns: FilterOption[];
  }>({ styles: [], trims: [], sizes: [], addOns: [] });

  useEffect(() => {
    Promise.all([
      fetchActiveProductStyles(),
      fetchActiveProductTrims(),
      fetchActiveProductSizes(),
      fetchActiveProductAddOns(),
    ])
      .then(([styles, trims, sizes, addOns]) =>
        setFilterOptions({
          styles: styles.map((s) => ({ slug: String(s.slug), label: s.title })),
          trims: trims.map((t) => ({ slug: String(t.slug), label: t.title })),
          sizes: sizes.map((s) => ({ slug: String(s.slug), label: `${s.title} (${s.size})` })),
          addOns: addOns.map((a) => ({ slug: String(a.slug), label: a.title || a.subtitle })),
        }),
      )
      .catch(() =>
        toast({ title: "Error", description: "Failed to load product filters", variant: "destructive" }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters: ProductListFilters = {
    style_slug: styleFilter === ALL ? undefined : styleFilter,
    trim_slug: trimFilter === ALL ? undefined : trimFilter,
    size_slug: sizeFilter === ALL ? undefined : sizeFilter,
    add_ons_slug: addOnFilter === ALL ? undefined : addOnFilter,
  };
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
  } = usePaginatedList<Product, ProductListFilters>(fetchProductList, 10, filters);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const handleSortOrderChange = useSortOrder(items, setItems, updateProductSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleProductStatus,
    label: "Product",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteProduct(deleteItemId);
      // Deleting can empty the current page: step back a page first if so.
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Product deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Product>[] = [
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
        <MediaThumbnail path={row.getValue("media_path")} alt={row.original.media_alt} />
      ),
    },
    {
      accessorKey: "icon_media_path",
      header: "Icon",
      cell: ({ row }) => (
        <MediaThumbnail path={row.getValue("icon_media_path")} alt={row.original.media_alt} />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{(row.getValue("title") as string) || "-"}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">{String(row.getValue("slug") ?? "") || "-"}</div>
      ),
    },
    {
      id: "styles",
      header: "Styles",
      cell: ({ row }) => <RelationCell items={row.original.styles} />,
    },
    {
      id: "trims",
      header: "Trims",
      cell: ({ row }) => <RelationCell items={row.original.trims} />,
    },
    {
      id: "sizes",
      header: "Sizes",
      cell: ({ row }) => <RelationCell items={row.original.sizes} />,
    },
    {
      id: "add_ons",
      header: "Add-ons",
      cell: ({ row }) => <RelationCell items={row.original.add_ons} />,
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
            onEdit={() => navigate(`/products/${item.id}/edit`)}
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
        title="Products"
        searchPlaceholder="Search by Title or Header Title..."
        onAdd={() => navigate("/products/new")}
        addButtonText="Add Product"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <div className="flex flex-wrap justify-end gap-2">
            {(
              [
                ["All styles", styleFilter, setStyleFilter, filterOptions.styles],
                ["All trims", trimFilter, setTrimFilter, filterOptions.trims],
                ["All sizes", sizeFilter, setSizeFilter, filterOptions.sizes],
                ["All add-ons", addOnFilter, setAddOnFilter, filterOptions.addOns],
              ] as const
            ).map(([placeholder, value, onChange, list]) => (
              <Select key={placeholder} value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{placeholder}</SelectItem>
                  {list.map((option) => (
                    <SelectItem key={option.slug} value={option.slug}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={![styleFilter, trimFilter, sizeFilter, addOnFilter].some((v) => v !== ALL)}
              onClick={() => {
                setStyleFilter(ALL);
                setTrimFilter(ALL);
                setSizeFilter(ALL);
                setAddOnFilter(ALL);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        }
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
        itemLabel="product"
      />
    </>
  );
}
