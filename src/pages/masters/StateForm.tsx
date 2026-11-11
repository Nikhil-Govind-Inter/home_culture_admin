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
import { FormTextField } from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/utils/formUtils";
import {
  fetchStateBySlug,
  createState,
  updateState,
} from "@/services/masters/stateApi";
import { stateSchema, StateFormData } from "@/schemas/masters/stateSchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

export default function StateForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditing = Boolean(slug);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      name: "",
      slug: "",
      sort_order: "1",
      status: true,
    },
  });

  // The slug always follows what is typed in the name (it can still be edited afterwards;
  // the next name change rewrites it).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "name") {
        form.setValue("slug", generateSlug(values.name ?? ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isEditing && slug) {
      loadData(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isEditing]);

  const loadData = async (itemSlug: string) => {
    try {
      setInitialLoading(true);
      const response = await fetchStateBySlug(itemSlug);
      const data = response.data;

      if (data) {
        form.reset({
          name: data.name || "",
          slug: data.slug || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load State data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: StateFormData) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        slug: data.slug,
        sort_order: parseInt(data.sort_order || "1"),
        status: data.status ?? true,
      };

      if (isEditing && slug) {
        await updateState(slug, payload);
        toast({
          title: "Success",
          description: "State updated successfully",
        });
      } else {
        await createState(payload);
        toast({
          title: "Success",
          description: "State created successfully",
        });
      }

      navigate("/states");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} State`,
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/states")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} State
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} State
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>State Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="name"
                  label="Name"
                  placeholder="e.g., Kerala"
                />
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  placeholder="Auto-generated from the name"
                />
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
              onClick={() => navigate("/states")}
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
