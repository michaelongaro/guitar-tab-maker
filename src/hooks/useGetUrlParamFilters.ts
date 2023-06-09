import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface IUrlParamFilters {
  genreId: number;
  type: "tabs" | "artists";
  searchQuery: string;
  sortByRelevance: boolean;
  additionalSortFilter:
    | "newest"
    | "oldest"
    | "leastLiked"
    | "mostLiked"
    | "none";
}

function useGetUrlParamFilters() {
  const { query, asPath } = useRouter();

  const [serve404Page, setServe404Page] = useState(false);
  const [urlParamFilters, setUrlParamFilters] = useState<IUrlParamFilters>({
    genreId: 9,
    type: "tabs",
    searchQuery: "",
    sortByRelevance: true,
    additionalSortFilter: "mostLiked",
  });

  useEffect(() => {
    // may need to extract this to a separate function and call it both here and in
    // [...filteredQuery] index.tsx
    if (Object.keys(query).length === 0) return;

    const { filteredQuery, ...queryObj } = query;

    const validQueryKeys = ["genreId", "type", "search", "relevance", "sort"];

    // check if any invalid query keys are present
    for (const key of Object.keys(queryObj)) {
      if (!validQueryKeys.includes(key)) {
        if (asPath.includes("/artist/") && key === "username") continue;
        setServe404Page(true);
        return;
      }
    }

    // check if any invalid query values are present
    // default values are not valid since they will never be organically
    // present in the url unless someone types them in. Not 100% sure if this
    // is a good idea.
    for (const [key, value] of Object.entries(queryObj)) {
      switch (key) {
        case "genreId":
          if (
            typeof value === "string" &&
            (isNaN(parseInt(value)) ||
              parseInt(value) < 1 ||
              parseInt(value) > 8)
          ) {
            setServe404Page(true);
            return;
          }
          break;
        case "type":
          if (typeof value === "string" && value !== "artists") {
            setServe404Page(true);
            return;
          }
          break;
        case "search":
          if (typeof value === "string" && value.length > 30) {
            setServe404Page(true);
            return;
          }
          break;
        case "relevance":
          if (typeof value === "string" && value !== "false") {
            setServe404Page(true);
            return;
          }
          break;
        case "sort":
          if (
            typeof value === "string" &&
            value !== "oldest" &&
            value !== "leastLiked" &&
            value !== "mostLiked" &&
            value !== "none"
          ) {
            setServe404Page(true);
            return;
          }
          break;
      }
    }

    // setting the urlParamFilters state (w/ defaults if necessary)
    setUrlParamFilters({
      genreId: query.genreId ? parseInt(query.genreId as string) : 9,
      type: query.type ? (query.type as "tabs" | "artists") : "tabs",
      searchQuery: query.search ? (query.search as string) : "",
      sortByRelevance: query.relevance
        ? (query.relevance as string) === "true"
        : true,
      additionalSortFilter: query.sort
        ? (query.sort as
            | "newest"
            | "oldest"
            | "leastLiked"
            | "mostLiked"
            | "none")
        : "newest",
    });
  }, [query, asPath]);

  return { serve404Page, ...urlParamFilters };
}

export default useGetUrlParamFilters;
