import { useState } from "react";

export function useSortFilter() {
  const [sortCriteria, setSortCriteria] = useState("subject");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [filterOptions, setFilterOptions] = useState([
    "fall",
    "spring",
    "summer",
  ]);
  return {
    sortCriteria,
    sortDirection,
    filter,
    tagFilter,
    filterOptions,
    fields: {
      sortCriteria,
      setSortCriteria,
      sortDirection,
      setSortDirection,
      filter,
      setFilter,
      tagFilter,
      setTagFilter,
      filterOptions,
      setFilterOptions,
    },
  };
}
