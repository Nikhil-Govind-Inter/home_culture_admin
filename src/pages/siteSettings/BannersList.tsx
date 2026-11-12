import { useNavigate } from "react-router-dom";
import { IMAGELESS_BANNER_SLUGS } from "@/schemas/siteSettings/bannerSchema";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import {
  fetchBannersList,
  toggleBannerStatus,
  Banner,
} from "@/services/siteSettings/bannerApi";

export default function BannersList() {
  const navigate = useNavigate();

  const {
    items: banners,
    setItems,
    refetch,
    searchInput,
    setSearchInput,
    searching,
    page,
    setPage,
    limit,
    setLimit,
    totalCount,
    totalPages,
    loading,
    itemsPage,
    itemsLimit,
  } = usePaginatedList<Banner>(fetchBannersList);

  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } =
    useStatusToggle({
      setItems,
      refetch,
      toggleStatus: toggleBannerStatus,
      label: "Banner",
    });

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row, table }) => (
        <div className="font-medium">
          {(itemsPage - 1) * itemsLimit + table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1}
        </div>
      ),
    },
    {
      accessorKey: "page",
      header: "Page",
      cell: ({ row }) => <div className="font-medium">{row.original.page}</div>,
    },
    {
      accessorKey: "page_slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.page_slug}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.title}>
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusToggleCell
          status={row.original.status}
          onCheckedChange={(checked) =>
            setStatusToggleItem({ item: row.original, newStatus: checked })
          }
        />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.updatedAt
            ? new Date(row.original.updatedAt).toLocaleDateString()
            : "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActionsMenu
          onEdit={() => navigate(`/banners/${row.original.id}/edit`)}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={banners}
        title="Banners"
        searchPlaceholder="Search by Page..."
        showAddButton={false}
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

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="banner"
      />
    </>
  );
}
