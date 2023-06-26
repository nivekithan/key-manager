import { type WUserAPIKey } from "@/lib/apiKeys.server";
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Copy } from "./icons/copy";
import React from "react";
import { toast, useToast } from "./ui/use-toast";

const columns: ColumnDef<WUserAPIKey>[] = [
  {
    accessorKey: "prefix",
    header: "API Key",
    cell: ({ row }) => {
      const prefix = row.original.prefix;

      return <p>{`${prefix}...`}</p>;
    },
  },
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => {
      const id = row.original.id;

      function onCopyId(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        navigator.clipboard.writeText(id);
        toast({ description: "Copied id to clipboard" });
      }

      return (
        <div className="flex items-center gap-x-3">
          <p>{id}</p>
          <TooltipProvider delayDuration={500}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="xsm"
                  onClick={onCopyId}
                >
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy id</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button>Rotate API Key</Button>
        </div>
      );
    },
  },
];

export function UserAPIKeyDataTable({
  userAPIKeyList,
}: {
  userAPIKeyList: Array<WUserAPIKey>;
}) {
  const table = useReactTable({
    data: userAPIKeyList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="border rounded-md">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          );
        })}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No Results
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
