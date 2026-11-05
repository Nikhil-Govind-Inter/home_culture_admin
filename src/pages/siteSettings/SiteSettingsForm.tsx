import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormFileUploadField,
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { siteSettingsSchema, SiteSettingsFormData } from "@/schemas/siteSettings/siteSettingsSchema";
import {
  fetchSiteSettings,
  saveSiteSettings,
  ApiError,
} from "@/services/siteSettings/siteSettingsApi";

const TEXT_FIELDS = [
  "header_logo_alt",
  "footer_logo_alt",
  "header_button_text",
  "header_button_link",
  "footer_title",
  "description",
  "address",
  "email",
  "phone",
] as const;
const MEDIA_FIELDS = ["header_logo", "footer_logo"] as const;

const defaultValues: SiteSettingsFormData = {
  header_logo: "",
  footer_logo: "",
  header_logo_alt: "",
  footer_logo_alt: "",
  header_button_text: "",
  header_button_link: "",
  footer_title: "",
  description: "",
  address: "",
  email: "",
  phone: "",
};

export default function SiteSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchSiteSettings();
      if (data) {
        form.reset({
          header_logo: data.header_logo || "",
          footer_logo: data.footer_logo || "",
          header_logo_alt: data.header_logo_alt || "",
          footer_logo_alt: data.footer_logo_alt || "",
          header_button_text: data.header_button_text || "",
          header_button_link: data.header_button_link || "",
          footer_title: data.footer_title || "",
          description: data.description || "",
          address: data.address || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load site settings",
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

  const onSubmit = async (values: SiteSettingsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, values[field]));
      // Only freshly picked files are sent; unchanged logos keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = values[field];
        if (value instanceof File) formData.append(field, value);
      });

      await saveSiteSettings(formData);
      toast({ title: "Success", description: "Site settings saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save site settings",
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
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage the website header, footer and contact details</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="header_logo"
                  label="Header Logo"
                  placeholder="Upload header logo"
                  recommendedDimensions="200×60px"
                  accept="image/*"
                />
                <FormTextField
                  form={form}
                  name="header_logo_alt"
                  label="Header Logo Alt Text"
                  placeholder="Describe the logo"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="header_button_text"
                  label="Header Button Text"
                  placeholder="Button text"
                />
                <FormTextField
                  form={form}
                  name="header_button_link"
                  label="Header Button Link"
                  placeholder="/contact"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="footer_logo"
                  label="Footer Logo"
                  placeholder="Upload footer logo"
                  recommendedDimensions="200×60px"
                  accept="image/*"
                />
                <FormTextField
                  form={form}
                  name="footer_logo_alt"
                  label="Footer Logo Alt Text"
                  placeholder="Describe the footer logo"
                />
              </div>
              <FormTextField form={form} name="footer_title" label="Footer Title" placeholder="Footer title" />
              <FormTextareaField form={form} name="description" label="Description" placeholder="Description" rows={4} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextareaField form={form} name="address" label="Address" placeholder="Address" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="email" label="Email" placeholder="info@example.com" />
                <FormTextField form={form} name="phone" label="Phone" placeholder="Phone number" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
