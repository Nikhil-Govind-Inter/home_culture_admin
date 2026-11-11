import { useState, useEffect, type ReactNode } from "react";
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
  FormSelectField,
} from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { homeCmsSchema, homeCmsConditionalErrors, HomeCmsFormData } from "@/schemas/home/homeCmsSchema";
import { fetchHomeCms, saveHomeCms, ApiError } from "@/services/home/homeCmsApi";

// Text fields sent as plain strings
const TEXT_FIELDS = [
  "challenges_section_header_title",
  "challenges_section_title",
  "challenges_section_description",
  "challenges_section_right_title",
  "challenges_section_button_text",
  "challenges_section_button_link",
  "ownership_media_type",
  "ownership_mobile_media_alt",
  "ownership_header_title",
  "ownership_title",
  "ownership_description",
  "ownership_choose_title",
  "ownership_button_text",
  "ownership_button_link",
  "welcome_section_header_title",
  "welcome_section_title",
  "welcome_section_description",
  "style_section_title",
  "experience_section_header_title",
  "experience_section_title",
  "modal_title",
  "modal_description",
  "button_one_text",
  "button_one_link",
  "button_two_text",
  "phone",
  "whatsapp_number",
  "journey_section_header_title",
  "journey_section_title",
  "journey_section_media_type",
  "journey_section_media_alt",
  "journey_section_description",
  "journey_section_button_text",
  "journey_section_button_link",
  "insights_header_title",
  "insights_title",
  "insights_description",
  "insights_button_text",
  "insights_button_link",
  "cta_media_alt",
  "cta_header_title",
  "cta_title",
  "cta_description",
  "cta_button_one_text",
  "cta_button_one_link",
  "cta_button_two_text",
  "cta_button_two_link",
] as const;

// Uploaded files (images, or video for the ownership/journey desktop+mobile media)
const MEDIA_FIELDS = [
  "ownership_desktop_media_path",
  "ownership_mobile_media_path",
  "ownership_thumbnail",
  "journey_section_desktop_media_path",
  "journey_section_mobile_media_path",
  "journey_section_thumbnail",
  "cta_desktop_media_path",
  "cta_mobile_media_path",
] as const;

// Section visibility switches
const STATUS_FIELDS = [
  "challenges_section_status",
  "ownership_status",
  "welcome_section_status",
  "style_section_status",
  "experience_section_status",
  "journey_section_status",
  "insights_status",
  "cta_status",
] as const;

const MEDIA_TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const defaultValues = {
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(MEDIA_FIELDS.map((field) => [field, ""])),
  ...Object.fromEntries(STATUS_FIELDS.map((field) => [field, true])),
  ownership_media_type: "image",
  journey_section_media_type: "image",
} as HomeCmsFormData;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const Row = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

