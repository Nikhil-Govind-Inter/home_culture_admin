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
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAboutHighlightById,
  createAboutHighlight,
  updateAboutHighlight,
} from "@/services/about/aboutHighlightApi";
import {
  aboutHighlightSchema,
  AboutHighlightFormData,
} from "@/schemas/aboutHighlightSchema";

export default function AboutHighlightForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<AboutHighlightFormData>({
    resolver: zodResolver(aboutHighlightSchema),
    defaultValues: {
      icon_media_path: "",
      title: "",
      description: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadHighlightData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadHighlightData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchAboutHighlightById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          icon_media_path: data.icon_media_path || "",
          title: data.title || "",
          description: data.description || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load highlight data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: AboutHighlightFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      const fileKeys = ["icon_media_path"] as const;
      for (const key of fileKeys) {
        const value = data[key];
        if (value instanceof File) formData.append(key, value);
      }

      if (isEditing && id) {
        await updateAboutHighlight(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Highlight updated successfully",
        });
      } else {
        await createAboutHighlight(formData);
        toast({
          title: "Success",
          description: "Highlight created successfully",
        });
      }

      navigate("/about-highlights");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} highlight`,
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
          onClick={() => navigate("/about-highlights")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Highlight
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} highlight
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Highlight Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFileUploadField
                form={form}
                name="icon_media_path"
                label="Icon"
                placeholder="Upload highlight icon"
                accept="image/*"
                recommendedDimensions="64×64px"
              />
              <FormTextField
                form={form}
                name="title"
                label="Title"
                placeholder="e.g., Handcrafted Quality"
              />
              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Short description of this highlight"
                rows={4}
              />
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
              onClick={() => navigate("/about-highlights")}
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
