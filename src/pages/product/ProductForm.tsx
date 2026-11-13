import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MultiSelect, Option } from "@/components/ui/multi-select";
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
  FormSwitchField,
  FormFileUploadField,
} from "@/components/forms/FormFieldComponents";
import { generateSlug } from "@/utils/formUtils";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  ProductRelation,
} from "@/services/product/productApi";
import { fetchActiveProductStyles } from "@/services/product/productStyleApi";
import { fetchActiveProductTrims } from "@/services/product/productTrimApi";
import { fetchActiveProductSizes } from "@/services/product/productSizeApi";
import { fetchActiveProductAddOns } from "@/services/product/productAddOnApi";
import {
  productSchema,
  ProductFormData,
} from "@/schemas/product/productSchema";
import { StickyFormActions } from "@/components/forms/StickyFormActions";

type SelectionField =
  | "style_slugs"
  | "trim_slugs"
  | "size_slugs"
  | "add_ons_slugs";

const SELECTION_FIELDS: {
  name: SelectionField;
  label: string;
  placeholder: string;
}[] = [
  { name: "style_slugs", label: "Styles", placeholder: "Select styles..." },
  { name: "trim_slugs", label: "Trims", placeholder: "Select trims..." },
  { name: "size_slugs", label: "Sizes", placeholder: "Select sizes..." },
  { name: "add_ons_slugs", label: "Add-ons", placeholder: "Select add-ons..." },
];

const toOptions = (list: { slug?: string; label: string }[]): Option[] =>
  list.map((item) => ({ id: String(item.slug), name: item.label }));

// Slugs of a product's selected records.
const toSlugs = (list?: ProductRelation[]) =>
  (list ?? []).map((item) => String(item.slug));

