import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextField, FormTextareaField } from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactCmsSchema, ContactCmsFormData } from "@/schemas/contact/contactCmsSchema";
import { fetchContactCms, saveContactCms, ApiError, type ContactCms } from "@/services/contact/contactCmsApi";

const defaultValues: ContactCmsFormData = {
  title: "",
  description: "",
  form_title: "",
  social_media_title: "",
  map_url: "",
};

export default function ContactCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<ContactCmsFormData>({
    resolver: zodResolver(contactCmsSchema),
    defaultValues,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchContactCms();
        if (data) {
          form.reset({
            title: data.title || "",
            description: data.description || "",
            form_title: data.form_title || "",
            social_media_title: data.social_media_title || "",
            map_url: data.map_url || "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof ApiError ? error.message : "Failed to load contact CMS",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: ContactCmsFormData) => {
    try {
      setLoading(true);
      await saveContactCms(values as ContactCms);
      toast({ title: "Success", description: "Contact CMS saved successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save contact CMS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact CMS</h1>
        <p className="text-muted-foreground">Manage the contact page content</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField form={form} name="title" label="Title" placeholder="Contact title" />
              <FormTextareaField form={form} name="description" label="Description" placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="form_title" label="Form Title" placeholder="Form title" />
                <FormTextField form={form} name="social_media_title" label="Social Media Title" placeholder="Social media title" />
              </div>
              <FormTextareaField form={form} name="map_url" label="Map URL" placeholder="Map embed URL" />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
