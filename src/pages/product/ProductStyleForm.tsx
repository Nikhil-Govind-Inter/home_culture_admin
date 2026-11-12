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
import { FormTextField, FormFileUploadField } from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductStyleById,
  createProductStyle,
  updateProductStyle,
} from "@/services/product/productStyleApi";
import { productStyleSchema, ProductStyleFormData } from "@/schemas/product/productStyleSchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

export default function ProductStyleForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<ProductStyleFormData>({
    resolver: zodResolver(productStyleSchema),
    defaultValues: {
      media_path: "",
      media_alt: "",
      title: "",
      description: "",
      button_text: "",
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
      const response = await fetchProductStyleById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          title: data.title != null ? String(data.title) : "",
          description: data.description != null ? String(data.description) : "",
          button_text: data.button_text != null ? String(data.button_text) : "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load style data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProductStyleFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("media_alt", data.media_alt);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("button_text", data.button_text);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File) formData.append("media_path", data.media_path);

      if (isEditing && id) {
        await updateProductStyle(parseInt(id), formData);
        toast({ title: "Success", description: "Style updated successfully" });
      } else {
        await createProductStyle(formData);
        toast({ title: "Success", description: "Style created successfully" });
      }

      navigate("/product-styles");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} style`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/product-styles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Style</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} product style
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Style Information</CardTitle>
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
              <FormTextField form={form} name="description" label="Description" placeholder="Description" />
              <FormTextField form={form} name="button_text" label="Button Text" placeholder="Button Text" />
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
                        <Input type="number" min={1} placeholder="1" {...field} />
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
                        <p className="text-sm text-muted-foreground">Enable or disable this style.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button type="button" variant="outline" onClick={() => navigate("/product-styles")}>
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
