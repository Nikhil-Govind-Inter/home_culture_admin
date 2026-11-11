import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
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
          <div className="flex gap-2">
            <Select
              value={stateFilter}
              onValueChange={(value) => {
                setStateFilter(value);
                setCityFilter("all");
              }}
            >
              <SelectTrigger className="w-auto min-w-[180px] gap-2 [&>span]:line-clamp-none [&>span]:whitespace-nowrap">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state.slug} value={state.slug}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={cityFilter}
              onValueChange={setCityFilter}
              disabled={stateFilter === "all"}
            >
              <SelectTrigger className="w-auto min-w-[180px] gap-2 [&>span]:line-clamp-none [&>span]:whitespace-nowrap">
                <SelectValue
                  placeholder={
                    stateFilter === "all"
                      ? "Select a state first"
                      : "All cities"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-auto min-w-[200px] gap-2 [&>span]:line-clamp-none [&>span]:whitespace-nowrap">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.slug} value={department.slug}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
