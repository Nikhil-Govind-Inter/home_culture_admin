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
import { aboutCmsSchema, AboutCmsFormData } from "@/schemas/aboutCmsSchema";
import {
  fetchAboutCms,
  saveAboutCms,
  ApiError,
} from "@/services/about/aboutCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  // Story
  "story_section_media_alt",
  "story_section_header_title",
  "story_section_title",
  "story_section_description",
  // Philosophy
  "philosophy_section_media_alt",
  "philosophy_section_header_title",
  "philosophy_section_title",
  "philosophy_section_description",
  // Mission & Vision
  "mission_title",
  "mission_description",
  "vision_title",
  "vision_description",
  // Highlight
  "highlight_section_header_title",
  "highlight_section_title",
  // Promise
  "promise_section_left_media_alt",
  "promise_section_right_media_alt",
  "promise_section_header_title",
  "promise_section_title",
  "promise_section_description",
  // CTA
  "cta_section_media_alt",
  "cta_section_header_title",
  "cta_section_title",
  "cta_section_description",
  "cta_section_button_text",
  "cta_section_button_link",
] as const;

// Image fields (uploaded as files)
const MEDIA_FIELDS = [
  "story_section_media_path",
  "philosophy_section_media_path",
  "mission_icon",
  "vision_icon",
  "promise_section_left_media_path",
  "promise_section_right_media_path",
  "cta_section_desktop_media_path",
  "cta_section_mobile_media_path",
] as const;

// Section visibility switches
const STATUS_FIELDS = [
  "story_section_status",
  "philosophy_section_status",
  "highlight_section_status",
  "promise_section_status",
  "cta_section_status",
] as const;

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
} as AboutCmsFormData;

export default function AboutCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<AboutCmsFormData>({
    resolver: zodResolver(aboutCmsSchema),
    defaultValues,
  });

  const load = async () => {
    try {
      const { data } = await fetchAboutCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] = data[field] || "";
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as AboutCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load About page content",
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

  const onSubmit = async (values: AboutCmsFormData) => {
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

      await saveAboutCms(formData);
      toast({
        title: "Success",
        description: "About page content saved successfully",
      });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save About page content",
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
        <h1 className="text-2xl font-bold">About Page CMS</h1>
        <p className="text-muted-foreground">
          Manage content for the About page
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Story Section */}
          <Card>
            <CardHeader>
              <CardTitle>Story Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitchField
                form={form}
                name="story_section_status"
                label="Show section"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="story_section_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="story_section_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormRichTextField
                form={form}
                name="story_section_description"
                label="Description"
                placeholder="Description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="story_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField
                  form={form}
                  name="story_section_media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the image"
                />
              </div>
            </CardContent>
          </Card>

          {/* Philosophy Section */}
          <Card>
            <CardHeader>
              <CardTitle>Philosophy Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitchField
                form={form}
                name="philosophy_section_status"
                label="Show section"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="philosophy_section_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="philosophy_section_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormRichTextField
                form={form}
                name="philosophy_section_description"
                label="Description"
                placeholder="Description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="philosophy_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField
                  form={form}
                  name="philosophy_section_media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the image"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="mission_title"
                  label="Title"
                  placeholder="Mission title"
                />
                <FormFileUploadField
                  {...imageProps}
                  name="mission_icon"
                  label="Icon"
                  placeholder="Upload icon"
                  recommendedDimensions="64×64px"
                />
              </div>
              <FormTextareaField
                form={form}
                name="mission_description"
                label="Description"
                placeholder="Description"
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Vision */}
          <Card>
            <CardHeader>
              <CardTitle>Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="vision_title"
                  label="Title"
                  placeholder="Vision title"
                />
                <FormFileUploadField
                  {...imageProps}
                  name="vision_icon"
                  label="Icon"
                  placeholder="Upload icon"
                  recommendedDimensions="64×64px"
                />
              </div>
              <FormTextareaField
                form={form}
                name="vision_description"
                label="Description"
                placeholder="Description"
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Highlight Section */}
          <Card>
            <CardHeader>
              <CardTitle>Highlight Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitchField
                form={form}
                name="highlight_section_status"
                label="Show section"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="highlight_section_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="highlight_section_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
            </CardContent>
          </Card>

          {/* Promise Section */}
          <Card>
            <CardHeader>
              <CardTitle>Promise Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitchField
                form={form}
                name="promise_section_status"
                label="Show section"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="promise_section_header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="promise_section_title"
                  label="Title"
                  placeholder="Title"
                />
              </div>
              <FormRichTextField
                form={form}
                name="promise_section_description"
                label="Description"
                placeholder="Description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="promise_section_left_media_path"
                  label="Left Image"
                  placeholder="Upload left image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField
                  form={form}
                  name="promise_section_left_media_alt"
                  label="Left Image Alt Text"
                  placeholder="Describe the image"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  {...imageProps}
                  name="promise_section_right_media_path"
                  label="Right Image"
                  placeholder="Upload right image"
                  recommendedDimensions="600×700px"
                />
                <FormTextField
                  form={form}
                  name="promise_section_right_media_alt"
                  label="Right Image Alt Text"
                  placeholder="Describe the image"
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
              <FormSwitchField
                form={form}
                name="cta_section_status"
                label="Show section"
              />
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
                  label="Button Text"
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
