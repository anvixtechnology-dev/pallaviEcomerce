import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../lib/utils";
import { getFeaturedProducts, getProduct, getProducts, getProductsByCategory } from "../services/productService";
import type { Product } from "../types/product";

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

export function useProducts(): AsyncState<Product[]> & { products: Product[] } {
  const state = useAsync(getProducts, []);
  return { ...state, products: state.data ?? [] };
}

export function useFeaturedProducts(limit = 8): AsyncState<Product[]> & { products: Product[] } {
  const state = useAsync(() => getFeaturedProducts(limit), [limit]);
  return { ...state, products: state.data ?? [] };
}

export function useProduct(productId: string | undefined): AsyncState<Product | null> {
  return useAsync(() => getProduct(productId ?? ""), [productId]);
}

export function useProductsByCategory(categoryId: string | undefined): AsyncState<Product[]> & {
  products: Product[];
} {
  const state = useAsync(() => getProductsByCategory(categoryId ?? ""), [categoryId]);
  return { ...state, products: state.data ?? [] };
}
