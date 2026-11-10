import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormFileUploadField,
  FormSwitchField,
  FormRichTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogCmsSchema, BlogCmsFormData } from "@/schemas/blogs/blogCmsSchema";
import { fetchBlogCms, saveBlogCms, ApiError } from "@/services/blogs/blogCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  "detail_page_header_title",
  "detail_page_title",
  "detail_page_button_text",
  "detail_page_button_link",
  "cta_media_alt",
  "cta_header_title",
  "cta_title",
  "cta_description",
  "cta_button_text",
  "cta_button_link",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = ["cta_desktop_media_path", "cta_mobile_media_path"] as const;

// Section visibility switches
const STATUS_FIELDS = ["detail_page_status", "cta_status"] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as BlogCmsFormData;

export default function BlogCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<BlogCmsFormData>({
    resolver: zodResolver(blogCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchBlogCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as BlogCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load Blog page content",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: BlogCmsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, values[field]));
      STATUS_FIELDS.forEach((field) => formData.append(field, String(values[field])));
      // Only freshly picked files are sent; unchanged media keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = values[field];
        if (value instanceof File) formData.append(field, value);
      });

      await saveBlogCms(formData);
      toast({ title: "Success", description: "Blog page content saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Blog page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Blog pages</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Detail Page Section */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Page Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="detail_page_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="detail_page_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="detail_page_title"
                  label="Title"
                  placeholder="Title"
                />
                <FormTextField
                  form={form}
                  name="detail_page_button_text"
                  label="Button Text"
                  placeholder="e.g., All Blogs"
                />
                <FormTextField
                  form={form}
                  name="detail_page_button_link"
                  label="Button Link"
                  placeholder="e.g., /blogs"
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="cta_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="cta_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField form={form} name="cta_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField
                form={form}
                name="cta_description"
                label="Description"
                placeholder="Description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="cta_button_text"
                  label="Button Text"
                  placeholder="Button text"
                />
                <FormTextField
                  form={form}
                  name="cta_button_link"
                  label="Button Link"
                  placeholder="e.g., /experiences"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  accept="image/*"
                  name="cta_desktop_media_path"
                  label="Desktop Image"
                  placeholder="Upload desktop image"
                  recommendedDimensions="1440×500px"
                />
                <FormFileUploadField
                  form={form}
                  accept="image/*"
                  name="cta_mobile_media_path"
                  label="Mobile Image"
                  placeholder="Upload mobile image"
                  recommendedDimensions="600×700px"
                />
              </div>
              <FormTextField
                form={form}
                name="cta_media_alt"
                label="Image Alt Text"
                placeholder="Describe the image"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
