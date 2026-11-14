import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormSearchableSelectField,
  FormTextField,
  FormTextareaField,
  FormRichTextField,
  FormFileUploadField,
  FormSwitchField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/utils/formUtils";
import { fetchBlogById, createBlog, updateBlog } from "@/services/blogs/blogApi";
import {
  fetchActiveBlogCategories,
  BlogCategory,
} from "@/services/blogs/blogCategoryApi";
import { blogSchema, BlogFormData } from "@/schemas/blogs/blogSchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

export default function BlogForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  // Always load first: the category dropdown must be populated before the form renders.
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      category_id: "",
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      reading_time: "",
      media_path: "",
      media_alt: "",
      sort_order: "1",
      status: true,
      is_featured: false,
      show_in_home: true,
    },
  });

  // The slug follows the title (it can still be edited afterwards; the next title change rewrites it).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "title") {
        form.setValue("slug", generateSlug(values.title ?? ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    loadData(id ? parseInt(id) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async (itemId: number | null) => {
    try {
      setInitialLoading(true);
      const [categoryList, response] = await Promise.all([
        fetchActiveBlogCategories(),
        itemId ? fetchBlogById(itemId) : Promise.resolve(null),
      ]);
      setCategories(categoryList);
      const data = response?.data;

      if (data) {
        form.reset({
          category_id: data.category_id ? String(data.category_id) : "",
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          description: data.description || "",
          reading_time: data.reading_time ? String(data.reading_time) : "",
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
          is_featured: data.is_featured ?? false,
          show_in_home: data.show_in_home ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog data or categories",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("category_id", data.category_id);
      formData.append("title", data.title);
      // An empty slug is generated from the title by the server.
      formData.append("slug", data.slug ?? "");
      formData.append("excerpt", data.excerpt);
      formData.append("description", data.description);
      formData.append("reading_time", data.reading_time);
      formData.append("media_alt", data.media_alt);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));
      formData.append("is_featured", String(data.is_featured));
      formData.append("show_in_home", String(data.show_in_home));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      }

      if (isEditing && id) {
        await updateBlog(parseInt(id), formData);
        toast({ title: "Success", description: "Blog updated successfully" });
      } else {
        await createBlog(formData);
        toast({ title: "Success", description: "Blog created successfully" });
      }

      navigate("/blogs");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} blog`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/blogs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Blog</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} blog post
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchableSelectField
                form={form}
                name="category_id"
                label="Category"
                placeholder="Select a category"
                searchPlaceholder="Search categories..."
                emptyMessage="No category found"
                options={categories.map((category) => ({
                  value: String(category.id),
                  label:
                    category.status === false
                      ? `${category.title} (inactive)`
                      : category.title,
                }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="Blog title"
                />
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  placeholder="Auto-generated from the title"
                />
              </div>
              <FormTextareaField
                form={form}
                name="excerpt"
                label="Excerpt"
                placeholder="Short summary shown on listing cards"
                rows={3}
              />
              <FormRichTextField
                form={form}
                name="description"
                label="Description"
                placeholder="Blog content"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reading_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="media_path"
                  label="Main Image"
                  placeholder="Upload main image"
                  accept="image/*"
                  recommendedDimensions="1200×600px"
                />
                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Main Image Alt Text"
                  placeholder="Describe the image"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <FormSwitchField
                  form={form}
                  name="status"
                  label="Status"
                  description="Enable or disable this blog."
                />
                <FormSwitchField
                  form={form}
                  name="is_featured"
                  label="Featured"
                  description="Highlight this blog on the listing page."
                />
                <FormSwitchField
                  form={form}
                  name="show_in_home"
                  label="Show in Home"
                  description="Display this blog on the home page."
                />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button type="button" variant="outline" onClick={() => navigate("/blogs")}>
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
