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
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productCmsSchema, ProductCmsFormData } from "@/schemas/product/productCmsSchema";
import { fetchProductCms, saveProductCms, ApiError } from "@/services/product/productCmsApi";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

// Text fields (plain and rich text) sent as strings
const TEXT_FIELDS = [
  "product_section_title",
  "style_section_title",
  "trim_section_title",
  "size_section_title",
  "add_ons_section_title",
  "summary_section_title",
  "summary_section_media_alt",
  "summary_section_media_header_title",
  "summary_section_media_title",
  "cta_section_media_alt",
  "cta_section_header_title",
  "cta_section_title",
  "cta_section_button_text",
  "cta_section_button_link",
  "product_section_description",
  "style_section_description",
  "trim_section_description",
  "size_section_description",
  "add_ons_section_description",
  "summary_section_description",
  "cta_section_description",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = [
  "summary_section_media_path",
  "cta_section_desktop_media_path",
  "cta_section_mobile_media_path",
] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  cta_section_status: true,
} as ProductCmsFormData;

export default function ProductCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<ProductCmsFormData>({
    resolver: zodResolver(productCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchProductCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        values.cta_section_status = data.cta_section_status ?? true;
        form.reset(values as ProductCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load Product page content",
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

  const onSubmit = async (values: ProductCmsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, values[field]));
      formData.append("cta_section_status", String(values.cta_section_status));
      // Only freshly picked files are sent; unchanged media keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = values[field];
        if (value instanceof File) formData.append(field, value);
      });

      await saveProductCms(formData);
      toast({ title: "Success", description: "Product page content saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Product page content",
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
        <h1 className="text-2xl font-bold">Product Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Product page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="product_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="product_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Style Section */}
          <Card>
            <CardHeader>
              <CardTitle>Style Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="style_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="style_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Trim Section */}
          <Card>
            <CardHeader>
              <CardTitle>Trim Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="trim_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="trim_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Size Section */}
          <Card>
            <CardHeader>
              <CardTitle>Size Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="size_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="size_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Add-ons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add-ons Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="add_ons_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="add_ons_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="summary_section_title" label="Title" placeholder="Title" />
              <FormRichTextField form={form} name="summary_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="summary_section_media_header_title" label="Image Header Title" placeholder="Header title" />
                <FormTextField form={form} name="summary_section_media_title" label="Image Title" placeholder="Title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  accept="image/*"
                  name="summary_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  recommendedDimensions="800×600px"
                />
                <FormTextField form={form} name="summary_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
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
                <FormSwitchField form={form} name="cta_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="cta_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="cta_section_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="cta_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  accept="image/*"
                  name="cta_section_desktop_media_path"
                  label="Desktop Image"
                  placeholder="Upload desktop image"
                  recommendedDimensions="1920×800px"
                />
                <FormFileUploadField
                  form={form}
                  accept="image/*"
                  name="cta_section_mobile_media_path"
                  label="Mobile Image"
                  placeholder="Upload mobile image"
                  recommendedDimensions="750×900px"
                />
              </div>
              <FormTextField form={form} name="cta_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="cta_section_button_text" label="Button Text" placeholder="Button text" />
                <FormTextField form={form} name="cta_section_button_link" label="Button Link" placeholder="/contact-us" />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </StickyFormActions>
        </form>
      </Form>
    </div>
  );
}
