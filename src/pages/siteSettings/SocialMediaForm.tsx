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
  FormFileUploadField,
  FormTextField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSocialMediaById,
  createSocialMedia,
  updateSocialMedia,
} from "@/services/siteSettings/socialMediaApi";
import {
  socialMediaSchema,
  SocialMediaFormData,
} from "@/schemas/socialMediaSchema";

export default function SocialMediaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      icon_media_path: "",
      media_alt: "",
      link: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadSocialMediaData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadSocialMediaData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchSocialMediaById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          icon_media_path: data.icon_media_path || "",
          media_alt: data.media_alt || "",
          link: data.link || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social media data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: SocialMediaFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("media_alt", data.media_alt);
      formData.append("link", data.link);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      const fileKeys = ["icon_media_path"] as const;
      for (const key of fileKeys) {
        const value = data[key];
        if (value instanceof File) formData.append(key, value);
      }

      if (isEditing && id) {
        await updateSocialMedia(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Social media item updated successfully",
        });
      } else {
        await createSocialMedia(formData);
        toast({
          title: "Success",
          description: "Social media item created successfully",
        });
      }

      navigate("/social-media");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} social media item`,
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
          onClick={() => navigate("/social-media")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Social Media
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} social media item
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFileUploadField
                form={form}
                name="icon_media_path"
                label="Icon"
                placeholder="Upload social media icon"
                accept="image/*"
                recommendedDimensions="64×64px"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="link"
                  label="Link"
                  placeholder="https://..."
                />

                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Name"
                  placeholder="e.g., Facebook, Twitter, LinkedIn"
                />
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/social-media")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
