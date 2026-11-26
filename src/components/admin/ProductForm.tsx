import { ArrowLeft, CheckCircle2, Eye, FileEdit, Plus, RefreshCw, Save, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ButtonSpinner } from "../Loading";
import ProductDetailsView from "../ProductDetailsView";
import { useToast } from "../Toast";
import { useCategories } from "../../hooks/useCategories";
import {
  emptyFormValues,
  formValuesToInput,
  productToFormValues,
  type ProductFormValues,
} from "../../lib/productForm";
import { computeDiscountedPrice } from "../../lib/productPricing";
import { defaultPipeMaterial, SPEC_TEMPLATES, type SpecField } from "../../lib/productSpecs";
import { validateProduct, type ProductErrors } from "../../lib/productValidation";
import { cn, getErrorMessage, slugify, UserFacingError } from "../../lib/utils";
import { DEFAULT_GST_RATES, getGstRates } from "../../services/catalogSetupService";
import {
  createProduct,
  generateSku,
  isSkuTaken,
  newProductId,
  resolveUniqueSlug,
  updateProduct,
} from "../../services/productService";
import {
  compressImage,
  deleteStorageFileByUrl,
  uploadProductDocument,
  uploadProductImage,
} from "../../services/storageService";
import {
  AVAILABILITY_LABELS,
  DISCOUNT_TYPE_LABELS,
  PRICING_MODE_LABELS,
  PRICING_UNIT_LABELS,
  PRODUCT_STATUS_LABELS,
  type Availability,
  type DiscountType,
  type PricingMode,
  type PricingUnit,
  type Product,
  type ProductDocument,
  type ProductInput,
  type ProductStatus,
} from "../../types/product";
import {
  documentItemsFrom,
  galleryFromUrls,
  ProductDocumentFields,
  ProductGalleryFields,
  type DocumentItem,
  type GalleryItem,
} from "./ProductMediaFields";

interface ProductFormProps {
  mode: "add" | "edit";
  product?: Product;
  productId?: string;
}

type SaveAction = "draft" | "publish" | "keep-status";

function fieldClasses(error?: string): string {
  return cn(
    "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:ring-2 focus:outline-none read-only:bg-steel-50",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-steel-300 focus:border-brand-orange focus:ring-brand-orange/15",
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

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: string }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-steel-200 bg-steel-50 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-steel-300 text-brand-orange-dark focus:ring-brand-orange/30"
      />
      <span className="flex items-center gap-2 text-sm font-medium text-steel-700">
        <Star className={cn("h-4 w-4", checked ? "fill-amber-400 text-amber-400" : "text-steel-400")} aria-hidden="true" />
        {children}
      </span>
    </label>
  );
}

const SECTION = "rounded-lg border border-steel-200 bg-white p-5 sm:p-6";
const SECTION_TITLE = "font-display text-lg font-bold text-steel-900 uppercase";
const SECONDARY_BUTTON =
  "inline-flex items-center gap-2 rounded-md border border-steel-300 px-5 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50 disabled:cursor-not-allowed disabled:opacity-70";