export default function HomeCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<HomeCmsFormData>({
    // Merge the media-type dependent errors so they show together with the others.
    resolver: async (values, context, options) => {
      const result = await zodResolver(homeCmsSchema)(values, context, options);
      const extra = homeCmsConditionalErrors(values);
      const keys = Object.keys(extra) as (keyof typeof extra)[];
      if (!keys.length) return result;
      const errors: Record<string, unknown> = { ...result.errors };
      keys.forEach((k) => {
        errors[k] = { type: "required", message: extra[k] };
      });
      return { values: {}, errors } as typeof result;
    },
    defaultValues,
  });

  const ownershipType = form.watch("ownership_media_type");
  const journeyType = form.watch("journey_section_media_type");

  // Switching a section's media type clears its uploaded media (user changes only, not form.reset).
  useEffect(() => {
    const sub = form.watch((_, { name, type }) => {
      if (type !== "change") return;
      if (name === "ownership_media_type") {
        form.setValue("ownership_desktop_media_path", "");
        form.setValue("ownership_mobile_media_path", "");
        form.setValue("ownership_thumbnail", "");
      } else if (name === "journey_section_media_type") {
        form.setValue("journey_section_desktop_media_path", "");
        form.setValue("journey_section_mobile_media_path", "");
        form.setValue("journey_section_thumbnail", "");
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const load = async () => {
    try {
      const { data } = await fetchHomeCms();
      // `data` is null until the first save: keep the blank form.
      if (data) {
        const values = { ...defaultValues } as Record<string, string | boolean>;
        [...TEXT_FIELDS, ...MEDIA_FIELDS].forEach((field) => {
          values[field] =
            (data[field] as string | null) ||
            (field.endsWith("_media_type") ? "image" : "");
        });
        STATUS_FIELDS.forEach((field) => {
          values[field] = data[field] ?? true;
        });
        form.reset(values as HomeCmsFormData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load Home page content",
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

  const onSubmit = async (values: HomeCmsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, values[field]));
      STATUS_FIELDS.forEach((field) => formData.append(field, String(values[field])));
      // Only freshly picked files are sent; unchanged media keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = values[field];
        if (field === "ownership_mobile_media_path" && values.ownership_media_type === "video") return;
        if (field === "journey_section_mobile_media_path" && values.journey_section_media_type === "video") return;
        if (field === "ownership_thumbnail" && values.ownership_media_type !== "video") return;
        if (field === "journey_section_thumbnail" && values.journey_section_media_type !== "video") return;
        if (value instanceof File) formData.append(field, value);
      });

      await saveHomeCms(formData);
      toast({ title: "Success", description: "Home page content saved successfully" });
      await load();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Home page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  const imageProps = { form, accept: "image/*" } as const;
  const mediaAccept = (type: string) => (type === "video" ? "video/mp4,video/webm" : "image/*");
  const mediaLabel = (type: string) => (type === "video" ? "video" : "image");

  const status = (name: (typeof STATUS_FIELDS)[number]) => (
    <div className="w-full md:w-1/2">
      <FormSwitchField form={form} name={name} label="Show section" />
    </div>
  );

  const headerTitle = (prefix: string, titleName = `${prefix}_title`) => (
    <Row>
      <FormTextField
        form={form}
        name={`${prefix}_header_title` as keyof HomeCmsFormData}
        label="Header Title"
        placeholder="Header title"
      />
      <FormTextField
        form={form}
        name={titleName as keyof HomeCmsFormData}
        label="Title"
        placeholder="Title"
      />
    </Row>
  );

  const button = (text: keyof HomeCmsFormData, link: keyof HomeCmsFormData, prefix = "Button") => (
    <Row>
      <FormTextField form={form} name={text} label={`${prefix} Label`} placeholder="Button text" />
      <FormTextField form={form} name={link} label={`${prefix} Link`} placeholder="/experiences" />
    </Row>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Home page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Challenges */}
          <Section title="Challenges Section">
            {status("challenges_section_status")}
            {headerTitle("challenges_section", "challenges_section_title")}
            <FormTextareaField
              form={form}
              name="challenges_section_description"
              label="Description"
              placeholder="Description"
            />
            <FormTextField
              form={form}
              name="challenges_section_right_title"
              label="Right Title"
              placeholder="Right title"
            />
            {button("challenges_section_button_text", "challenges_section_button_link")}
          </Section>

          {/* Ownership */}
          <Section title="Ownership Section">
            {status("ownership_status")}
            {headerTitle("ownership")}
            <FormTextareaField
              form={form}
              name="ownership_description"
              label="Description"
              placeholder="Description"
            />
            <FormTextField
              form={form}
              name="ownership_choose_title"
              label="Choose Title"
              placeholder="Choose title"
            />
            {button("ownership_button_text", "ownership_button_link")}
            <Row>
              <FormSelectField
                form={form}
                name="ownership_media_type"
                label="Media Type"
                placeholder="Select media type"
                options={MEDIA_TYPE_OPTIONS}
              />
              <FormTextField
                form={form}
                name="ownership_mobile_media_alt"
                label="Media Alt Text"
                placeholder="Describe the media"
              />
            </Row>
            <Row>
              <FormFileUploadField
                form={form}
                accept={mediaAccept(ownershipType)}
                name="ownership_desktop_media_path"
                label={`Desktop ${mediaLabel(ownershipType)}`}
                placeholder="Upload desktop media"
                recommendedDimensions="1920×1080px"
                maxVideoSize={50 * 1024 * 1024}
              />
              {ownershipType === "video" ? (
                <FormFileUploadField
                  {...imageProps}
                  name="ownership_thumbnail"
                  label="Thumbnail"
                  placeholder="Upload thumbnail"
                  recommendedDimensions="1920×1080px"
                />
              ) : (
                <FormFileUploadField
                  form={form}
                  accept={mediaAccept(ownershipType)}
                  name="ownership_mobile_media_path"
                  label={`Mobile ${mediaLabel(ownershipType)}`}
                  placeholder="Upload mobile media"
                  recommendedDimensions="768×900px"
                  maxVideoSize={50 * 1024 * 1024}
                />
              )}
            </Row>
          </Section>

          {/* Welcome */}
          <Section title="Welcome Section">
            {status("welcome_section_status")}
            {headerTitle("welcome_section")}
            <FormTextareaField
              form={form}
              name="welcome_section_description"
              label="Description"
              placeholder="Description"
            />
          </Section>

          {/* Style */}
          <Section title="Style Section">
            {status("style_section_status")}
            <FormTextField form={form} name="style_section_title" label="Title" placeholder="Title" />
          </Section>

          {/* Experience */}
          <Section title="Experience Section">
            {status("experience_section_status")}
            {headerTitle("experience_section")}
            <FormTextField form={form} name="modal_title" label="Modal Title" placeholder="Modal title" />
            <FormTextareaField
              form={form}
              name="modal_description"
              label="Modal Description"
              placeholder="Modal description"
            />
            <Row>
              <FormTextField form={form} name="button_one_text" label="Button One Label" placeholder="Button text" />
              <FormTextField form={form} name="button_one_link" label="Button One Link" placeholder="/experiences" />
            </Row>
            <FormTextField form={form} name="button_two_text" label="Button Two Label" placeholder="Button text" />
            <Row>
              <FormTextField form={form} name="phone" label="Phone" placeholder="+91 00000 00000" />
              <FormTextField form={form} name="whatsapp_number" label="WhatsApp Number" placeholder="+91 00000 00000" />
            </Row>
          </Section>

          {/* Journey */}
          <Section title="Journey Section">
            {status("journey_section_status")}
            {headerTitle("journey_section")}
            <FormTextareaField
              form={form}
              name="journey_section_description"
              label="Description"
              placeholder="Description"
            />
            {button("journey_section_button_text", "journey_section_button_link")}
            <Row>
              <FormSelectField
                form={form}
                name="journey_section_media_type"
                label="Media Type"
                placeholder="Select media type"
                options={MEDIA_TYPE_OPTIONS}
              />
              <FormTextField
                form={form}
                name="journey_section_media_alt"
                label="Media Alt Text"
                placeholder="Describe the media"
              />
            </Row>
            <Row>
              <FormFileUploadField
                form={form}
                accept={mediaAccept(journeyType)}
                name="journey_section_desktop_media_path"
                label={`Desktop ${mediaLabel(journeyType)}`}
                placeholder="Upload desktop media"
                recommendedDimensions="1920×1080px"
                maxVideoSize={50 * 1024 * 1024}
              />
              {journeyType === "video" ? (
                <FormFileUploadField
                  {...imageProps}
                  name="journey_section_thumbnail"
                  label="Thumbnail"
                  placeholder="Upload thumbnail"
                  recommendedDimensions="1920×1080px"
                />
              ) : (
                <FormFileUploadField
                  form={form}
                  accept={mediaAccept(journeyType)}
                  name="journey_section_mobile_media_path"
                  label={`Mobile ${mediaLabel(journeyType)}`}
                  placeholder="Upload mobile media"
                  recommendedDimensions="768×900px"
                  maxVideoSize={50 * 1024 * 1024}
                />
              )}
            </Row>
          </Section>

          {/* Insights */}
          <Section title="Insights Section">
            {status("insights_status")}
            {headerTitle("insights")}
            <FormTextareaField
              form={form}
              name="insights_description"
              label="Description"
              placeholder="Description"
            />
            {button("insights_button_text", "insights_button_link")}
          </Section>

          {/* CTA */}
          <Section title="CTA Section">
            {status("cta_status")}
            {headerTitle("cta")}
            <FormTextareaField
              form={form}
              name="cta_description"
              label="Description"
              placeholder="Description"
              rows={6}
            />
            {button("cta_button_one_text", "cta_button_one_link", "Button One")}
            {button("cta_button_two_text", "cta_button_two_link", "Button Two")}
            <Row>
              <FormFileUploadField
                {...imageProps}
                name="cta_desktop_media_path"
                label="Desktop Image"
                placeholder="Upload desktop image"
                recommendedDimensions="1920×800px"
              />
              <FormFileUploadField
                {...imageProps}
                name="cta_mobile_media_path"
                label="Mobile Image"
                placeholder="Upload mobile image"
                recommendedDimensions="768×900px"
              />
            </Row>
            <FormTextField
              form={form}
              name="cta_media_alt"
              label="Image Alt Text"
              placeholder="Describe the image"
            />
          </Section>

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
