import { type WUserAPIKey } from "@/lib/apiKeys.server";
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  flexRender,
  Row,
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
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { useAdminFetcher } from "@/routes/admin";

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
    cell: function RotateKeyButton({ row }) {
      return (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button">Rotate API Key</Button>
            </DialogTrigger>
            <RotateAPIKeyDialog row={row} />
          </Dialog>
        </div>
      );
    },
  },
];

function RotateAPIKeyDialog({ row }: { row: Row<WUserAPIKey> }) {
  const userAPIKeyId = row.original.id;
  const { toast } = useToast();
  const rotateAPIKeyFetcher = useAdminFetcher();
  const rotateAPIKeyActionData = rotateAPIKeyFetcher.data;

  const isRotatingKey = rotateAPIKeyFetcher.state === "submitting";

  const isNewAPiKeyGenerated =
    rotateAPIKeyActionData !== null &&
    rotateAPIKeyActionData?.success &&
    rotateAPIKeyActionData.action === "rotateAPIKey" &&
    rotateAPIKeyActionData.id === userAPIKeyId;

  const onCopyAPIKey = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isNewAPiKeyGenerated) {
      return;
    }
    navigator.clipboard.writeText(rotateAPIKeyActionData.apiKey);
    toast({ description: "Copied API key to clipboard" });
  };

  return (
    <DialogContent>
      {isNewAPiKeyGenerated ? (
        <DialogHeader>
          <DialogTitle>Copy API Key</DialogTitle>
          <DialogDescription>
            Make sure you have copied the api key and stored it safely. It will
            not be shown again
          </DialogDescription>
        </DialogHeader>
      ) : (
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Rotating API Key will generate new API key in place of old one. Old
            API key cannot be used to make further requests.
          </DialogDescription>
        </DialogHeader>
      )}
      {isNewAPiKeyGenerated ? (
        <div className="flex flex-col gap-y-4">
          <p className="px-1.5 py-2 border text-sm rounded-md">
            {rotateAPIKeyActionData.apiKey}
          </p>
          <Button type="button" className="w-full" onClick={onCopyAPIKey}>
            Copy API key
          </Button>
        </div>
      ) : (
        <rotateAPIKeyFetcher.Form method="POST" action="/admin">
          <input
            hidden
            type="text"
            name="userAPIKeyId"
            defaultValue={`${row.original.id}`}
          />
          <Button
            type="submit"
            className="w-full"
            name="action"
            value="rotateAPIKey"
          >
            {isRotatingKey ? "Rotating API Key..." : "Rotate API Key"}
          </Button>
        </rotateAPIKeyFetcher.Form>
      )}
    </DialogContent>
  );
}

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
