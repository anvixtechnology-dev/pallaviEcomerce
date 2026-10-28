import { Inbox, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableSkeleton } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useToast } from "../../components/Toast";
import { useSeo } from "../../hooks/useSeo";
import { useEnquiries } from "../../hooks/useEnquiries";
import { cn, formatTimestamp, getErrorMessage } from "../../lib/utils";
import { openWhatsAppChat } from "../../lib/whatsapp";
import { deleteEnquiry, updateEnquiryStatus } from "../../services/enquiryService";
import { ENQUIRY_STATUS_LABELS, type Enquiry, type EnquiryStatus } from "../../types/enquiry";

type Filter = EnquiryStatus | "all";

const TABS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "completed", label: "Completed" },
];

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function AdminEnquiries() {
  useSeo("Manage Enquiries | PallaviTraders Admin");

  const { enquiries, loading, error, reload } = useEnquiries();
  const { showToast } = useToast();
  const [items, setItems] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [target, setTarget] = useState<Enquiry | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setItems(enquiries);
  }, [enquiries]);

  const counts = useMemo(() => {
    const map: Record<Filter, number> = { all: items.length, new: 0, contacted: 0, completed: 0 };
    for (const enquiry of items) {
      map[enquiry.status] += 1;
    }
    return map;
  }, [items]);

  const visible = filter === "all" ? items : items.filter((enquiry) => enquiry.status === filter);

  const handleStatus = async (enquiry: Enquiry, status: EnquiryStatus) => {
    const previous = enquiry.status;
    setBusyId(enquiry.id);
    setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status } : item)));

    try {
      await updateEnquiryStatus(enquiry.id, status);
      showToast(`Status updated to "${ENQUIRY_STATUS_LABELS[status]}".`, "success");
    } catch (caught) {
      setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status: previous } : item)));
      showToast(getErrorMessage(caught), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setBusyId(target.id);

    try {
      await deleteEnquiry(target.id);
      setItems((current) => current.filter((item) => item.id !== target.id));
      showToast("Enquiry deleted.", "success");
      setTarget(null);
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Enquiries</h1>
          <p className="mt-1 text-sm text-steel-600">
            Customer enquiries submitted through the website contact form.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            aria-pressed={filter === tab.value}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition",
              filter === tab.value
                ? "border-navy-800 bg-navy-900 text-white"
                : "border-steel-300 bg-white text-steel-600 hover:border-navy-700 hover:text-navy-800",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                filter === tab.value ? "bg-white/15 text-white" : "bg-steel-100 text-steel-500",
              )}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : visible.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-steel-50 text-[11px] tracking-wider text-steel-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Quantity</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Message</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {visible.map((enquiry) => (
                  <tr key={enquiry.id} className="align-top transition hover:bg-steel-50/70">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-800">
                          {enquiry.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-steel-900">{enquiry.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <a href={`tel:${enquiry.phone}`} className="font-medium text-navy-700 hover:underline">
                        {enquiry.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-steel-700">{enquiry.productName || "—"}</td>
                    <td className="px-5 py-3.5 text-steel-600">{enquiry.quantity || "—"}</td>
                    <td className="max-w-64 px-5 py-3.5">
                      <span className="line-clamp-2 text-xs leading-relaxed text-steel-600" title={enquiry.message}>
                        {enquiry.message}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={enquiry.status}
                        onChange={(event) => handleStatus(enquiry, event.target.value as EnquiryStatus)}
                        disabled={busyId === enquiry.id}
                        aria-label={`Status for enquiry from ${enquiry.name}`}
                        className={cn(
                          "rounded-md border px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase focus:outline-none",
                          STATUS_STYLES[enquiry.status],
                          "focus:ring-2 focus:ring-navy-600/20",
                          busyId === enquiry.id && "opacity-60",
                        )}
                      >
                        {(Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]).map((status) => (
                          <option key={status} value={status} className="bg-white text-steel-800">
                            {ENQUIRY_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-steel-500">{formatTimestamp(enquiry.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsAppChat(
                              enquiry.phone,
                              `Hello ${enquiry.name}, this is PallaviTraders replying to your enquiry${
                                enquiry.productName ? ` for ${enquiry.productName}` : ""
                              }.`,
                            )
                          }
                          className="rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-whatsapp hover:text-whatsapp-dark"
                          title="Reply on WhatsApp"
                          aria-label={`Reply to ${enquiry.name} on WhatsApp`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTarget(enquiry)}
                          className="rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete enquiry"
                          aria-label={`Delete enquiry from ${enquiry.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title={filter === "all" ? "No enquiries yet" : `No ${ENQUIRY_STATUS_LABELS[filter as EnquiryStatus].toLowerCase()} enquiries`}
          description={
            filter === "all"
              ? "When customers submit the contact form on the website, their enquiries will appear here."
              : "Switch the filter above to view other enquiries."
          }
        >
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            View all enquiries
          </button>
        </EmptyState>
      )}

      {target ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-steel-950/70 backdrop-blur-sm"
            onClick={() => setTarget(null)}
            aria-label="Cancel"
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-steel-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-steel-900 uppercase">
              Are you sure you want to delete this enquiry?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-600">
              Enquiry from <span className="font-semibold text-steel-800">{target.name}</span> will be permanently
              removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTarget(null)}
                disabled={busyId === target.id}
                className="rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busyId === target.id}
                className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyId === target.id ? "Deleting…" : "Delete enquiry"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
