import { FolderTree, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ButtonSpinner, CategoryGridSkeleton } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useToast } from "../../components/Toast";
import { useSeo } from "../../hooks/useSeo";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import { cn, getErrorMessage } from "../../lib/utils";
import { createCategory, deleteCategory, updateCategory } from "../../services/categoryService";
import { deleteCategoryImages, uploadCategoryImage } from "../../services/storageService";
import type { Category } from "../../types/category";

interface ModalState {
  mode: "add" | "edit";
  category: Category | null;
}

function CategoryModal({
  state,
  onClose,
  onSaved,
}: {
  state: ModalState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const editing = state.category;

  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(editing?.imageUrl ?? "");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description);
      setPreview(editing.imageUrl);
    }
  }, [editing]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/") || selected.size > 5 * 1024 * 1024) {
      showToast("Please select an image smaller than 5 MB.", "error");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length < 3) {
      setNameError("Category name must be at least 3 characters.");
      return;
    }

    setNameError("");
    setSaving(true);

    try {
      if (state.mode === "add") {
        const newId = await createCategory({ name: name.trim(), description: description.trim(), imageUrl: "" });

        if (file) {
          try {
            const imageUrl = await uploadCategoryImage(newId, file);
            await updateCategory(newId, { imageUrl });
          } catch (uploadError) {
            await deleteCategory(newId).catch(() => undefined);
            throw uploadError;
          }
        }

        showToast("Category created successfully.", "success");
      } else if (editing) {
        let imageUrl = editing.imageUrl;

        if (file) {
          imageUrl = await uploadCategoryImage(editing.id, file);
        }

        await updateCategory(editing.id, {
          name: name.trim(),
          description: description.trim(),
          imageUrl,
        });

        showToast("Category updated successfully.", "success");
      }

      onSaved();
      onClose();
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-steel-950/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-steel-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-steel-900 uppercase">
              {state.mode === "add" ? "Add Category" : "Edit Category"}
            </h2>
            <p className="mt-1 text-xs text-steel-500">Categories are stored in the Firestore “categories” collection.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-steel-400 transition hover:bg-steel-100 hover:text-steel-700"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="category-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError("");
              }}
              placeholder="e.g. MS Angles"
              className={cn(
                "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:ring-2 focus:outline-none",
                nameError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                  : "border-steel-300 focus:border-navy-600 focus:ring-navy-600/15",
              )}
            />
            {nameError ? <p className="mt-1 text-xs text-red-600">{nameError}</p> : null}
          </div>

          <div>
            <label htmlFor="category-description" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
              Description
            </label>
            <textarea
              id="category-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description shown on the category card…"
              className="w-full resize-y rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">Category Image</span>
            <div className="flex items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-steel-200 bg-steel-100">
                {preview ? (
                  <img src={preview} alt="Category preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[11px] text-steel-400">No image</span>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {preview ? "Replace" : "Upload"}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-steel-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <ButtonSpinner label="Saving…" /> : state.mode === "add" ? "Add Category" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCategories() {
  useSeo("Manage Categories | PallaviTraders Admin");

  const { categories, loading, error, reload } = useCategories();
  const { products } = useProducts();
  const { showToast } = useToast();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [target, setTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.categoryId, (map.get(product.categoryId) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);

    try {
      await deleteCategory(target.id);
      await deleteCategoryImages(target.id);
      showToast(`"${target.name}" has been deleted.`, "success");
      setTarget(null);
      reload();
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-steel-600">
            {categories.length} {categories.length === 1 ? "category" : "categories"} in the catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "add", category: null })}
          className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Category
        </button>
      </div>

      {loading ? (
        <CategoryGridSkeleton count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="flex gap-4 rounded-lg border border-steel-200 bg-white p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md border border-steel-200 bg-steel-100">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-steel-400">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="font-display text-lg leading-tight font-bold text-steel-900 uppercase">{category.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-steel-600">{category.description || "No description."}</p>
                <p className="mt-1 text-[11px] font-semibold tracking-wide text-navy-600 uppercase">
                  {counts.get(category.id) ?? 0} {(counts.get(category.id) ?? 0) === 1 ? "product" : "products"}
                </p>

                <div className="mt-auto flex gap-2 pt-3">
                  <Link
                    to={`/categories/${category.id}`}
                    className="rounded-md border border-steel-200 px-2.5 py-1.5 text-xs font-semibold text-steel-600 transition hover:border-navy-600 hover:text-navy-800"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", category })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-steel-200 px-2.5 py-1.5 text-xs font-semibold text-steel-600 transition hover:border-navy-600 hover:text-navy-800"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget(category)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-steel-200 px-2.5 py-1.5 text-xs font-semibold text-steel-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create your first category — e.g. TMT Bars, MS Angles or MS Plates."
        >
          <button
            type="button"
            onClick={() => setModal({ mode: "add", category: null })}
            className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Category
          </button>
        </EmptyState>
      )}

      {modal ? (
        <CategoryModal
          state={modal}
          onClose={() => setModal(null)}
          onSaved={() => reload()}
        />
      ) : null}

      {target ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-steel-950/70 backdrop-blur-sm"
            onClick={() => setTarget(null)}
            aria-label="Cancel"
          />
          <div className="relative w-full max-w-md rounded-xl border border-steel-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-steel-900 uppercase">
              Are you sure you want to delete this category?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-600">
              <span className="font-semibold text-steel-800">{target.name}</span> will be permanently removed.
              {counts.get(target.id) ? (
                <>
                  {" "}
                  <span className="font-semibold text-steel-800">{counts.get(target.id)}</span> linked product(s) will
                  remain in the catalogue without a category link.
                </>
              ) : null}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTarget(null)}
                disabled={deleting}
                className="rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? "Deleting…" : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
