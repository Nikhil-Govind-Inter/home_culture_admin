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
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchExperienceTimelineById,
  createExperienceTimeline,
  updateExperienceTimeline,
} from "@/services/experience/experienceTimelineApi";
import {
  experienceTimelineSchema,
  ExperienceTimelineFormData,
} from "@/schemas/experience/experienceTimelineSchema";

export default function ExperienceTimelineForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<ExperienceTimelineFormData>({
    resolver: zodResolver(experienceTimelineSchema),
    defaultValues: {
      media_path: "",
      media_alt: "",
      title: "",
      subtitle: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadData(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchExperienceTimelineById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          title: data.title || "",
          subtitle: data.subtitle || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timeline item data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ExperienceTimelineFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("media_alt", data.media_alt);
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File) formData.append("media_path", data.media_path);

      if (isEditing && id) {
        await updateExperienceTimeline(parseInt(id), formData);
        toast({ title: "Success", description: "Timeline Item updated successfully" });
      } else {
        await createExperienceTimeline(formData);
        toast({ title: "Success", description: "Timeline Item created successfully" });
      }

      navigate("/experience-timeline");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} timeline item`,
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
          onClick={() => navigate("/experience-timeline")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Timeline Item
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} timeline item
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFileUploadField
                form={form}
                name="media_path"
                label="Image"
                placeholder="Upload image"
                accept="image/*"
                recommendedDimensions="800×600px"
              />
              <FormTextField form={form} name="media_alt" label="Image Alt Text" placeholder="Describe the image" />
              <FormTextField form={form} name="title" label="Title" placeholder="Title" />
              <FormTextField form={form} name="subtitle" label="Subtitle" placeholder="Subtitle" />
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
              onClick={() => navigate("/experience-timeline")}
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