export default function ProductForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  // Always load first: the selection dropdowns must be populated before the form renders.
  const [initialLoading, setInitialLoading] = useState(true);
  const [options, setOptions] = useState<Record<SelectionField, Option[]>>({
    style_slugs: [],
    trim_slugs: [],
    size_slugs: [],
    add_ons_slugs: [],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      media_path: "",
      media_alt: "",
      icon_media_path: "",
      icon_media_alt: "",
      title: "",
      slug: "",
      excerpt: "",
      header_title: "",
      description: "",
      button_text: "",
      style_slugs: [],
      trim_slugs: [],
      size_slugs: [],
      add_ons_slugs: [],
      sort_order: "1",
      status: true,
      show_in_home: true,
    },
  });

  // The slug follows the title (it can still be edited afterwards; the next change rewrites it).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "title")
        form.setValue("slug", generateSlug(values.title ?? ""));
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData(id ? parseInt(id) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async (itemId: number | null) => {
    try {
      setInitialLoading(true);
      const [styles, trims, sizes, addOns, response] = await Promise.all([
        fetchActiveProductStyles(),
        fetchActiveProductTrims(),
        fetchActiveProductSizes(),
        fetchActiveProductAddOns(),
        itemId ? fetchProductById(itemId) : Promise.resolve(null),
      ]);

      const loaded: Record<SelectionField, Option[]> = {
        style_slugs: toOptions(
          styles.map((s) => ({ slug: s.slug, label: s.title })),
        ),
        trim_slugs: toOptions(
          trims.map((t) => ({ slug: t.slug, label: t.title })),
        ),
        size_slugs: toOptions(
          sizes.map((s) => ({ slug: s.slug, label: `${s.title} (${s.size})` })),
        ),
        add_ons_slugs: toOptions(
          addOns.map((a) => ({ slug: a.slug, label: a.title || a.subtitle })),
        ),
      };

      const data = response?.data;

      // Keep already-selected records that are now inactive so saving doesn't silently drop them.
      if (data) {
        const keep = (
          field: SelectionField,
          list: ProductRelation[] | undefined,
          label: (r: ProductRelation) => string,
        ) => {
          (list ?? []).forEach((rel) => {
            if (!loaded[field].some((o) => o.id === String(rel.slug))) {
              loaded[field].push({
                id: String(rel.slug),
                name: `${label(rel)} (inactive)`,
              });
            }
          });
        };
        keep("style_slugs", data.styles, (r) => r.title ?? String(r.id));
        keep("trim_slugs", data.trims, (r) => r.title ?? String(r.id));
        keep(
          "size_slugs",
          data.sizes,
          (r) => `${r.title ?? r.id}${r.size != null ? ` (${r.size})` : ""}`,
        );
        keep(
          "add_ons_slugs",
          data.add_ons,
          (r) => r.title || r.subtitle || String(r.id),
        );
      }

      setOptions(loaded);

      if (data) {
        form.reset({
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          icon_media_path: data.icon_media_path || "",
          icon_media_alt: data.icon_media_alt || "",
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          header_title: data.header_title || "",
          description: data.description || "",
          button_text: data.button_text || "",
          style_slugs: toSlugs(data.styles),
          trim_slugs: toSlugs(data.trims),
          size_slugs: toSlugs(data.sizes),
          add_ons_slugs: toSlugs(data.add_ons),
          sort_order: (data.sort_order ?? 1).toString(),
          status: data.status ?? true,
          show_in_home: data.show_in_home ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product data or options",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("media_alt", data.media_alt);
      formData.append("icon_media_alt", data.icon_media_alt ?? "");
      formData.append("title", data.title);
      // An empty slug is generated by the server.
      formData.append("slug", data.slug ?? "");
      formData.append("excerpt", data.excerpt);
      formData.append("header_title", data.header_title);
      formData.append("description", data.description);
      formData.append("button_text", data.button_text);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("status", String(data.status ?? true));
      formData.append("show_in_home", String(data.show_in_home ?? true));

      // Repeated keys for each selected slug; an empty value tells the server to clear the selection.
      SELECTION_FIELDS.forEach(({ name }) => {
        const slugs = data[name];
        if (slugs.length === 0) formData.append(name, "");
        else slugs.forEach((selected) => formData.append(name, selected));
      });

      // Only newly chosen files are sent; existing paths stay untouched on the server.
      if (data.media_path instanceof File)
        formData.append("media_path", data.media_path);
      if (data.icon_media_path instanceof File)
        formData.append("icon_media_path", data.icon_media_path);

      if (isEditing && id) {
        await updateProduct(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(formData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      navigate("/products");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} product`,
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
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Product
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} product
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="Title"
                />
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  disabled
                  placeholder="Auto-generated from the title"
                />
                <FormTextField
                  form={form}
                  name="header_title"
                  label="Header Title"
                  placeholder="Header title"
                />
                <FormTextField
                  form={form}
                  name="excerpt"
                  label="Excerpt"
                  placeholder="Short excerpt shown under the title on the home page"
                />
                <FormTextField
                  form={form}
                  name="description"
                  label="Description"
                  placeholder="Description"
                />
                <FormTextField
                  form={form}
                  name="button_text"
                  label="Button Text"
                  placeholder="Button text"
                />

                <FormFileUploadField
                  form={form}
                  name="media_path"
                  label="Image"
                  placeholder="Upload image"
                  accept="image/*"
                  recommendedDimensions="800×600px"
                />
                <FormFileUploadField
                  form={form}
                  name="icon_media_path"
                  label="Icon (shown in footer)"
                  placeholder="Upload icon"
                  accept="image/*"
                  recommendedDimensions="64×64px"
                />
                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the image"
                />
                <FormTextField
                  form={form}
                  name="icon_media_alt"
                  label="Icon Alt Text"
                  placeholder="Describe the icon"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SELECTION_FIELDS.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={options[name]}
                          selected={field.value}
                          onChange={(selected) =>
                            field.onChange(selected.map(String))
                          }
                          placeholder={placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
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
                          Enable or disable this product.
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
                <FormSwitchField
                  form={form}
                  name="show_in_home"
                  label="Show in Home"
                  description="Display this product on the home page."
                />
              </div>
            </CardContent>
          </Card>

          <StickyFormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
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
