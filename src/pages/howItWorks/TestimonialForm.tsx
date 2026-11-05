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
  fetchTestimonialById,
  createTestimonial,
  updateTestimonial,
} from "@/services/howItWorks/testimonialApi";
import {
  testimonialSchema,
  TestimonialFormData,
} from "@/schemas/howItWorks/testimonialSchema";

export default function TestimonialForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      media_path: "",
      name: "",
      designation: "",
      quotes: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadTestimonialData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadTestimonialData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchTestimonialById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          media_path: data.media_path || "",
          name: data.name || "",
          designation: data.designation || "",
          quotes: data.quotes || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load testimonial data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("designation", data.designation ?? "");
      formData.append("quotes", data.quotes);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File) formData.append("media_path", data.media_path);

      if (isEditing && id) {
        await updateTestimonial(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Social media item updated successfully",
        });
      } else {
        await createTestimonial(formData);
        toast({
          title: "Success",
          description: "Social media item created successfully",
        });
      }

      navigate("/testimonials");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} testimonial`,
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
          onClick={() => navigate("/testimonials")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Testimonial
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} testimonial
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFileUploadField
                form={form}
                name="media_path"
                label="Profile Image"
                placeholder="Upload image"
                accept="image/*"
                recommendedDimensions="800×600px"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="name" label="Name" placeholder="Full name" />
                <FormTextField form={form} name="designation" label="Designation" placeholder="e.g., Interior Designer" />
              </div>
              <FormTextareaField form={form} name="quotes" label="Quote" placeholder="Testimonial text" rows={5} />
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
              onClick={() => navigate("/testimonials")}
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
