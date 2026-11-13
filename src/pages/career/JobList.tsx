import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { Combobox } from "@/components/ui/combobox";
import {
  fetchJobList,
  deleteJob,
  toggleJobStatus,
  updateJobSortOrder,
  Job,
  JobListFilters,
} from "@/services/career/jobApi";
import { fetchActiveCities, City } from "@/services/masters/cityApi";
import {
  fetchActiveDepartments,
  Department,
} from "@/services/career/departmentApi";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { fetchActiveStates, State } from "@/services/masters/stateApi";

export default function JobList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchActiveStates(), fetchActiveDepartments()])
      .then(([stateList, departmentList]) => {
        setStates(stateList);
        setDepartments(departmentList);
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load filters",
          variant: "destructive",
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cities are loaded per selected state; with no state selected there are none.
  useEffect(() => {
    if (stateFilter === "all") {
      setCities([]);
      return;
    }
    let cancelled = false;
    fetchActiveCities(stateFilter)
      .then((list) => {
        if (!cancelled) setCities(list);
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load cities",
          variant: "destructive",
        }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter]);

  const {
    items: rows,
    setItems: setRows,
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
  } = usePaginatedList<Job, JobListFilters>(fetchJobList, 10, {
    state: stateFilter === "all" ? undefined : stateFilter,
    city: cityFilter === "all" ? undefined : cityFilter,
    department: departmentFilter === "all" ? undefined : departmentFilter,
  });

  const handleSortOrderChange = useSortOrder(
    rows,
    setRows,
    updateJobSortOrder,
    (item) => item.slug,
  );
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } =
    useStatusToggle({
      setItems: setRows,
      refetch,
      toggleStatus: toggleJobStatus,
      label: "Job",
      getKey: (item) => item.slug,
    });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteJob(deleteItemId);
      // Resync from the server; step back a page if this emptied the current one.
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      // The server refuses to delete a record that still has dependent records; show its message.
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete Job",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Job>[] = [
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
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <div className="font-medium max-w-[300px] truncate">
          {row.getValue("position")}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      id: "city",
      header: "City",
      cell: ({ row }) => {
        const city = row.original.city;
        return (
          <div className="text-sm">
            {city
              ? city.state
                ? `${city.name}, ${city.state.name}`
                : city.name
              : "—"}
          </div>
        );
      },
    },
    {
      id: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.department?.name ?? "—"}</div>
      ),
    },
    {
      accessorKey: "posted_at",
      header: "Posted At",
      cell: ({ row }) => {
        const value = row.original.posted_at;
        return (
          <div className="text-sm text-muted-foreground">
            {value ? new Date(value).toLocaleDateString() : "—"}
          </div>
        );
      },
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <RowActionsMenu
            onEdit={() => navigate(`/jobs/${item.slug}/edit`)}
            onDelete={() => setDeleteItemId(item.slug)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        title="Jobs"
        searchPlaceholder="Search by Position or Slug..."
        toolbarExtra={
          <div className="flex flex-wrap gap-2">
            <Combobox
              options={[
                { value: "all", label: "All states" },
                ...states.map((state) => ({ value: state.slug, label: state.name })),
              ]}
              value={stateFilter}
              onChange={(value) => {
                setStateFilter(value);
                setCityFilter("all");
              }}
              placeholder="All states"
              searchPlaceholder="Search states..."
              emptyText="No states found."
              maxVisibleItems={6}
              autoWidth
            />
            <Combobox
              options={[
                { value: "all", label: "All cities" },
                ...cities.map((city) => ({ value: city.slug, label: city.name })),
              ]}
              // Empty value while disabled so the "Select a state first" placeholder shows.
              value={stateFilter === "all" ? "" : cityFilter}
              onChange={setCityFilter}
              disabled={stateFilter === "all"}
              placeholder={stateFilter === "all" ? "Select a state first" : "All cities"}
              searchPlaceholder="Search cities..."
              emptyText="No cities found."
              maxVisibleItems={6}
              autoWidth
            />
            <Combobox
              options={[
                { value: "all", label: "All departments" },
                ...departments.map((department) => ({
                  value: department.slug,
                  label: department.name,
                })),
              ]}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="All departments"
              searchPlaceholder="Search departments..."
              emptyText="No departments found."
              maxVisibleItems={6}
              autoWidth
            />
          </div>
        }
        onAdd={() => navigate("/jobs/new")}
        addButtonText="Add Job"
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
        itemLabel="Job"
      />
    </>
  );
}
