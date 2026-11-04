import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormFileUploadField,
  FormRichTextField,
  FormSelectField,
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchBlogById,
  createBlog,
  updateBlog,
  ApiError,
} from "@/services/blogs/blogApi";
import { blogSchema, BlogFormData } from "@/schemas/blogSchema";

export default function BlogForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: { title: "", slug: "", excerpt: "", content: "", status: "draft", image: "" },
  });

  useEffect(() => {
    if (isEditing && id) loadData(parseInt(id));
  }, [id, isEditing]);

  const loadData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchBlogById(itemId);
      form.reset({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        status: data.status || "draft",
        image: data.image || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load blog",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values: BlogFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", values.slug ?? "");
      formData.append("excerpt", values.excerpt ?? "");
      formData.append("content", values.content ?? "");
      formData.append("status", values.status);
      // Only a freshly picked file is sent; an unchanged image keeps its stored path.
      if (values.image instanceof File) formData.append("image", values.image);

      if (isEditing && id) await updateBlog(parseInt(id), formData);
      else await createBlog(formData);
      toast({ title: "Success", description: `Blog ${isEditing ? "updated" : "created"} successfully` });
      navigate("/blogs");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} blog`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/blogs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Blog</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="title" label="Title" placeholder="Blog title" />
                <FormTextField form={form} name="slug" label="Slug" placeholder="Auto-generated from title if empty" />
              </div>
              <FormTextareaField form={form} name="excerpt" label="Excerpt" placeholder="Short summary" />
              <FormRichTextField form={form} name="content" label="Content" placeholder="Blog content" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelectField
                  form={form}
                  name="status"
                  label="Status"
                  placeholder="Select status"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                  ]}
                />
              </div>
              <FormFileUploadField form={form} name="image" label="Image" placeholder="Upload blog image" accept="image/*" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/blogs")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
