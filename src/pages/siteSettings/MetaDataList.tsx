import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { fetchMetaDataList, MetaData } from "@/services/siteSettings/metaDataApi";

export default function MetaDataList() {
  const navigate = useNavigate();

  const {
    items,
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
  } = usePaginatedList<MetaData>(fetchMetaDataList);

  const columns: ColumnDef<MetaData>[] = [
    {
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
      accessorKey: "meta_title",
      header: "Meta Title",
      cell: ({ row }) => (
        <div className="max-w-[260px] truncate" title={row.original.meta_title}>
          {row.original.meta_title}
        </div>
      ),
    },
    {
      accessorKey: "meta_keywords",
      header: "Keywords",
      cell: ({ row }) => (
        <div
          className="max-w-[220px] truncate text-muted-foreground"
          title={row.original.meta_keywords}
        >
          {row.original.meta_keywords}
        </div>
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
          onEdit={() => navigate(`/meta-data/${row.original.id}/edit`)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      title="Meta Data"
      searchPlaceholder="Search by Page or Meta Title..."
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
  );
}
