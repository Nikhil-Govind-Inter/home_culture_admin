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
  FormSelectField,
  FormTextField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchBannerById,
  createBanner,
  updateBanner,
  ApiError,
} from "@/services/siteSettings/bannerApi";
import { bannerSchema, BannerFormData } from "@/schemas/bannerSchema";

export default function BannersForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      link: "",
      sortOrder: "0",
      status: "draft",
      image: "",
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadBannerData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadBannerData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchBannerById(itemId);
      const data = response.data;

      form.reset({
        title: data.title || "",
        subtitle: data.subtitle || "",
        link: data.link || "",
        sortOrder: String(data.sortOrder ?? 0),
        status: data.status || "draft",
        image: data.image || "",
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

  const onSubmit = async (data: BannerFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle ?? "");
      formData.append("link", data.link ?? "");
      formData.append("sortOrder", data.sortOrder || "0");
      formData.append("status", data.status);
      // Only a freshly picked file is sent; an unchanged image keeps its stored path.
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (isEditing && id) {
        await updateBanner(parseInt(id), formData);
        toast({ title: "Success", description: "Banner updated successfully" });
      } else {
        await createBanner(formData);
        toast({ title: "Success", description: "Banner created successfully" });
      }

      navigate("/banners");
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
        <Button variant="outline" size="icon" onClick={() => navigate("/banners")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Banner</h1>
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
                <FormTextField form={form} name="title" label="Title" placeholder="Banner title" />
                <FormTextField
                  form={form}
                  name="subtitle"
                  label="Sub Title"
                  placeholder="Banner sub title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormTextField form={form} name="link" label="Link" placeholder="https://..." />
                <FormTextField
                  form={form}
                  name="sortOrder"
                  label="Sort Order"
                  placeholder="0"
                />
                <FormSelectField
                  form={form}
                  name="status"
                  label="Status"
                  placeholder="Select status"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                  ]}
                />
              </div>

              <FormFileUploadField
                form={form}
                name="image"
                label="Image"
                placeholder="Upload banner image"
                accept="image/*"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/banners")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
