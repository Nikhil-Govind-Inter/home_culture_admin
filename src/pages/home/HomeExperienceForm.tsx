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
  FormFileUploadField,
  FormSelectField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchHomeExperienceById,
  createHomeExperience,
  updateHomeExperience,
} from "@/services/home/homeExperienceApi";
import {
  homeExperienceSchema,
  homeExperienceConditionalErrors,
  HomeExperienceFormData,
} from "@/schemas/home/homeExperienceSchema";
import { buildMediaResolver } from "@/schemas/home/mediaRules";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

const MEDIA_TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const mediaAccept = (type: string) =>
  type === "video" ? "video/mp4,video/webm" : "image/*";
const mediaLabel = (type: string) => (type === "video" ? "video" : "image");

export default function HomeExperienceForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<HomeExperienceFormData>({
    resolver: buildMediaResolver<HomeExperienceFormData>(
      homeExperienceSchema,
      homeExperienceConditionalErrors,
    ),
    defaultValues: {
      title: "",
      media_type: "image",
      media_alt: "",
      media_path: "",
      thumbnail: "",
      sort_order: "1",
      status: true,
    },
  });

  const mediaType = form.watch("media_type");

  // Switching the media type clears the uploaded media (user changes only, not form.reset).
  useEffect(() => {
    const sub = form.watch((_, { name, type }) => {
      if (type === "change" && name === "media_type") {
        form.setValue("media_path", "");
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
      const response = await fetchHomeExperienceById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          title: data.title || "",
          media_type: data.media_type || "image",
          media_alt: data.media_alt || "",
          media_path: data.media_path || "",
          thumbnail: data.thumbnail || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load experience data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: HomeExperienceFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("media_type", data.media_type);
      formData.append("media_alt", data.media_alt);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File)
        formData.append("media_path", data.media_path);
      if (data.media_type === "video" && data.thumbnail instanceof File)
        formData.append("thumbnail", data.thumbnail);

      if (isEditing && id) {
        await updateHomeExperience(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Experience updated successfully",
        });
      } else {
        await createHomeExperience(formData);
        toast({
          title: "Success",
          description: "Experience created successfully",
        });
      }

      navigate("/home-experiences");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} experience`,
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
          onClick={() => navigate("/home-experiences")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Experience
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} experience
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Experience Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="title"
                label="Title"
                placeholder="Title"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelectField
                  form={form}
                  name="media_type"
                  label="Media Type"
                  placeholder="Select media type"
                  options={MEDIA_TYPE_OPTIONS}
                />
                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Media Alt Text"
                  placeholder="Describe the media"
                />
              </div>
              {/* Two columns only when a thumbnail is shown (video). */}
              <div
                className={
                  mediaType === "video"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : undefined
                }
              >
                <FormFileUploadField
                  form={form}
                  accept={mediaAccept(mediaType)}
                  name="media_path"
                  label={mediaType === "video" ? "Video" : "Image"}
                  placeholder={`Upload ${mediaLabel(mediaType)}`}
                  recommendedDimensions="800×600px"
                  maxVideoSize={50 * 1024 * 1024}
                />
                {mediaType === "video" && (
                  <FormFileUploadField
                    form={form}
                    name="thumbnail"
                    label="Thumbnail"
                    placeholder="Upload image"
                    accept="image/*"
                    recommendedDimensions="800×600px"
                  />
                )}
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
              onClick={() => navigate("/home-experiences")}
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
