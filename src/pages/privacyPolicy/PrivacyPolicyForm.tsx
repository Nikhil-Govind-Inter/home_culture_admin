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
  FormRichTextField,
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  privacyPolicySchema,
  PrivacyPolicyFormData,
} from "@/schemas/privacyPolicy/privacyPolicySchema";
import {
  fetchPrivacyPolicy,
  savePrivacyPolicy,
  ApiError,
} from "@/services/privacyPolicy/privacyPolicyApi";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

const TEXT_FIELDS = [
  "content_section_side_title",
  "content",
  "cta_section_media_alt",
  "cta_section_header_title",
  "cta_section_title",
  "cta_section_description",
  "cta_section_button_text",
  "cta_section_button_link",
] as const;

const MEDIA_FIELDS = [
  "cta_section_desktop_media_path",
  "cta_section_mobile_media_path",
] as const;

const STATUS_FIELDS = ["content_section_status", "cta_section_status"] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  content_section_status: true,
  cta_section_status: true,
} as PrivacyPolicyFormData;

export default function PrivacyPolicyForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<PrivacyPolicyFormData>({
    resolver: zodResolver(privacyPolicySchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchPrivacyPolicy();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as PrivacyPolicyFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load privacy policy",
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

  const onSubmit = async (values: PrivacyPolicyFormData) => {
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

      await savePrivacyPolicy(formData);
      toast({ title: "Success", description: "Privacy policy saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save privacy policy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  const imageProps = { form, accept: "image/*" } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Manage the privacy policy page content</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Content Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="content_section_status" label="Show section" />
              </div>
              <FormTextField
                form={form}
                name="content_section_side_title"
                label="Side Title"
                placeholder="Side title"
              />
              <FormRichTextField
                form={form}
                name="content"
                label="Content"
                placeholder="Privacy policy content"
              />
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="cta_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="cta_section_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="cta_section_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormTextareaField
                form={form}
                name="cta_section_description"
                label="Description"
                placeholder="Description"
                rows={6}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="cta_section_button_text"
                  label="Button Label"
                  placeholder="Button text"
                />
                <FormTextField
                  form={form}
                  name="cta_section_button_link"
                  label="Button Link"
                  placeholder="/contact"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="cta_section_desktop_media_path"
                  label="Desktop Image"
                  placeholder="Upload desktop image"
                  recommendedDimensions="1920×800px"
                />
                <FormFileUploadField
                  {...imageProps}
                  name="cta_section_mobile_media_path"
                  label="Mobile Image"
                  placeholder="Upload mobile image"
                  recommendedDimensions="768×900px"
                />
              </div>
              <FormTextField
                form={form}
                name="cta_section_media_alt"
                label="Image Alt Text"
                placeholder="Describe the image"
              />
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </StickyFormActions>
        </form>
      </Form>
    </div>
  );
}
