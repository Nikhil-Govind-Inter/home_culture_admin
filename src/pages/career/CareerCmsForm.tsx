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
import { careerCmsSchema, CareerCmsFormData } from "@/schemas/career/careerCmsSchema";
import { fetchCareerCms, saveCareerCms, ApiError } from "@/services/career/careerCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  "life_at_home_header_title",
  "life_at_home_title",
  "life_at_home_quote",
  "life_at_home_description",
  "life_at_home_skills_title",
  "why_join_us_header_title",
  "why_join_us_title",
  "why_join_us_description",
  "media_one_alt",
  "media_two_alt",
  "media_three_alt",
  "media_four_alt",
  "current_opening_header_title",
  "current_opening_title",
  "current_opening_description",
  "testimonial_header_title",
  "testimonial_title",
  "testimonial_description",
  "cta_media_alt",
  "cta_header_title",
  "cta_title",
  "cta_description",
  "cta_button_text",
  "cta_button_link",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = [
  "media_one_path",
  "media_two_path",
  "media_three_path",
  "media_four_path",
  "cta_desktop_media_path",
  "cta_mobile_media_path",
] as const;

// Section visibility switches
const STATUS_FIELDS = [
  "life_at_home_status",
  "why_join_us_status",
  "current_opening_status",
  "testimonial_status",
  "cta_status",
] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as CareerCmsFormData;

const MEDIA_SLOTS = [
  { image: "media_one_path", alt: "media_one_alt", label: "Image One" },
  { image: "media_two_path", alt: "media_two_alt", label: "Image Two" },
  { image: "media_three_path", alt: "media_three_alt", label: "Image Three" },
  { image: "media_four_path", alt: "media_four_alt", label: "Image Four" },
] as const;

export default function CareerCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<CareerCmsFormData>({
    resolver: zodResolver(careerCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchCareerCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as CareerCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load Career page content",
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

  const onSubmit = async (values: CareerCmsFormData) => {
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

      await saveCareerCms(formData);
      toast({ title: "Success", description: "Career page content saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Career page content",
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
        <h1 className="text-2xl font-bold">Career Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Career page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Life at Home Section */}
          <Card>
            <CardHeader>
              <CardTitle>Life at Home Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="life_at_home_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="life_at_home_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="life_at_home_title"
                  label="Title"
                  placeholder="Title"
                />
                <FormTextField
                  form={form}
                  name="life_at_home_quote"
                  label="Quote"
                  placeholder="Quote"
                />
                <FormTextField
                  form={form}
                  name="life_at_home_skills_title"
                  label="Skills Title"
                  placeholder="Skills title"
                />
              </div>
              <FormRichTextField
                form={form}
                name="life_at_home_description"
                label="Description"
                placeholder="Description"
              />
            </CardContent>
          </Card>

          {/* Why Join Us Section */}
          <Card>
            <CardHeader>
              <CardTitle>Why Join Us Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="why_join_us_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="why_join_us_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="why_join_us_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormTextareaField
                form={form}
                name="why_join_us_description"
                label="Description"
                placeholder="Description"
              />
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEDIA_SLOTS.map((slot) => (
                  <div key={slot.image} className="space-y-4">
                    <FormFileUploadField
                      form={form}
                      accept="image/*"
                      name={slot.image}
                      label={slot.label}
                      placeholder={`Upload ${slot.label.toLowerCase()}`}
                      recommendedDimensions="800×600px"
                    />
                    <FormTextField
                      form={form}
                      name={slot.alt}
                      label={`${slot.label} Alt Text`}
                      placeholder="Describe the image"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Opening Section */}
          <Card>
            <CardHeader>
              <CardTitle>Current Opening Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="current_opening_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="current_opening_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="current_opening_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormTextareaField
                form={form}
                name="current_opening_description"
                label="Description"
                placeholder="Description"
              />
            </CardContent>
          </Card>

          {/* Testimonial Section */}
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="testimonial_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="testimonial_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="testimonial_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormTextareaField
                form={form}
                name="testimonial_description"
                label="Description"
                placeholder="Description"
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
                  placeholder="e.g., /contact"
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
