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
import { experienceCmsSchema, ExperienceCmsFormData } from "@/schemas/experience/experienceCmsSchema";
import {
  fetchExperienceCms,
  saveExperienceCms,
  ApiError,
} from "@/services/experience/experienceCmsApi";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  "intro_section_media_alt",
  "intro_section_header_title",
  "intro_section_title",
  "journey_section_header_title",
  "journey_section_title",
  "lifestyle_header_title",
  "lifestyle_title",
  "visit_section_media_alt",
  "visit_section_header_title",
  "visit_section_title",
  "feature_section_header_title",
  "feature_section_title",
  "booking_process_header_title",
  "booking_process_title",
  "faq_section_header_title",
  "faq_section_title",
  "enquiry_section_header_title",
  "enquiry_section_title",
  "intro_section_quote",
  "intro_section_description",
  "journey_section_description",
  "lifestyle_description",
  "visit_section_description",
  "faq_section_description",
  "enquiry_section_description",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = [
  "intro_section_media_path",
  "visit_section_media_path",
] as const;

// Section visibility switches
const STATUS_FIELDS = [
  "intro_section_status",
  "journey_section_status",
  "lifestyle_status",
  "visit_section_status",
  "feature_section_status",
  "booking_process_status",
  "faq_section_status",
  "enquiry_section_status",
] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as ExperienceCmsFormData;

export default function ExperienceCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<ExperienceCmsFormData>({
    resolver: zodResolver(experienceCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchExperienceCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as ExperienceCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load Experience page content",
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

  const onSubmit = async (values: ExperienceCmsFormData) => {
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

      await saveExperienceCms(formData);
      toast({
        title: "Success",
        description: "Experience page content saved successfully",
      });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save Experience page content",
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
        <h1 className="text-2xl font-bold">Experience Page CMS</h1>
        <p className="text-muted-foreground">
          Manage content for the Experience page
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Intro Section */}
          <Card>
            <CardHeader>
              <CardTitle>Intro Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="intro_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="intro_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="intro_section_title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="intro_section_quote" label="Quote" placeholder="Quote" rows={4} />
              <FormRichTextField form={form} name="intro_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="intro_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField form={form} name="intro_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          {/* Journey Section */}
          <Card>
            <CardHeader>
              <CardTitle>Journey Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="journey_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="journey_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="journey_section_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="journey_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Lifestyle Section */}
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="lifestyle_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="lifestyle_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="lifestyle_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="lifestyle_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Visit Section */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="visit_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="visit_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="visit_section_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="visit_section_description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="visit_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField form={form} name="visit_section_media_alt" label="Image Alt Text" placeholder="Describe the image" />
              </div>
            </CardContent>
          </Card>

          {/* Feature Section */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="feature_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="feature_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="feature_section_title" label="Title" placeholder="Title" />
              </div>
            </CardContent>
          </Card>

          {/* Booking Process Section */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Process Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="booking_process_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="booking_process_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="booking_process_title" label="Title" placeholder="Title" />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="faq_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="faq_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="faq_section_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="faq_section_description" label="Description" placeholder="Description" />
            </CardContent>
          </Card>

          {/* Enquiry Section */}
          <Card>
            <CardHeader>
              <CardTitle>Enquiry Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="enquiry_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="enquiry_section_header_title" label="Header Title" placeholder="Header title" />
                <FormTextField form={form} name="enquiry_section_title" label="Title" placeholder="Title" />
              </div>
              <FormRichTextField form={form} name="enquiry_section_description" label="Description" placeholder="Description" />
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
