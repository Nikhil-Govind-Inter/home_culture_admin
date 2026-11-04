import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMetaDataById,
  updateMetaData,
  ApiError,
} from "@/services/siteSettings/metaDataApi";
import { metaDataSchema, MetaDataFormData } from "@/schemas/metaDataSchema";

// Meta data are fixed per-page records, so this form only edits an existing one.
export default function MetaDataForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<MetaDataFormData>({
    resolver: zodResolver(metaDataSchema),
    defaultValues: {
      page: "",
      page_slug: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setInitialLoading(true);
        const { data } = await fetchMetaDataById(parseInt(id));
        form.reset({
          page: data.page || "",
          page_slug: data.page_slug || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          meta_keywords: data.meta_keywords || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof ApiError ? error.message : "Failed to load meta data",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: MetaDataFormData) => {
    if (!id) return;
    try {
      setLoading(true);
      await updateMetaData(parseInt(id), {
        page: data.page ?? "",
        page_slug: data.page_slug ?? "",
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        meta_keywords: data.meta_keywords ?? "",
      });
      toast({ title: "Success", description: "Meta data updated successfully" });
      navigate("/meta-data");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update meta data",
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
        <Button variant="outline" size="icon" onClick={() => navigate("/meta-data")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Meta Data</h1>
          <p className="text-muted-foreground">
            Update the SEO meta data for the {form.getValues("page")} page
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
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

              <FormTextField
                form={form}
                name="meta_title"
                label="Meta Title"
                placeholder="Meta title (recommended up to 70 characters)"
              />

              <FormTextareaField
                form={form}
                name="meta_description"
                label="Meta Description"
                placeholder="Meta description (recommended up to 160 characters)"
                rows={4}
              />

              <FormTextField
                form={form}
                name="meta_keywords"
                label="Meta Keywords"
                placeholder="keyword one, keyword two, keyword three"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/meta-data")}>
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
