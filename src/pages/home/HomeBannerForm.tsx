import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormTextareaField,
  FormFileUploadField,
  FormSelectField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchHomeBannerById,
  createHomeBanner,
  updateHomeBanner,
} from "@/services/home/homeBannerApi";
import {
  homeBannerSchema,
  homeBannerConditionalErrors,
  HomeBannerFormData,
} from "@/schemas/home/homeBannerSchema";
import { buildMediaResolver } from "@/schemas/home/mediaRules";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

const MEDIA_TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const mediaAccept = (type: string) => (type === "video" ? "video/mp4,video/webm" : "image/*");
const mediaLabel = (type: string) => (type === "video" ? "video" : "image");

export default function HomeBannerForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<HomeBannerFormData>({
    resolver: buildMediaResolver<HomeBannerFormData>(homeBannerSchema, homeBannerConditionalErrors),
    defaultValues: {
      header_title: "",
      title: "",
      description: "",
      media_type: "image",
      media_alt: "",
      desktop_media_path: "",
      mobile_media_path: "",
      thumbnail: "",
      button_one_text: "",
      button_one_link: "",
      button_two_text: "",
      button_two_link: "",
      sort_order: "1",
      status: true,
    },
  });

  const mediaType = form.watch("media_type");

  // Switching the media type clears the uploaded media (user changes only, not form.reset).
  useEffect(() => {
    const sub = form.watch((_, { name, type }) => {
      if (type === "change" && name === "media_type") {
        form.setValue("desktop_media_path", "");
        form.setValue("mobile_media_path", "");
        form.setValue("thumbnail", "");
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isEditing && id) {
      loadData(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeBannerById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          header_title: data.header_title || "",
          title: data.title || "",
          description: data.description || "",
          media_type: data.media_type || "image",
          media_alt: data.media_alt || "",
          desktop_media_path: data.desktop_media_path || "",
          mobile_media_path: data.mobile_media_path || "",
          thumbnail: data.thumbnail || "",
          button_one_text: data.button_one_text || "",
          button_one_link: data.button_one_link || "",
          button_two_text: data.button_two_text || "",
          button_two_link: data.button_two_link || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load banner data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: HomeBannerFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("header_title", data.header_title);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("media_type", data.media_type);
      formData.append("media_alt", data.media_alt);
      formData.append("button_one_text", data.button_one_text);
      formData.append("button_one_link", data.button_one_link);
      formData.append("button_two_text", data.button_two_text);
      formData.append("button_two_link", data.button_two_link);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.desktop_media_path instanceof File) formData.append("desktop_media_path", data.desktop_media_path);
      if (data.media_type === "image" && data.mobile_media_path instanceof File) formData.append("mobile_media_path", data.mobile_media_path);
      if (data.media_type === "video" && data.thumbnail instanceof File) formData.append("thumbnail", data.thumbnail);

      if (isEditing && id) {
        await updateHomeBanner(parseInt(id), formData);
        toast({ title: "Success", description: "Banner updated successfully" });
      } else {
        await createHomeBanner(formData);
        toast({ title: "Success", description: "Banner created successfully" });
      }

      navigate("/home-banners");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} banner`,
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/home-banners")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Banner
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} banner
          </p>
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
                <FormTextField form={form} name="header_title" label="Header Title" placeholder="Header Title" />
                <FormTextField form={form} name="title" label="Title" placeholder="Title" />
              </div>
              <FormTextareaField form={form} name="description" label="Description" placeholder="Description" rows={5} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelectField
                  form={form}
                  name="media_type"
                  label="Media Type"
                  placeholder="Select media type"
                  options={MEDIA_TYPE_OPTIONS}
                />
                <FormTextField form={form} name="media_alt" label="Media Alt Text" placeholder="Describe the media" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  accept={mediaAccept(mediaType)}
                  name="desktop_media_path"
                  label={`Desktop ${mediaLabel(mediaType)}`}
                  placeholder="Upload desktop media"
                  recommendedDimensions="1920×1080px"
                  maxVideoSize={50 * 1024 * 1024}
                />
                {mediaType === "image" && (
                  <FormFileUploadField
                    form={form}
                    name="mobile_media_path"
                    label="Mobile Image"
                    placeholder="Upload image"
                    accept="image/*"
                    recommendedDimensions="768×900px"
                  />
                )}
                {mediaType === "video" && (
                  <FormFileUploadField
                    form={form}
                    name="thumbnail"
                    label="Thumbnail"
                    placeholder="Upload image"
                    accept="image/*"
                    recommendedDimensions="1920×1080px"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="button_one_text" label="Button One Label" placeholder="Button One Label" />
                <FormTextField form={form} name="button_one_link" label="Button One Link" placeholder="/experiences" />
                <FormTextField form={form} name="button_two_text" label="Button Two Label" placeholder="Button Two Label" />
                <FormTextField form={form} name="button_two_link" label="Button Two Link" placeholder="/contact" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this item.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home-banners")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </StickyFormActions>
        </form>
      </Form>
    </div>
  );
}
