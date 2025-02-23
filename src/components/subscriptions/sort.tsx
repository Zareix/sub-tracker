import { useQueryState } from "nuqs";

export const SortButton = () => {
  const [sort, setSort] = useQueryState("sort");

  return <div>SortButton</div>;
};
