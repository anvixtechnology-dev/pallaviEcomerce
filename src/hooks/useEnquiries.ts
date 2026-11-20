import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/utils";
import { subscribeEnquiries } from "../services/enquiryService";
import type { Enquiry } from "../types/enquiry";

interface EnquiryState {
  enquiries: Enquiry[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Enquiries kept in sync with Firestore: new ones appear without a refresh. */
export function useEnquiries(): EnquiryState {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Restarts the listener, e.g. after an error.
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    return subscribeEnquiries(
      (result) => {
        setEnquiries(result);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(getErrorMessage(caught));
        setLoading(false);
      },
    );
  }, [version]);

  return { enquiries, loading, error, reload };
}
