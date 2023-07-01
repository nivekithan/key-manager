import { z } from "zod";

const SearchItemSchema = z.object({
  key: z.string().trim().nonempty(),
  value: z.string().trim().nonempty(),
});
export type SearchItem = z.infer<typeof SearchItemSchema>;

export const SearchQuerySchema = z.array(SearchItemSchema);
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export function parseSearchQuery(url: URL): SearchQuery | null {
  const searchQuery = url.searchParams.get("search");

  if (searchQuery === null) {
    return [];
  }

  const parsedSearchQuery = (() => {
    try {
      return JSON.parse(searchQuery) as unknown;
    } catch (err) {
      return null;
    }
  })();

  const validateSearchQuery = SearchQuerySchema.safeParse(parsedSearchQuery);

  if (!validateSearchQuery.success) {
    return null;
  }

  return validateSearchQuery.data;
}

export function removeSeachQuery(
  query: SearchQuery,
  { key, value }: SearchItem
) {
  const newQuery = query.filter((k) => k.key !== key || k.value !== value);

  return newQuery;
}

export function addSearchQuery(query: SearchQuery, { key, value }: SearchItem) {
  const duplicatedItem = query.find((v) => v.key === key && v.value === value);

  if (duplicatedItem) {
    return query;
  }

  const newQuery = [...query];
  newQuery.push({ key, value });

  return newQuery;
}
