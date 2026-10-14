import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/utils";
import { getEnquiries } from "../services/enquiryService";
import type { Enquiry } from "../types/enquiry";

interface EnquiryState {
  enquiries: Enquiry[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useEnquiries(): EnquiryState {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getEnquiries()
      .then((result) => {
        if (active) setEnquiries(result);
      })
      .catch((caught) => {
        if (active) setError(getErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [version]);

  return { enquiries, loading, error, reload };
}
