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
  fetchBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
} from "@/services/blogs/blogCategoryApi";
import {
  blogCategorySchema,
  BlogCategoryFormData,
} from "@/schemas/blogs/blogCategorySchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

export default function BlogCategoryForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<BlogCategoryFormData>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: {
      title: "",
      slug: "",
      sort_order: "1",
      status: true,
    },
  });

  // The slug always follows what is typed in the title (it can still be edited afterwards;
  // the next title change rewrites it).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "title") {
        form.setValue("slug", generateSlug(values.title ?? ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isEditing && id) {
      loadCategoryData(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadCategoryData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchBlogCategoryById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          title: data.title || "",
          slug: data.slug || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Blog category data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: BlogCategoryFormData) => {
    try {
      setLoading(true);

      // const formData = new FormData();
      // formData.append("title", data.title);
      // // An empty slug is generated from the title by the server.
      // formData.append("slug", data.slug ?? "");
      // formData.append("sort_order", (data.sort_order || "1").toString());
      // formData.append("status", String(data.status ?? true));

      const payload = {
        title: data.title,
        slug: data.slug ?? "",
        sort_order: parseInt(data.sort_order || "1"),
        status: data.status ?? true,
      };

      if (isEditing && id) {
        await updateBlogCategory(parseInt(id), payload);
        toast({
          title: "Success",
          description: "Blog category updated successfully",
        });
      } else {
        await createBlogCategory(payload);
        toast({
          title: "Success",
          description: "Blog category created successfully",
        });
      }

      navigate("/blog-categories");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} Blog category`,
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
          onClick={() => navigate("/blog-categories")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Blog Category
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} Blog category
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="e.g., Travel Tips"
                />
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  placeholder="Auto-generated from the title"
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
                        <Input type="number" min={1} placeholder="1" {...field} />
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
              onClick={() => navigate("/blog-categories")}
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
