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

const defaultValues: AboutCmsFormData = {
  about_title: "",
  about_description: "",
  media_path: "",
  media_alt: "",
  trust_title: "",
  trust_description: "",
  mission_title: "",
  vision_title: "",
  mission_description: "",
  vision_description: "",
  history_title: "",
  message_title: "",
  message_subtitle: "",
  work_title: "",
  work_media_path: "",
  work_media_alt: "",
  about_core_title: "",
  about_core_description: "",
  about_code_media_path: "",
  about_code_media_alt: "",
  features_title: "",
  features_sub_title: "",
  features_description: "",
  industry_title: "",
  industry_description: "",
  industry_media_path: "",
  industry_media_alt: "",
};

export default function AboutCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  const form = useForm<AboutCmsFormData>({
    resolver: zodResolver(aboutCmsSchema),
    defaultValues,
  });

  useEffect(() => {
    loadAboutCmsData();
  }, []);

  const loadAboutCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchAboutCms();
      const data = response.data;

      if (data) {
        setRecordId(data.id);
        form.reset({
          about_title: data.about_title || "",
          about_description: data.about_description || "",
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          trust_title: data.trust_title || "",
          trust_description: data.trust_description || "",
          mission_title: data.mission_title || "",
          vision_title: data.vision_title || "",
          mission_description: data.mission_description || "",
          vision_description: data.vision_description || "",
          history_title: data.history_title || "",
          message_title: data.message_title || "",
          message_subtitle: data.message_subtitle || "",
          work_title: data.work_title || "",
          work_media_path: data.work_media_path || "",
          work_media_alt: data.work_media_alt || "",
          about_core_title: data.about_core_title || "",
          about_core_description: data.about_core_description || "",
          about_code_media_path: data.about_code_media_path || "",
          about_code_media_alt: data.about_code_media_alt || "",
          features_title: data.features_title || "",
          features_sub_title: data.features_sub_title || "",
          features_description: data.features_description || "",
          industry_title: data.industry_title || "",
          industry_description: data.industry_description || "",
          industry_media_path: data.industry_media_path || "",
          industry_media_alt: data.industry_media_alt || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const appendFile = (formData: FormData, key: string, value: unknown) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "string" && value) {
      formData.append(key, value);
    }
  };

  const onSubmit = async (data: AboutCmsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("about_title", data.about_title);
      formData.append("about_description", data.about_description);
      formData.append("media_alt", data.media_alt || "");
      formData.append("trust_title", data.trust_title);
      formData.append("trust_description", data.trust_description);
      formData.append("mission_title", data.mission_title);
      formData.append("vision_title", data.vision_title);
      formData.append("mission_description", data.mission_description);
      formData.append("vision_description", data.vision_description);
      formData.append("history_title", data.history_title);
      formData.append("message_title", data.message_title);
      formData.append("message_subtitle", data.message_subtitle);
      formData.append("work_title", data.work_title);
      formData.append("work_media_alt", data.work_media_alt || "");
      formData.append("about_core_title", data.about_core_title);
      formData.append("about_core_description", data.about_core_description);
      formData.append("about_code_media_alt", data.about_code_media_alt || "");
      formData.append("features_title", data.features_title);
      formData.append("features_sub_title", data.features_sub_title);
      formData.append("features_description", data.features_description);
      formData.append("industry_title", data.industry_title);
      formData.append("industry_description", data.industry_description);
      formData.append("industry_media_alt", data.industry_media_alt || "");

      appendFile(formData, "media_path", data.media_path);
      appendFile(formData, "work_media_path", data.work_media_path);
      appendFile(formData, "about_code_media_path", data.about_code_media_path);
      appendFile(formData, "industry_media_path", data.industry_media_path);

      const response = await saveAboutCms(formData, recordId ?? 1);
      if (response.data?.id) {
        setRecordId(response.data.id);
      }
      toast({
        title: "Success",
        description: "About page content saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to save About page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

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
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormTextField
                form={form}
                name="about_title"
                label="About Title"
                placeholder="Enter about title"
              />
              <FormRichTextField
                form={form}
                name="about_description"
                label="About Description"
                placeholder="Enter about description"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <div className="md:col-span-2">
                  <FormFileUploadField
                    form={form}
                    name="media_path"
                    label="Image"
                    placeholder="Upload image"
                    accept="image/*"
                  />
                </div>
                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the media"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trust Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormTextField
                form={form}
                name="trust_title"
                label="Trust Title"
                placeholder="Enter trust title"
              />
              <FormRichTextField
                form={form}
                name="trust_description"
                label="Trust Description"
                placeholder="Enter trust description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission &amp; Vision Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="mission_title"
                  label="Mission Title"
                  placeholder="Enter mission title"
                />
                <FormTextField
                  form={form}
                  name="vision_title"
                  label="Vision Title"
                  placeholder="Enter vision title"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormRichTextField
                  form={form}
                  name="mission_description"
                  label="Mission Description"
                  placeholder="Enter mission description"
                />
                <FormRichTextField
                  form={form}
                  name="vision_description"
                  label="Vision Description"
                  placeholder="Enter vision description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormTextField
                form={form}
                name="history_title"
                label="History Title"
                placeholder="Enter history title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="message_title"
                  label="Message Title"
                  placeholder="Enter message title"
                />
                <FormTextField
                  form={form}
                  name="message_subtitle"
                  label="Message Subtitle"
                  placeholder="Enter message subtitle"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="work_title"
                  label="Work Title"
                  placeholder="Enter work title"
                />

                <FormTextField
                  form={form}
                  name="work_media_alt"
                  label="Video Alt Text"
                  placeholder="Describe the media"
                />
              </div>

              <div className="md:col-span-2">
                <FormFileUploadField
                  form={form}
                  name="work_media_path"
                  label="Video"
                  placeholder="Upload video"
                  accept="video/*"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Core Values Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="about_core_title"
                  label="About Core Title"
                  placeholder="Enter core values title"
                />

                <FormRichTextField
                  form={form}
                  name="about_core_description"
                  label="About Core Description"
                  placeholder="Enter core values description"
                />

                <FormTextField
                  form={form}
                  name="about_code_media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the media"
                />
              </div>

              <div className="md:col-span-2">
                <FormFileUploadField
                  form={form}
                  name="about_code_media_path"
                  label="Image"
                  placeholder="Upload image"
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <FormTextField
                  form={form}
                  name="features_title"
                  label="Features Title"
                  placeholder="Enter features title"
                />
                <FormTextField
                  form={form}
                  name="features_sub_title"
                  label="Features Subtitle"
                  placeholder="Enter features subtitle"
                />
              </div>
              <FormRichTextField
                form={form}
                name="features_description"
                label="Features Description"
                placeholder="Enter features description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry Section</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormTextField
                form={form}
                name="industry_title"
                label="Industry Title"
                placeholder="Enter industry title"
              />
              <FormRichTextField
                form={form}
                name="industry_description"
                label="Industry Description"
                placeholder="Enter industry description"
              />
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormFileUploadField
                    form={form}
                    name="industry_media_path"
                    label="Image"
                    placeholder="Upload image"
                    accept="image/*"
                  />
                </div>
                <FormTextField
                  form={form}
                  name="industry_media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the media"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
