import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormSearchableSelectField,
  FormDateField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/utils/formUtils";
import { fetchJobBySlug, createJob, updateJob } from "@/services/career/jobApi";
import {
  fetchActiveDepartments,
  Department,
} from "@/services/career/departmentApi";
import { fetchActiveStates, State } from "@/services/masters/stateApi";
import { fetchActiveCities, City } from "@/services/masters/cityApi";
import { jobSchema, JobFormData } from "@/schemas/career/jobSchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

export default function JobForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug: jobSlug } = useParams();
  const isEditing = Boolean(jobSlug);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      state: "",
      city: "",
      department: "",
      position: "",
      slug: "",
      posted_at: "",
      sort_order: "1",
      status: true,
    },
  });

  // The slug follows the position (it can still be edited afterwards; the next position change rewrites it).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "position") {
        form.setValue("slug", generateSlug(values.position ?? ""));
      }
      // Changing the state clears the city and reloads the city options.
      if (name === "state") {
        form.setValue("city", "");
        loadCities(values.state ?? "");
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    loadData(jobSlug ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSlug]);

  // Cities are limited to the chosen state.
  const loadCities = async (stateSlug: string) => {
    try {
      setCities(stateSlug ? await fetchActiveCities(stateSlug) : []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
    }
  };

  const loadData = async (itemSlug: string | null) => {
    try {
      setInitialLoading(true);
      const [stateList, departmentList, response] = await Promise.all([
        fetchActiveStates(),
        fetchActiveDepartments(),
        itemSlug ? fetchJobBySlug(itemSlug) : Promise.resolve(null),
      ]);
      setStates(stateList);
      setDepartments(departmentList);
      const data = response?.data;

      if (data) {
        const stateSlug = data.city?.state?.slug ?? "";
        await loadCities(stateSlug);
        form.reset({
          state: stateSlug,
          city: data.city?.slug ?? "",
          department: data.department?.slug ?? "",
          position: data.position || "",
          slug: data.slug || "",
          // The server returns an ISO timestamp; the date input needs yyyy-mm-dd.
          posted_at: data.posted_at ? data.posted_at.slice(0, 10) : "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Job data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      setLoading(true);

      const payload = {
        city: data.city,
        department: data.department,
        position: data.position,
        slug: data.slug,
        posted_at: data.posted_at || null,
        sort_order: parseInt(data.sort_order || "1"),
        status: data.status ?? true,
      };

      if (isEditing && jobSlug) {
        await updateJob(jobSlug, payload);
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      } else {
        await createJob(payload);
        toast({
          title: "Success",
          description: "Job created successfully",
        });
      }

      navigate("/jobs");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} Job`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Job
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} Job
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSearchableSelectField
                  form={form}
                  name="state"
                  label="State"
                  placeholder="Select a state"
                  searchPlaceholder="Search states..."
                  emptyMessage="No state found"
                  options={states.map((state) => ({
                    value: state.slug,
                    label: state.name,
                  }))}
                />
                <FormSearchableSelectField
                  form={form}
                  name="city"
                  label="City"
                  placeholder={
                    form.watch("state")
                      ? "Select a city"
                      : "Select a state first"
                  }
                  searchPlaceholder="Search cities..."
                  emptyMessage="No city found"
                  options={cities.map((city) => ({
                    value: city.slug,
                    label: city.name,
                  }))}
                />
                <FormSearchableSelectField
                  form={form}
                  name="department"
                  label="Department"
                  placeholder="Select a department"
                  searchPlaceholder="Search departments..."
                  emptyMessage="No department found"
                  options={departments.map((department) => ({
                    value: department.slug,
                    label: department.name,
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormTextField
                  form={form}
                  name="position"
                  label="Position"
                  placeholder="e.g., Backend Developer"
                />
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  placeholder="Auto-generated from the position"
                />
                <FormDateField form={form} name="posted_at" label="Posted At" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this item.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/jobs")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </StickyFormActions>
        </form>
      </Form>
    </div>
  );
}
