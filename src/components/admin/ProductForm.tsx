import { ArrowLeft, CheckCircle2, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ButtonSpinner } from "../Loading";
import { useToast } from "../Toast";
import { useCategories } from "../../hooks/useCategories";
import { cn, getErrorMessage } from "../../lib/utils";
import { addProduct, deleteProduct, updateProduct } from "../../services/productService";
import {
  deleteProductImages,
  deleteStorageFileByUrl,
  uploadProductAdditionalImage,
  uploadProductMainImage,
} from "../../services/storageService";
import { AVAILABILITY_LABELS, type Availability, type Product } from "../../types/product";

interface ProductFormProps {
  mode: "add" | "edit";
  product?: Product;
  productId?: string;
}

interface PendingImage {
  file: File;
  preview: string;
}

interface FormValues {
  name: string;
  categoryId: string;
  description: string;
  material: string;
  type: string;
  specifications: string;
  sizes: string;
  applications: string;
  availability: Availability;
  featured: boolean;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  name: "",
  categoryId: "",
  description: "",
  material: "",
  type: "",
  specifications: "",
  sizes: "",
  applications: "",
  availability: "in-stock",
  featured: false,
};

function fieldClasses(error?: string): string {
  return cn(
    "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:ring-2 focus:outline-none",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-steel-300 focus:border-navy-600 focus:ring-navy-600/15",
  );
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function ProductForm({ mode, product, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { categories } = useCategories();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mainPreview, setMainPreview] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [existingAdditional, setExistingAdditional] = useState<string[]>([]);
  const [pendingAdditional, setPendingAdditional] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const originalMainUrl = product?.imageUrl ?? "";
  const originalAdditional = product?.additionalImages ?? [];

  useEffect(() => {
    if (mode === "edit" && product) {
      setValues({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        material: product.material,
        type: product.type,
        specifications: product.specifications,
        sizes: product.sizes,
        applications: product.applications,
        availability: product.availability,
        featured: product.featured,
      });
      setMainPreview(product.imageUrl);
      setExistingAdditional(product.additionalImages);
    }
  }, [mode, product]);

  const update = (field: keyof FormValues) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setValues((current) => ({ ...current, [field]: value } as FormValues));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (values.name.trim().length < 3) next.name = "Product name must be at least 3 characters.";
    if (!values.categoryId) next.categoryId = "Please select a category.";
    if (values.description.trim().length < 10) next.description = "Description must be at least 10 characters.";
    return next;
  };

  const handleMainChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be 5 MB or smaller.", "error");
      return;
    }
    setMainFile(file);
    setMainPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleAdditionalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const valid = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);

    if (valid.length !== files.length) {
      showToast("Some files were skipped. Images must be 5 MB or smaller.", "error");
    }

    setPendingAdditional((current) => [
      ...current,
      ...valid.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    event.target.value = "";
  };

  const removePending = (index: number) => {
    setPendingAdditional((current) => current.filter((_, position) => position !== index));
  };

  const removeExisting = (index: number) => {
    setExistingAdditional((current) => current.filter((_, position) => position !== index));
  };

  const categoryNameOf = (categoryId: string) => categories.find((category) => category.id === categoryId)?.name ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: values.name.trim(),
      categoryId: values.categoryId,
      categoryName: categoryNameOf(values.categoryId),
      description: values.description.trim(),
      material: values.material.trim(),
      type: values.type.trim(),
      specifications: values.specifications.trim(),
      sizes: values.sizes.trim(),
      applications: values.applications.trim(),
      availability: values.availability,
      featured: values.featured,
    };

    try {
      if (mode === "add") {
        setUploadStatus("Creating product…");
        const newId = await addProduct({ ...payload, imageUrl: "", additionalImages: [] });

        try {
          let imageUrl = "";
          if (mainFile) {
            setUploadStatus("Uploading main image…");
            imageUrl = await uploadProductMainImage(newId, mainFile);
          }

          const additionalUrls: string[] = [];
          for (let index = 0; index < pendingAdditional.length; index += 1) {
            setUploadStatus(`Uploading image ${index + 1} of ${pendingAdditional.length}…`);
            additionalUrls.push(await uploadProductAdditionalImage(newId, pendingAdditional[index].file, index));
          }

          await updateProduct(newId, { imageUrl, additionalImages: additionalUrls });
        } catch (uploadError) {
          await deleteProduct(newId).catch(() => undefined);
          await deleteProductImages(newId);
          throw uploadError;
        }

        showToast("Product added successfully.", "success");
        navigate("/admin/products");
        return;
      }

      if (!productId) throw new Error("not-found");

      setUploadStatus("Uploading images…");
      let imageUrl = mainPreview;

      if (mainFile) {
        imageUrl = await uploadProductMainImage(productId, mainFile);
      } else if (!mainPreview && originalMainUrl) {
        await deleteStorageFileByUrl(originalMainUrl);
      }

      const uploadedUrls: string[] = [];
      for (let index = 0; index < pendingAdditional.length; index += 1) {
        setUploadStatus(`Uploading image ${index + 1} of ${pendingAdditional.length}…`);
        uploadedUrls.push(
          await uploadProductAdditionalImage(productId, pendingAdditional[index].file, Date.now() + index),
        );
      }

      for (const url of originalAdditional) {
        if (!existingAdditional.includes(url)) {
          await deleteStorageFileByUrl(url);
        }
      }

      setUploadStatus("Saving product…");
      await updateProduct(productId, {
        ...payload,
        imageUrl,
        additionalImages: [...existingAdditional, ...uploadedUrls],
      });

      showToast("Product updated successfully.", "success");
      navigate("/admin/products");
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            No price fields — customers enquire on WhatsApp for pricing and quotations.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to products
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Details */}
        <div className="space-y-6">
          <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Basic Information</h2>

            <div className="mt-4 space-y-4">
              <div>
                <FieldLabel htmlFor="product-name" required>
                  Product Name
                </FieldLabel>
                <input
                  id="product-name"
                  type="text"
                  value={values.name}
                  onChange={update("name")}
                  placeholder="e.g. MS Angle 50x50"
                  className={fieldClasses(errors.name)}
                />
                <FieldError message={errors.name} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-category" required>
                    Category
                  </FieldLabel>
                  <select
                    id="product-category"
                    value={values.categoryId}
                    onChange={update("categoryId")}
                    className={fieldClasses(errors.categoryId)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.categoryId} />
                </div>

                <div>
                  <FieldLabel htmlFor="product-material">Material</FieldLabel>
                  <input
                    id="product-material"
                    type="text"
                    value={values.material}
                    onChange={update("material")}
                    placeholder="e.g. Mild Steel"
                    className={fieldClasses()}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-type">Type</FieldLabel>
                  <input
                    id="product-type"
                    type="text"
                    value={values.type}
                    onChange={update("type")}
                    placeholder="e.g. Equal Angle"
                    className={fieldClasses()}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="product-availability">Availability</FieldLabel>
                  <select
                    id="product-availability"
                    value={values.availability}
                    onChange={update("availability")}
                    className={fieldClasses()}
                  >
                    {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((key) => (
                      <option key={key} value={key}>
                        {AVAILABILITY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="product-description" required>
                  Description
                </FieldLabel>
                <textarea
                  id="product-description"
                  rows={4}
                  value={values.description}
                  onChange={update("description")}
                  placeholder="Short description shown on the product card and details page…"
                  className={cn(fieldClasses(errors.description), "resize-y")}
                />
                <FieldError message={errors.description} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Specifications</h2>

            <div className="mt-4 space-y-4">
              <div>
                <FieldLabel htmlFor="product-specifications">Specifications</FieldLabel>
                <textarea
                  id="product-specifications"
                  rows={3}
                  value={values.specifications}
                  onChange={update("specifications")}
                  placeholder="Grade, standards, finish, tolerances…"
                  className={cn(fieldClasses(), "resize-y")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-sizes">Available Sizes</FieldLabel>
                  <textarea
                    id="product-sizes"
                    rows={3}
                    value={values.sizes}
                    onChange={update("sizes")}
                    placeholder="e.g. 25x25x3mm, 50x50x5mm, 6m length"
                    className={cn(fieldClasses(), "resize-y")}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="product-applications">Applications</FieldLabel>
                  <textarea
                    id="product-applications"
                    rows={3}
                    value={values.applications}
                    onChange={update("applications")}
                    placeholder="Where this product is used…"
                    className={cn(fieldClasses(), "resize-y")}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-md border border-steel-200 bg-steel-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={update("featured")}
                  className="h-4 w-4 rounded border-steel-300 text-navy-700 focus:ring-navy-600/30"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-steel-700">
                  <Star className={cn("h-4 w-4", values.featured ? "fill-amber-400 text-amber-400" : "text-steel-400")} aria-hidden="true" />
                  Mark as featured product (shown on the homepage)
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Media */}
        <div className="space-y-6">
          <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Main Image</h2>
            <p className="mt-1 text-xs text-steel-500">JPG, PNG or WebP up to 5 MB.</p>

            <div className="mt-4">
              {mainPreview ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-steel-200 bg-steel-100">
                  <img src={mainPreview} alt="Main product preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setMainFile(null);
                      setMainPreview("");
                    }}
                    className="absolute top-2 right-2 rounded-md bg-steel-900/85 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-steel-300 bg-steel-50 text-center">
                  <ImagePlus className="h-8 w-8 text-steel-400" aria-hidden="true" />
                  <p className="px-4 text-xs text-steel-500">No image selected. A placeholder is shown until uploaded.</p>
                </div>
              )}

              <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                {mainPreview ? "Replace image" : "Upload image"}
                <input type="file" accept="image/*" className="sr-only" onChange={handleMainChange} />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Additional Images</h2>
            <p className="mt-1 text-xs text-steel-500">Optional gallery images shown on the product page.</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {existingAdditional.map((url, index) => (
                <div key={`existing-${url}`} className="group relative aspect-square overflow-hidden rounded-md border border-steel-200 bg-steel-100">
                  <img src={url} alt={`Additional image ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(index)}
                    className="absolute top-1 right-1 rounded bg-steel-900/85 p-1 text-white transition hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {pendingAdditional.map((image, index) => (
                <div key={`pending-${image.preview}`} className="relative aspect-square overflow-hidden rounded-md border border-navy-200 bg-navy-50">
                  <img src={image.preview} alt="Pending upload" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-navy-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removePending(index)}
                    className="absolute top-1 right-1 rounded bg-steel-900/85 p-1 text-white transition hover:bg-red-600"
                    aria-label="Remove pending image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-steel-300 bg-steel-50 text-steel-500 transition hover:border-navy-600 hover:text-navy-800">
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px] font-semibold">Add images</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleAdditionalChange} />
              </label>
            </div>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-steel-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-steel-500" role="status">
          {uploadStatus || (mode === "add" ? "New products are saved to Firestore." : "Changes update the Firestore document.")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="rounded-md border border-steel-300 px-5 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <ButtonSpinner label={uploadStatus || "Saving…"} />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {mode === "add" ? "Add Product" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
