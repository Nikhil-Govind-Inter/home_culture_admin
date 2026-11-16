import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchContactEnquiryList,
  ContactEnquiry,
} from "@/services/contact/contactEnquiryApi";
import { usePaginatedList } from "@/hooks/usePaginatedList";

export default function ContactEnquiryList() {
  const navigate = useNavigate();
  const {
    items: rows,
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
  } = usePaginatedList<ContactEnquiry>(fetchContactEnquiryList);

  const columns: ColumnDef<ContactEnquiry>[] = [
    {
      id: "id",
      header: "ID",
      cell: ({ row, table }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit +
            table.getRowModel().rows.findIndex((r) => r.id === row.id) +
            1}
        </div>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="font-medium max-w-[220px] truncate">
          {row.getValue("full_name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm max-w-[240px] truncate">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("phone")}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[260px] truncate">
          {row.getValue("subject")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActionsMenu
          onView={() => navigate(`/contact-enquiries/${row.original.id}`)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      title="Contact Enquiries"
      searchPlaceholder="Search by name, email, phone or subject..."
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