export default function ProductForm({ mode, product, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { categories } = useCategories();

  const [values, setValues] = useState<ProductFormValues>(() => (product ? productToFormValues(product) : emptyFormValues()));
  const [errors, setErrors] = useState<ProductErrors>({});
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    product ? galleryFromUrls([product.imageUrl, ...product.additionalImages]) : [],
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(() => (product ? documentItemsFrom(product.documents) : []));
  const [gstRates, setGstRates] = useState<number[]>(DEFAULT_GST_RATES);
  const [skuEdited, setSkuEdited] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const selectedCategory = categories.find((category) => category.id === values.categoryId);
  const specTemplate = selectedCategory?.specTemplate ?? product?.specTemplate ?? "custom";
  const specFields = SPEC_TEMPLATES[specTemplate].fields;

  useEffect(() => {
    getGstRates()
      .then(setGstRates)
      .catch(() => undefined); // The default rates still work.
  }, []);

  // A new product gets a generated SKU, which follows its category until edited.
  useEffect(() => {
    if (!skuEdited) {
      setValues((current) => ({ ...current, sku: generateSku(selectedCategory?.name ?? "") }));
    }
  }, [skuEdited, selectedCategory?.name]);

  const gstOptions = useMemo(() => {
    const current = Number(values.gstRate);
    const rates = Number.isFinite(current) && !gstRates.includes(current) ? [...gstRates, current] : gstRates;
    return [...rates].sort((a, b) => a - b);
  }, [gstRates, values.gstRate]);

  const set = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const update = (field: keyof ProductFormValues) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    set(field, event.target.value as never);
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    setValues((current) => {
      const material = category?.specTemplate === "pipes" ? defaultPipeMaterial(category.name) : "";
      return {
        ...current,
        categoryId,
        subcategory: "",
        categorySpecs: material ? { ...current.categorySpecs, material } : current.categorySpecs,
      };
    });
    setErrors((current) => ({ ...current, categoryId: undefined }));
  };

  const specValue = (field: SpecField): string => {
    if (field.linkedTo) return values[field.linkedTo];
    return values.categorySpecs[field.key] ?? "";
  };

  const setSpecValue = (field: SpecField, value: string) => {
    if (field.linkedTo) {
      set(field.linkedTo, value);
      return;
    }
    set("categorySpecs", { ...values.categorySpecs, [field.key]: value });
  };

  const setCustomSpec = (index: number, key: "name" | "value", value: string) => {
    set(
      "customSpecs",
      values.customSpecs.map((spec, position) => (position === index ? { ...spec, [key]: value } : spec)),
    );
  };

  const computedSellingPrice =
    values.discountType === "none"
      ? values.sellingPrice
      : String(computeDiscountedPrice(Number(values.mrp) || 0, values.discountType, Number(values.discountValue) || 0));

  // Until categories load (or if the category was deleted), keep what the product already stores.
  const categoryForSave =
    selectedCategory ??
    (product && product.categoryId === values.categoryId
      ? { name: product.categoryName, specTemplate: product.specTemplate }
      : undefined);

  const buildInput = (status: ProductStatus): ProductInput =>
    formValuesToInput(values, categoryForSave, status, specTemplate);

  const previewProduct: Product = {
    ...buildInput(values.status),
    id: productId ?? "preview",
    imageUrl: gallery[0]?.preview ?? "",
    additionalImages: gallery.slice(1).map((item) => item.preview),
    documents: documents.filter((item) => item.url).map(toStoredDocument),
  };

  /** Uploads new files, reporting overall progress. Returns the uploaded URLs by
   * item id, plus every URL uploaded so a failed save can remove them again. */
  const uploadPendingFiles = async (id: string, uploaded: string[]) => {
    const pendingImages = gallery.filter((item) => item.file);
    const pendingDocuments = documents.filter((item) => item.file);
    const urlById = new Map<string, string>();
    if (pendingImages.length + pendingDocuments.length === 0) return urlById;

    setUploadStatus("Compressing images…");
    const images = await Promise.all(pendingImages.map(async (item) => compressImage(item.file as File)));

    const total =
      images.reduce((sum, image) => sum + image.size, 0) +
      pendingDocuments.reduce((sum, item) => sum + item.size, 0);
    let completed = 0;
    const count = images.length + pendingDocuments.length;
    let position = 0;

    const track = (size: number, upload: (onProgress: (bytes: number) => void) => Promise<string>) => {
      position += 1;
      setUploadStatus(`Uploading file ${position} of ${count}…`);
      return upload((bytes) => setUploadPercent(Math.round(((completed + bytes) / total) * 100))).then((url) => {
        completed += size;
        uploaded.push(url);
        return url;
      });
    };

    setUploadPercent(0);
    for (let index = 0; index < images.length; index += 1) {
      const url = await track(images[index].size, (onProgress) => uploadProductImage(id, images[index], onProgress));
      urlById.set(pendingImages[index].id, url);
    }
    for (const item of pendingDocuments) {
      const url = await track(item.size, (onProgress) => uploadProductDocument(id, item.file as File, item.kind, onProgress));
      urlById.set(item.id, url);
    }
    setUploadPercent(null);

    return urlById;
  };

  const save = async (action: SaveAction) => {
    const status: ProductStatus = action === "draft" ? "draft" : action === "publish" ? "active" : values.status;
    const input = buildInput(status);
    const validation = validateProduct(input, status === "active" ? "publish" : "draft");

    if (Object.values(validation).some(Boolean)) {
      setErrors(validation);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    const uploaded: string[] = [];

    try {
      setUploadStatus("Checking SKU…");
      if (await isSkuTaken(input.sku, productId)) {
        setErrors({ sku: "Another product already uses this SKU." });
        throw new UserFacingError("Another product already uses this SKU.");
      }
      const slug = await resolveUniqueSlug(input.slug, productId);

      const id = productId ?? newProductId();
      const urlById = await uploadPendingFiles(id, uploaded);

      const imageUrls = gallery.map((item) => item.url ?? urlById.get(item.id) ?? "");
      const storedDocuments: ProductDocument[] = documents.map((item) =>
        toStoredDocument({ ...item, url: item.url ?? urlById.get(item.id) ?? "" }),
      );
      const record: ProductInput = {
        ...input,
        slug,
        imageUrl: imageUrls[0] ?? "",
        additionalImages: imageUrls.slice(1),
        documents: storedDocuments,
      };

      setUploadStatus("Saving product…");
      if (mode === "add") await createProduct(id, record);
      else await updateProduct(id, record);

      // The record no longer points at these, so they can be removed now.
      if (product) {
        const kept = new Set([...imageUrls, ...storedDocuments.map((item) => item.url)]);
        const previous = [product.imageUrl, ...product.additionalImages, ...product.documents.map((item) => item.url)];
        await Promise.all(previous.filter((url) => url && !kept.has(url)).map(deleteStorageFileByUrl));
      }

      showToast(status === "active" ? "Product published successfully." : "Product saved successfully.", "success");
      navigate("/admin/products");
    } catch (caught) {
      await Promise.all(uploaded.map(deleteStorageFileByUrl));
      showToast(getErrorMessage(caught), "error");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
      setUploadPercent(null);
    }
  };

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h1>
          <p className="mt-1 text-sm text-steel-600">
            Drafts stay hidden from customers until the product is published.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2 text-sm font-semibold text-steel-700 transition hover:border-brand-orange hover:text-brand-orange-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to products
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Details */}
        <div className="min-w-0 space-y-6">
          <section className={SECTION}>
            <h2 className={SECTION_TITLE}>Basic Information</h2>

            <div className="mt-4 space-y-4">
              <div>
                <FieldLabel htmlFor="product-name" required>Product Name</FieldLabel>
                <input id="product-name" type="text" value={values.name} onChange={update("name")} placeholder="e.g. G.I. Round Pipe 1 inch" className={fieldClasses(errors.name)} />
                <FieldError message={errors.name} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-category" required>Product Category</FieldLabel>
                  <select id="product-category" value={values.categoryId} onChange={(event) => handleCategoryChange(event.target.value)} className={fieldClasses(errors.categoryId)}>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <FieldError message={errors.categoryId} />
                </div>

                <div>
                  <FieldLabel htmlFor="product-subcategory">Subcategory</FieldLabel>
                  <select
                    id="product-subcategory"
                    value={values.subcategory}
                    onChange={update("subcategory")}
                    disabled={!selectedCategory?.subcategories.length}
                    className={cn(fieldClasses(), "disabled:bg-steel-50 disabled:text-steel-400")}
                  >
                    <option value="">{selectedCategory?.subcategories.length ? "Select a subcategory" : "None available"}</option>
                    {selectedCategory?.subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-brand">Brand</FieldLabel>
                  <input id="product-brand" type="text" value={values.brand} onChange={update("brand")} placeholder="e.g. Tata" className={fieldClasses()} />
                </div>

                <div>
                  <FieldLabel htmlFor="product-sku" required>SKU / Product Code</FieldLabel>
                  <div className="flex gap-2">
                    <input
                      id="product-sku"
                      type="text"
                      value={values.sku}
                      onChange={(event) => {
                        setSkuEdited(true);
                        set("sku", event.target.value.toUpperCase());
                      }}
                      className={cn(fieldClasses(errors.sku), "min-w-0")}
                    />
                    <button
                      type="button"
                      onClick={() => set("sku", generateSku(selectedCategory?.name ?? ""))}
                      className="shrink-0 rounded-md border border-steel-300 px-3 text-steel-600 transition hover:border-brand-orange hover:text-brand-orange-dark"
                      title="Generate a new SKU"
                      aria-label="Generate a new SKU"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <FieldError message={errors.sku} />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="product-short-description">Short Description</FieldLabel>
                <textarea id="product-short-description" rows={2} value={values.shortDescription} onChange={update("shortDescription")} placeholder="Shown on the product card…" className={cn(fieldClasses(errors.shortDescription), "resize-y")} />
                <FieldError message={errors.shortDescription} />
              </div>

              <div>
                <FieldLabel htmlFor="product-description">Full Description</FieldLabel>
                <textarea id="product-description" rows={5} value={values.description} onChange={update("description")} placeholder="Shown on the product details page…" className={cn(fieldClasses(errors.description), "resize-y")} />
                <FieldError message={errors.description} />
              </div>

              <div className="sm:w-1/2 sm:pr-2">
                <FieldLabel htmlFor="product-status">Product Status</FieldLabel>
                <select id="product-status" value={values.status} onChange={update("status")} className={fieldClasses()}>
                  {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((key) => (
                    <option key={key} value={key}>{PRODUCT_STATUS_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Toggle checked={values.featured} onChange={(checked) => set("featured", checked)}>Featured Product</Toggle>
                <Toggle checked={values.newArrival} onChange={(checked) => set("newArrival", checked)}>New Arrival</Toggle>
                <Toggle checked={values.bestSeller} onChange={(checked) => set("bestSeller", checked)}>Best Seller</Toggle>
              </div>
            </div>
          </section>

          <section className={SECTION}>
            <h2 className={SECTION_TITLE}>Specifications</h2>
            {!selectedCategory ? (
              <p className="mt-1 text-xs text-steel-500">Select a category to see its specification fields.</p>
            ) : null}

            <div className="mt-4 space-y-4">
              {specFields.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {specFields.map((field) => {
                    const id = `spec-${field.key}`;
                    const label = field.unit ? `${field.label} (${field.unit})` : field.label;
                    const value = specValue(field);
                    return (
                      <div key={field.key}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        {field.input === "select" ? (
                          <select id={id} value={value} onChange={(event) => setSpecValue(field, event.target.value)} className={fieldClasses()}>
                            <option value="">Select</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <input
                              id={id}
                              type={field.input === "number" ? "number" : "text"}
                              min={field.input === "number" ? 0 : undefined}
                              step="any"
                              list={field.input === "combo" ? `${id}-options` : undefined}
                              value={value}
                              onChange={(event) => setSpecValue(field, event.target.value)}
                              placeholder={field.input === "combo" ? "Select or type a size" : undefined}
                              className={fieldClasses()}
                            />
                            {field.input === "combo" ? (
                              <datalist id={`${id}-options`}>
                                {field.options?.map((option) => <option key={option} value={option} />)}
                              </datalist>
                            ) : null}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-steel-600 uppercase">Custom Specifications</p>
                <div className="space-y-2">
                  {values.customSpecs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={spec.name} onChange={(event) => setCustomSpec(index, "name", event.target.value)} placeholder="Specification name" aria-label="Specification name" className={cn(fieldClasses(), "min-w-0")} />
                      <input type="text" value={spec.value} onChange={(event) => setCustomSpec(index, "value", event.target.value)} placeholder="Specification value" aria-label="Specification value" className={cn(fieldClasses(), "min-w-0")} />
                      <button
                        type="button"
                        onClick={() => set("customSpecs", values.customSpecs.filter((_, position) => position !== index))}
                        className="shrink-0 rounded-md border border-steel-300 px-3 text-steel-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove specification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <FieldError message={errors.customSpecs} />
                <button
                  type="button"
                  onClick={() => set("customSpecs", [...values.customSpecs, { name: "", value: "" }])}
                  className="mt-2 inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-3 py-2 text-xs font-semibold text-steel-700 transition hover:border-brand-orange hover:text-brand-orange-dark"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add Specification
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-specifications">Additional Specifications</FieldLabel>
                  <textarea id="product-specifications" rows={3} value={values.specifications} onChange={update("specifications")} placeholder="Grade, standards, finish, tolerances…" className={cn(fieldClasses(), "resize-y")} />
                </div>
                <div>
                  <FieldLabel htmlFor="product-applications">Applications</FieldLabel>
                  <textarea id="product-applications" rows={3} value={values.applications} onChange={update("applications")} placeholder="Where this product is used…" className={cn(fieldClasses(), "resize-y")} />
                </div>
              </div>
            </div>
          </section>

          <section className={SECTION}>
            <h2 className={SECTION_TITLE}>Pricing</h2>
            <p className="mt-1 text-xs text-steel-500">Enter the selling price excluding GST. GST is stored separately and added once on the order total.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="product-pricing-mode">Price Display Mode</FieldLabel>
                <select id="product-pricing-mode" value={values.pricingMode} onChange={(event) => set("pricingMode", event.target.value as PricingMode)} className={fieldClasses()}>
                  {(Object.keys(PRICING_MODE_LABELS) as PricingMode[]).map((key) => (
                    <option key={key} value={key}>{PRICING_MODE_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="product-pricing-unit">Pricing Unit</FieldLabel>
                <select id="product-pricing-unit" value={values.pricingUnit} onChange={(event) => set("pricingUnit", event.target.value as PricingUnit)} className={fieldClasses()}>
                  {(Object.keys(PRICING_UNIT_LABELS) as PricingUnit[]).map((key) => (
                    <option key={key} value={key}>{PRICING_UNIT_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="product-mrp">MRP (₹)</FieldLabel>
                <input id="product-mrp" type="number" min={0} step="any" value={values.mrp} onChange={update("mrp")} className={fieldClasses(errors.mrp)} />
                <FieldError message={errors.mrp} />
              </div>

              <div>
                <FieldLabel htmlFor="product-discount-type">Discount Type</FieldLabel>
                <select id="product-discount-type" value={values.discountType} onChange={(event) => set("discountType", event.target.value as DiscountType)} className={fieldClasses()}>
                  {(Object.keys(DISCOUNT_TYPE_LABELS) as DiscountType[]).map((key) => (
                    <option key={key} value={key}>{DISCOUNT_TYPE_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="product-discount-value">Discount Value</FieldLabel>
                <input id="product-discount-value" type="number" min={0} step="any" disabled={values.discountType === "none"} value={values.discountType === "none" ? "" : values.discountValue} onChange={update("discountValue")} className={cn(fieldClasses(errors.discountValue), "disabled:bg-steel-50")} />
                <FieldError message={errors.discountValue} />
              </div>

              <div>
                <FieldLabel htmlFor="product-selling-price">Selling Price (₹)</FieldLabel>
                <input id="product-selling-price" type="number" min={0} step="any" readOnly={values.discountType !== "none"} value={computedSellingPrice} onChange={update("sellingPrice")} className={fieldClasses(errors.sellingPrice)} />
                <FieldError message={errors.sellingPrice} />
              </div>

              <div>
                <FieldLabel htmlFor="product-moq">Minimum Order Quantity</FieldLabel>
                <input id="product-moq" type="number" min={0} step="any" value={values.minOrderQuantity} onChange={update("minOrderQuantity")} className={fieldClasses(errors.minOrderQuantity)} />
                <FieldError message={errors.minOrderQuantity} />
              </div>

              <div>
                <FieldLabel htmlFor="product-gst">GST Rate</FieldLabel>
                <select id="product-gst" value={values.gstRate} onChange={update("gstRate")} className={fieldClasses(errors.gstRate)}>
                  {gstOptions.map((rate) => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
                <FieldError message={errors.gstRate} />
              </div>
            </div>
          </section>

          <section className={SECTION}>
            <h2 className={SECTION_TITLE}>Inventory &amp; Availability</h2>

            <div className="mt-4 space-y-4">
              <Toggle checked={values.trackInventory} onChange={(checked) => set("trackInventory", checked)}>Track Inventory</Toggle>

              <div className="grid gap-4 sm:grid-cols-2">
                {values.trackInventory ? (
                  <>
                    <div>
                      <FieldLabel htmlFor="product-quantity">Available Quantity</FieldLabel>
                      <input id="product-quantity" type="number" min={0} step="any" value={values.availableQuantity} onChange={update("availableQuantity")} className={fieldClasses(errors.availableQuantity)} />
                      <FieldError message={errors.availableQuantity} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="product-inventory-unit">Unit of Measurement</FieldLabel>
                      <select id="product-inventory-unit" value={values.inventoryUnit} onChange={(event) => set("inventoryUnit", event.target.value as PricingUnit)} className={fieldClasses()}>
                        {(Object.keys(PRICING_UNIT_LABELS) as PricingUnit[]).map((key) => (
                          <option key={key} value={key}>{PRICING_UNIT_LABELS[key]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel htmlFor="product-threshold">Low Stock Threshold</FieldLabel>
                      <input id="product-threshold" type="number" min={0} step="any" value={values.lowStockThreshold} onChange={update("lowStockThreshold")} className={fieldClasses(errors.lowStockThreshold)} />
                      <FieldError message={errors.lowStockThreshold} />
                    </div>
                  </>
                ) : (
                  <div>
                    <FieldLabel htmlFor="product-availability">Stock Status</FieldLabel>
                    <select id="product-availability" value={values.availability} onChange={(event) => set("availability", event.target.value as Availability)} className={fieldClasses()}>
                      {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((key) => (
                        <option key={key} value={key}>{AVAILABILITY_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <FieldLabel htmlFor="product-warehouse">Warehouse / Location</FieldLabel>
                  <input id="product-warehouse" type="text" value={values.warehouseLocation} onChange={update("warehouseLocation")} className={fieldClasses()} />
                </div>
              </div>

              <Toggle checked={values.allowBackorders} onChange={(checked) => set("allowBackorders", checked)}>Allow Backorders</Toggle>
            </div>
          </section>

          <section className={SECTION}>
            <h2 className={SECTION_TITLE}>SEO &amp; Visibility</h2>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="product-seo-title">SEO Title</FieldLabel>
                  <input id="product-seo-title" type="text" value={values.seoTitle} onChange={update("seoTitle")} placeholder={values.name} className={fieldClasses()} />
                </div>
                <div>
                  <FieldLabel htmlFor="product-slug">URL Slug</FieldLabel>
                  <input
                    id="product-slug"
                    type="text"
                    value={values.slug}
                    onChange={(event) => set("slug", event.target.value)}
                    onBlur={() => set("slug", slugify(values.slug))}
                    placeholder={slugify(values.name) || "generated-from-product-name"}
                    className={fieldClasses(errors.slug)}
                  />
                  <FieldError message={errors.slug} />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="product-seo-description">SEO Description</FieldLabel>
                <textarea id="product-seo-description" rows={2} value={values.seoDescription} onChange={update("seoDescription")} className={cn(fieldClasses(), "resize-y")} />
              </div>

              <div>
                <FieldLabel htmlFor="product-keywords">Search Keywords</FieldLabel>
                <input id="product-keywords" type="text" value={values.searchKeywords} onChange={update("searchKeywords")} placeholder="Separate keywords with commas" className={fieldClasses()} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle checked={values.showOnHomepage} onChange={(checked) => set("showOnHomepage", checked)}>Homepage Visibility (when featured)</Toggle>
                <Toggle checked={values.showOnCategoryPage} onChange={(checked) => set("showOnCategoryPage", checked)}>Category Page Visibility</Toggle>
              </div>
            </div>
          </section>
        </div>

        {/* Media */}
        <div className="min-w-0 space-y-6">
          <ProductGalleryFields items={gallery} onChange={setGallery} />
          <ProductDocumentFields items={documents} onChange={setDocuments} />
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-steel-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <p className="text-xs text-steel-500" role="status">
            {uploadStatus || (mode === "add" ? "New products are saved to Firestore." : "Changes update the Firestore document.")}
          </p>
          {uploadPercent !== null ? (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-steel-100" role="progressbar" aria-valuenow={uploadPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand-orange transition-all" style={{ width: `${uploadPercent}%` }} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className={SECONDARY_BUTTON}>Cancel</Link>
          <button type="button" onClick={() => setPreviewing(true)} disabled={submitting} className={SECONDARY_BUTTON}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview Product
          </button>
          <button type="button" onClick={() => save("draft")} disabled={submitting} className={SECONDARY_BUTTON}>
            <FileEdit className="h-4 w-4" aria-hidden="true" />
            Save as Draft
          </button>
          {mode === "edit" || values.status === "inactive" ? (
            <button type="button" onClick={() => save("keep-status")} disabled={submitting} className={SECONDARY_BUTTON}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save as {PRODUCT_STATUS_LABELS[values.status]}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => save("publish")}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <ButtonSpinner label={uploadStatus || "Saving…"} />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Publish Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      {previewing ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-white" role="dialog" aria-modal="true" aria-label="Product preview">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-steel-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-sm font-semibold text-steel-800">Preview — how customers will see this product. Not saved yet.</p>
            <button type="button" onClick={() => setPreviewing(false)} className={SECONDARY_BUTTON}>
              <X className="h-4 w-4" aria-hidden="true" />
              Close preview
            </button>
          </div>
          <ProductDetailsView product={previewProduct} preview />
        </div>
      ) : null}
    </form>
  );
}

function toStoredDocument(item: DocumentItem): ProductDocument {
  return { kind: item.kind, name: item.name, url: item.url ?? "", size: item.size };
}
