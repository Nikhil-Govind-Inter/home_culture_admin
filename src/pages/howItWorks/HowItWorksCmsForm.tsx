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
  howItWorksCmsSchema,
  HowItWorksCmsFormData,
} from "@/schemas/howItWorks/howItWorksCmsSchema";
import {
  fetchHowItWorksCms,
  saveHowItWorksCms,
  ApiError,
} from "@/services/howItWorks/howItWorksCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  // Vision
  "vision_section_media_alt",
  "vision_section_header_title",
  "vision_section_title",
  "vision_section_description",
  // Workshop
  "workshop_section_media_alt",
  "workshop_section_header_title",
  "workshop_section_title",
  "workshop_section_description",
  // Artisans
  "artisans_section_header_title",
  "artisans_section_title",
  "artisans_section_description",
  // Journey
  "journey_section_title",
  "journey_section_media_alt",
  // CTA
  "cta_media_alt",
  "cta_header_title",
  "cta_title",
  "cta_description",
  "cta_button_text",
  "cta_button_link",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = [
  "vision_section_media_path",
  "workshop_section_media_path",
  "journey_section_media_path",
  "cta_desktop_media_path",
  "cta_mobile_media_path",
] as const;

// Section visibility switches
const STATUS_FIELDS = [
  "vision_section_status",
  "workshop_section_status",
  "artisans_section_status",
  "journey_section_status",
  "cta_status",
] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as HowItWorksCmsFormData;

export default function HowItWorksCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<HowItWorksCmsFormData>({
    resolver: zodResolver(howItWorksCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchHowItWorksCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as HowItWorksCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load How It Works content",
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

  const onSubmit = async (values: HowItWorksCmsFormData) => {
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

      await saveHowItWorksCms(formData);
      toast({
        title: "Success",
        description: "How It Works content saved successfully",
      });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save How It Works content",
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
        <h1 className="text-2xl font-bold">How It Works CMS</h1>
        <p className="text-muted-foreground">
          Manage content for the How It Works page
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vision Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="vision_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="vision_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="vision_section_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="vision_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField {...imageProps} name="vision_section_media_path" label="Image" placeholder="Upload image" recommendedDimensions="600×700px" />
                <FormTextField form={form} name="vision_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workshop Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="workshop_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="workshop_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="workshop_section_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="workshop_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField {...imageProps} name="workshop_section_media_path" label="Image" placeholder="Upload image" recommendedDimensions="600×700px" />
                <FormTextField form={form} name="workshop_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artisans Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="artisans_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="artisans_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="artisans_section_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="artisans_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Journey Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="journey_section_status" label="Show section" />
              </div>
              <FormTextField form={form} name="journey_section_title" label="Title" placeholder="Title" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField {...imageProps} name="journey_section_media_path" label="Image" placeholder="Upload image" recommendedDimensions="1200×600px" />
                <FormTextField form={form} name="journey_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="cta_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="cta_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="cta_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="cta_description" label="Description" placeholder="Description" rows={6} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="cta_button_text" label="Button Label" placeholder="Button text" />
                <FormTextField form={form} name="cta_button_link" label="Button Link" placeholder="/contact" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField {...imageProps} name="cta_desktop_media_path" label="Desktop Image" placeholder="Upload desktop image" recommendedDimensions="1920×800px" />
                <FormFileUploadField {...imageProps} name="cta_mobile_media_path" label="Mobile Image" placeholder="Upload mobile image" recommendedDimensions="768×900px" />
              </div>
              <FormTextField form={form} name="cta_media_alt" label="Image Alt Text" placeholder="Describe the image" />
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
