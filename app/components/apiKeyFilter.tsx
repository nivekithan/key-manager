import { Form, useNavigate } from "@remix-run/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { type FormEvent, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import {
  type SearchItem,
  addSearchQuery,
  parseSearchQuery,
  removeSeachQuery,
} from "@/lib/search";

export function APIKeyFilter({
  filters,
}: {
  filters: Array<{ key: string; value: string }>;
}) {
  const [filterKey, setFilterKey] = useState("prefix");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const filterValue = inputRef.current?.value;

    if (!filterValue) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const searchQuery = parseSearchQuery(currentUrl);

    if (searchQuery === null) {
      navigate("/admin");
      return;
    }

    const newSearchItem: SearchItem = { key: filterKey, value: filterValue };

    const newSearchQuery = addSearchQuery(searchQuery, newSearchItem);

    currentUrl.searchParams.set("search", JSON.stringify(newSearchQuery));
    navigate(currentUrl.pathname + currentUrl.search);
    return;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Form className="flex gap-x-2" onSubmit={onSubmit}>
        <Select
          name="searchKey"
          onValueChange={(e) => setFilterKey(e)}
          value={filterKey}
        >
          <SelectTrigger className="w-auto">
            <SelectValue defaultValue="prefix" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prefix">Prefix</SelectItem>
            <SelectItem value="id">Id</SelectItem>
            <SelectItem value="apiKey">API key</SelectItem>
            <SelectItem value="roles">Roles</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          className="max-w-lg"
          placeholder="Search for key..."
          name="searchValue"
          ref={inputRef}
        />
        <Button className="px-6">Search</Button>
      </Form>
      <div className="flex gap-x-1 flex-wrap">
        {filters.map(({ key, value }) => {
          const onClick = () => {
            const currentUrl = new URL(window.location.href);
            const searchQuery = parseSearchQuery(currentUrl);

            if (searchQuery === null) {
              navigate("/admin");
              return;
            }

            const newSearchQuery = removeSeachQuery(searchQuery, {
              key,
              value,
            });

            currentUrl.searchParams.set(
              "search",
              JSON.stringify(newSearchQuery)
            );
            navigate(currentUrl.pathname + currentUrl.search);
            return;
          };
          return (
            <Badge variant="outline" key={key + value} className="flex gap-x-1">
              <p>{`${key}:${value}`}</p>
              <Button
                size="xsm"
                variant="ghost"
                type="button"
                onClick={onClick}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
