import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormTextField, FormTextareaField, FormSwitchField } from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactCmsSchema, ContactCmsFormData } from "@/schemas/contact/contactCmsSchema";
import { fetchContactCms, saveContactCms, ApiError, type ContactCms } from "@/services/contact/contactCmsApi";

const defaultValues: ContactCmsFormData = {
  form_section_status: true,
  form_section_title: "",
  form_section_description: "",
  google_map_link: "",
  form_title: "",
  form_description: "",
  faq_section_status: true,
  faq_section_title: "",
  faq_section_description: "",
  faq_section_button_text: "",
  faq_section_button_link: "",
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
            form_section_status: data.form_section_status ?? true,
            form_section_title: data.form_section_title || "",
            form_section_description: data.form_section_description || "",
            google_map_link: data.google_map_link || "",
            form_title: data.form_title || "",
            form_description: data.form_description || "",
            faq_section_status: data.faq_section_status ?? true,
            faq_section_title: data.faq_section_title || "",
            faq_section_description: data.faq_section_description || "",
            faq_section_button_text: data.faq_section_button_text || "",
            faq_section_button_link: data.faq_section_button_link || "",
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
              <CardTitle>Form Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="form_section_status" label="Show section" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="form_section_title" label="Title" placeholder="Section title" />
                <FormTextField form={form} name="form_title" label="Form Title" placeholder="Form title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextareaField form={form} name="form_section_description" label="Description" placeholder="Section description" />
                <FormTextareaField form={form} name="form_description" label="Form Description" placeholder="Form description" />
              </div>
              <FormTextareaField form={form} name="google_map_link" label="Google Map Link" placeholder="Map embed URL" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full md:w-1/2">
                <FormSwitchField form={form} name="faq_section_status" label="Show section" />
              </div>
              <FormTextField form={form} name="faq_section_title" label="Title" placeholder="Section title" />
              <FormTextareaField form={form} name="faq_section_description" label="Description" placeholder="Section description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="faq_section_button_text" label="Button Text" placeholder="Button text" />
                <FormTextField form={form} name="faq_section_button_link" label="Button Link" placeholder="/faq" />
              </div>
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
