import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/utils";
import { getCategories, getCategory } from "../services/categoryService";
import type { Category } from "../types/category";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function useAsync<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (active) setData(result);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { data, loading, error, reload };
}

export function useCategories(): AsyncState<Category[]> & { categories: Category[] } {
  const state = useAsync(getCategories, []);
  return { ...state, categories: state.data ?? [] };
}

export function useCategory(categoryId: string | undefined): AsyncState<Category | null> {
  return useAsync(() => getCategory(categoryId ?? ""), [categoryId]);
}
