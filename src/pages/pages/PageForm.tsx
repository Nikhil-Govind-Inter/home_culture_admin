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
  fetchPageById,
  createPage,
  updatePage,
  ApiError,
} from "@/services/pages/pageApi";
import { pageSchema, PageFormData } from "@/schemas/pageSchema";

export default function PageForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: { title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft" },
  });

  useEffect(() => {
    if (isEditing && id) loadData(parseInt(id));
  }, [id, isEditing]);

  const loadData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchPageById(itemId);
      form.reset({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        status: data.status || "draft",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load page",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values: PageFormData) => {
    try {
      setLoading(true);
      const payload = {
        title: values.title,
        slug: values.slug ?? "",
        content: values.content ?? "",
        metaTitle: values.metaTitle ?? "",
        metaDescription: values.metaDescription ?? "",
        status: values.status,
      };
      if (isEditing && id) await updatePage(parseInt(id), payload);
      else await createPage(payload);
      toast({ title: "Success", description: `Page ${isEditing ? "updated" : "created"} successfully` });
      navigate("/pages");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} page`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Page</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="title" label="Title" placeholder="Page title" />
                <FormTextField form={form} name="slug" label="Slug" placeholder="Auto-generated from title if empty" />
              </div>
              <FormRichTextField form={form} name="content" label="Content" placeholder="Page content" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="metaTitle" label="Meta Title" placeholder="Meta title" />
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
              <FormTextareaField form={form} name="metaDescription" label="Meta Description" placeholder="Meta description" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/pages")}>
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
