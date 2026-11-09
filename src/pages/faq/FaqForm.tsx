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
  FormSearchableSelectField,
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import {
  fetchActiveFaqCategories,
  FaqCategory,
} from "@/services/faq/faqCategoryApi";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchFaqById, createFaq, updateFaq } from "@/services/faq/faqApi";
import { faqSchema, FaqFormData } from "@/schemas/faq/faqSchema";

export default function FaqForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  // Always load first: the category dropdown must be populated before the form renders.
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<FaqCategory[]>([]);

  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      category_id: "",
      question: "",
      answer: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    loadFaqData(id ? parseInt(id) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFaqData = async (itemId: number | null) => {
    try {
      setInitialLoading(true);
      const [categoryList, response] = await Promise.all([
        fetchActiveFaqCategories(),
        itemId ? fetchFaqById(itemId) : Promise.resolve(null),
      ]);
      setCategories(categoryList);
      const data = response?.data;

      if (data) {
        form.reset({
          category_id: data.category_id ? String(data.category_id) : "",
          question: data.question || "",
          answer: data.answer || "",
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load FAQ data or categories",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FaqFormData) => {
    try {
      setLoading(true);

      const payload = {
        category_id: parseInt(data.category_id),
        question: data.question,
        answer: data.answer,
        sort_order: parseInt(data.sort_order || "1"),
        status: data.status ?? true,
      };

      if (isEditing && id) {
        await updateFaq(parseInt(id), payload);
        toast({
          title: "Success",
          description: "FAQ updated successfully",
        });
      } else {
        await createFaq(payload);
        toast({
          title: "Success",
          description: "FAQ created successfully",
        });
      }

      navigate("/faqs");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} FAQ`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/faqs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} FAQ</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} FAQ
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchableSelectField
                form={form}
                name="category_id"
                label="Category"
                placeholder="Select a category"
                searchPlaceholder="Search categories..."
                emptyMessage="No category found"
                options={categories.map((category) => ({
                  value: String(category.id),
                  label: category.status === false ? `${category.title} (inactive)` : category.title,
                }))}
              />
              <FormTextField
                form={form}
                name="question"
                label="Question"
                placeholder="e.g., How do I book a workshop?"
              />
              <FormTextareaField
                form={form}
                name="answer"
                label="Answer"
                placeholder="Answer to the question"
                rows={6}
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
              onClick={() => navigate("/faqs")}
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
