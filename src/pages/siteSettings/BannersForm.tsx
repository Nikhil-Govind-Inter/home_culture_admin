import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormFileUploadField,
  FormSwitchField,
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchBannerById,
  updateBanner,
  ApiError,
} from "@/services/siteSettings/bannerApi";
import { bannerSchema, BannerFormData, IMAGELESS_BANNER_SLUGS } from "@/schemas/siteSettings/bannerSchema";

const TEXT_FIELDS = [
  "page_slug",
  "header_title",
  "title",
  "description",
  "banner_media_alt",
] as const;
const MEDIA_FIELDS = ["banner_desktop_media_path", "banner_mobile_media_path"] as const;

// Banners are fixed per-page records, so this form only edits an existing one.
export default function BannersForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      page: "",
      page_slug: "",
      header_title: "",
      title: "",
      description: "",
      banner_media_alt: "",
      status: true,
      banner_desktop_media_path: "",
      banner_mobile_media_path: "",
    },
  });

  const hideImages = IMAGELESS_BANNER_SLUGS.includes(form.watch("page_slug"));

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setInitialLoading(true);
        const { data } = await fetchBannerById(parseInt(id));
        form.reset({
          page: data.page || "",
          page_slug: data.page_slug || "",
          header_title: data.header_title || "",
          title: data.title || "",
          description: data.description || "",
          banner_media_alt: data.banner_media_alt || "",
          status: Boolean(data.status),
          banner_desktop_media_path: data.banner_desktop_media_path || "",
          banner_mobile_media_path: data.banner_mobile_media_path || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof ApiError ? error.message : "Failed to load banner data",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: BannerFormData) => {
    if (!id) return;
    try {
      setLoading(true);

      const formData = new FormData();
      TEXT_FIELDS.forEach((field) => formData.append(field, data[field]));
      formData.append("status", String(data.status));
      // Only freshly picked files are sent; unchanged images keep their stored path.
      MEDIA_FIELDS.forEach((field) => {
        const value = data[field];
        if (value instanceof File) formData.append(field, value);
      });

      await updateBanner(parseInt(id), formData);
      toast({ title: "Success", description: "Banner updated successfully" });
      navigate("/banners");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update banner",
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/banners")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Banner</h1>
          <p className="text-muted-foreground">Update the {form.getValues("page")} page banner</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="page" label="Page" placeholder="Page" disabled />
                <FormTextField
                  form={form}
                  name="page_slug"
                  label="Page Slug"
                  placeholder="page-slug"
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField form={form} name="title" label="Title" placeholder="Banner title" />
              </div>

              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Banner description"
                rows={4}
              />

              {!hideImages && (
                <>
                  <FormTextField
                    form={form}
                    name="banner_media_alt"
                    label="Image Alt Text"
                    placeholder="Describe the banner image"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFileUploadField
                      form={form}
                      name="banner_desktop_media_path"
                      label="Desktop Image"
                      placeholder="Upload desktop banner"
                      accept="image/*"
                      recommendedDimensions="1920×600px"
                    />
                    <FormFileUploadField
                      form={form}
                      name="banner_mobile_media_path"
                      label="Mobile Image"
                      placeholder="Upload mobile banner"
                      accept="image/*"
                      recommendedDimensions="768×800px"
                    />
                  </div>
                </>
              )}

              <FormSwitchField
                form={form}
                name="status"
                label="Active"
                description="Show this banner on the website"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/banners")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
