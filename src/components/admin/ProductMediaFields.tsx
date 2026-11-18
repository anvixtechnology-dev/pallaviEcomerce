import { ChevronLeft, ChevronRight, FileText, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useToast } from "../Toast";
import { getDocumentFileError, getImageFileError } from "../../services/storageService";
import { DOCUMENT_KIND_LABELS, type ProductDocument, type ProductDocumentKind } from "../../types/product";

/** A gallery image: either already uploaded (`url`) or waiting for save (`file`).
 * The first item is the main display image. */
export interface GalleryItem {
  id: string;
  preview: string;
  url?: string;
  file?: File;
}

export interface DocumentItem {
  id: string;
  kind: ProductDocumentKind;
  name: string;
  size: number;
  url?: string;
  file?: File;
}

let nextItemId = 0;
function itemId(): string {
  nextItemId += 1;
  return `item-${nextItemId}`;
}

export function galleryFromUrls(urls: string[]): GalleryItem[] {
  return urls.filter(Boolean).map((url) => ({ id: itemId(), preview: url, url }));
}

export function documentItemsFrom(documents: ProductDocument[]): DocumentItem[] {
  return documents.map((document) => ({ id: itemId(), ...document }));
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

const ICON_BUTTON = "rounded bg-steel-900/85 p-1 text-white transition hover:bg-navy-600 disabled:opacity-40";

export function ProductGalleryFields({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const { showToast } = useToast();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const main = items[0];
  const additional = items.slice(1);

  const readImages = (event: ChangeEvent<HTMLInputElement>): GalleryItem[] => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    const accepted: GalleryItem[] = [];
    for (const file of files) {
      const error = getImageFileError(file);
      if (error) showToast(error, "error");
      else accepted.push({ id: itemId(), file, preview: URL.createObjectURL(file) });
    }
    return accepted;
  };

  const replaceMain = (event: ChangeEvent<HTMLInputElement>) => {
    const [image] = readImages(event);
    if (image) onChange([image, ...additional]);
  };

  const addAdditional = (event: ChangeEvent<HTMLInputElement>) => {
    const images = readImages(event);
    if (images.length > 0) onChange([...items, ...images]);
  };

  const removeAt = (index: number) => onChange(items.filter((_, position) => position !== index));

  return (
    <>
      <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Main Image</h2>
        <p className="mt-1 text-xs text-steel-500">JPG, PNG or WebP up to 15 MB. Images are compressed on upload.</p>

        <div className="mt-4">
          {main ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-steel-200 bg-steel-100">
              <img src={main.preview} alt="Main product preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(0)}
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
            {main ? "Replace image" : "Upload image"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={replaceMain} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Additional Images</h2>
        <p className="mt-1 text-xs text-steel-500">
          Shown on the product page. Drag or use the arrows to reorder, and the star to set the main image.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {additional.map((item, position) => {
            const index = position + 1;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null && dragIndex !== index) onChange(moveItem(items, dragIndex, index));
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className="relative aspect-square cursor-move overflow-hidden rounded-md border border-steel-200 bg-steel-100"
              >
                <img src={item.preview} alt={`Additional image ${position + 1}`} className="h-full w-full object-cover" />
                {item.file ? (
                  <span className="absolute bottom-1 left-1 rounded bg-navy-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    New
                  </span>
                ) : null}
                <div className="absolute top-1 right-1 flex gap-1">
                  <button type="button" onClick={() => onChange(moveItem(items, index, 0))} className={ICON_BUTTON} aria-label="Set as main image" title="Set as main image">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => removeAt(index)} className="rounded bg-steel-900/85 p-1 text-white transition hover:bg-red-600" aria-label="Remove image" title="Remove image">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute right-1 bottom-1 flex gap-1">
                  <button type="button" disabled={index === 1} onClick={() => onChange(moveItem(items, index, index - 1))} className={ICON_BUTTON} aria-label="Move image earlier">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" disabled={index === items.length - 1} onClick={() => onChange(moveItem(items, index, index + 1))} className={ICON_BUTTON} aria-label="Move image later">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-steel-300 bg-steel-50 text-steel-500 transition hover:border-navy-600 hover:text-navy-800">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px] font-semibold">Add images</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={addAdditional} />
          </label>
        </div>
      </section>
    </>
  );
}

const DOCUMENT_SLOTS: Array<{ kind: ProductDocumentKind; multiple: boolean }> = [
  { kind: "specification", multiple: false },
  { kind: "catalogue", multiple: false },
  { kind: "technical", multiple: true },
];

export function ProductDocumentFields({
  items,
  onChange,
}: {
  items: DocumentItem[];
  onChange: (items: DocumentItem[]) => void;
}) {
  const { showToast } = useToast();

  const handleFiles = (event: ChangeEvent<HTMLInputElement>, kind: ProductDocumentKind, multiple: boolean) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    const accepted: DocumentItem[] = [];
    for (const file of files) {
      const error = getDocumentFileError(file);
      if (error) showToast(error, "error");
      else accepted.push({ id: itemId(), kind, name: file.name, size: file.size, file });
    }
    if (accepted.length === 0) return;

    onChange([...(multiple ? items : items.filter((item) => item.kind !== kind)), ...accepted]);
  };

  return (
    <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Documents</h2>
      <p className="mt-1 text-xs text-steel-500">PDF files up to 20 MB, available to download on the product page.</p>

      <div className="mt-4 space-y-4">
        {DOCUMENT_SLOTS.map(({ kind, multiple }) => (
          <div key={kind}>
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-steel-600 uppercase">
              {DOCUMENT_KIND_LABELS[kind]}
              {multiple ? "s" : ""}
            </p>
            <ul className="space-y-1.5">
              {items
                .filter((item) => item.kind === kind)
                .map((item) => (
                  <li key={item.id} className="flex items-center gap-2 rounded-md border border-steel-200 bg-steel-50 px-3 py-2 text-xs text-steel-700">
                    <FileText className="h-4 w-4 shrink-0 text-steel-500" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((other) => other.id !== item.id))}
                      className="rounded p-1 text-steel-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
            </ul>
            <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-md border border-steel-300 bg-white px-3 py-2 text-xs font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900">
              <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              Upload PDF
              <input type="file" accept="application/pdf" multiple={multiple} className="sr-only" onChange={(event) => handleFiles(event, kind, multiple)} />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
