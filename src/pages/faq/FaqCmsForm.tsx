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
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { faqCmsSchema, FaqCmsFormData } from "@/schemas/faq/faqCmsSchema";
import { fetchFaqCms, saveFaqCms, ApiError } from "@/services/faq/faqCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  // Section One
  "section_one_media_alt",
  "section_one_header_title",
  "section_one_title",
  "section_one_description",
  // Sidebar
  "sidebar_title",
  "sidebar_quotes",
  // Section Two
  "section_two_header_title",
  "section_two_title",
  "section_two_description",
  "section_two_button_text",
  "section_two_button_link",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = ["section_one_media_path"] as const;

// Visibility switches (`status` is the sidebar switch)
const STATUS_FIELDS = ["section_one_status", "status", "section_two_status"] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as FaqCmsFormData;

export default function FaqCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FaqCmsFormData>({
    resolver: zodResolver(faqCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchFaqCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as FaqCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load FAQ content",
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

  const onSubmit = async (values: FaqCmsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, values[field]));
      STATUS_FIELDS.forEach((field) =>
        formData.append(field, String(values[field])),
      );
      // Only freshly picked files are sent; unchanged media keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = values[field];
        if (value instanceof File) formData.append(field, value);
      });

      await saveFaqCms(formData);
      toast({
        title: "Success",
        description: "FAQ content saved successfully",
      });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save FAQ content",
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
        <h1 className="text-2xl font-bold">FAQ CMS</h1>
        <p className="text-muted-foreground">Manage content for the FAQ page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Faq Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="section_one_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="section_one_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="section_one_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="section_one_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField form={form} accept="image/*" name="section_one_media_path" label="Image" placeholder="Upload image" recommendedDimensions="1920×600px" />
                <FormTextField form={form} name="section_one_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="status" label="Show sidebar" />
              </div>
              <FormTextField form={form} name="sidebar_title" label="Title" placeholder="Sidebar title" />
              <FormTextareaField form={form} name="sidebar_quotes" label="Quotes" placeholder="Sidebar quotes" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="section_two_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="section_two_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="section_two_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="section_two_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="section_two_button_text" label="Button Label" placeholder="Button text" />
                <FormTextField form={form} name="section_two_button_link" label="Button Link" placeholder="/contact" />
              </div>
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
