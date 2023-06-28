import { type WUserAPIKey } from "@/lib/apiKeys.server";
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  flexRender,
  type Row,
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
import React, { useEffect, useState } from "react";
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
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles;
      return (
        <div className="flex flex-wrap gap-x-2">
          {roles.map((role) => {
            return (
              <Badge
                variant="secondary"
                key={role}
                className="max-w-[200px] overflow-hidden text-ellipsis block px-3 py-2 rounded-md text-center"
              >
                {role}
              </Badge>
            );
          })}
          {roles.length === 0
            ? "API key has no roles associated with it"
            : null}
        </div>
      );
    },
  },
  {
    id: "action",
    cell: function RotateKeyButton({ row }) {
      return (
        <div className="flex justify-end gap-x-4">
          <EditAPIKeyRoleDialog row={row} />
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Rotate API Key
              </Button>
            </DialogTrigger>
            <RotateAPIKeyDialog row={row} />
          </Dialog>
          <DeleteAPIKeyDialog row={row} />
        </div>
      );
    },
  },
];

function EditAPIKeyRoleDialog({ row }: { row: Row<WUserAPIKey> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentRoles = row.original.roles.join(",");
  const apiKeyId = row.original.id;

  const editRolesFetcher = useAdminFetcher();

  const isEditingRoles = editRolesFetcher.state === "submitting";

  useEffect(() => {
    if (isEditingRoles) {
      setIsDialogOpen(true);
      return;
    }
    setIsDialogOpen(false);
    return;
  }, [isEditingRoles]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={(v) => setIsDialogOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Roles</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Roles</DialogTitle>
          <DialogDescription>
            List down the roles of APIKey seperated by comma (whitespace will be
            ignored)
          </DialogDescription>
        </DialogHeader>
        <editRolesFetcher.Form className="flex flex-col gap-y-4" method="POST">
          <div className="flex flex-col gap-y-2">
            <input
              type="text"
              defaultValue={apiKeyId}
              hidden
              name="userAPIKeyId"
            />
            <Label htmlFor="newRoles">Roles</Label>
            <Input
              type="text"
              defaultValue={currentRoles}
              name="newRoles"
              id="newRoles"
            />
            <Button name="action" value="editRoles" type="submit">
              {isEditingRoles ? "Editing" : "Edit"}
            </Button>
          </div>
        </editRolesFetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

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
            variant="destructive"
          >
            {isRotatingKey ? "Rotating API Key..." : "Rotate API Key"}
          </Button>
        </rotateAPIKeyFetcher.Form>
      )}
    </DialogContent>
  );
}

function DeleteAPIKeyDialog({ row }: { row: Row<WUserAPIKey> }) {
  const deleteAPIKeyFetcher = useAdminFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isDeleting = deleteAPIKeyFetcher.state === "submitting";

  useEffect(() => {
    if (isDeleting) {
      setIsDialogOpen(true);
      return;
    }
    setIsDialogOpen(false);
    return;
  }, [isDeleting]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Once the API key is deleted. It cannot be used to make further
            requests.
          </DialogDescription>
          <deleteAPIKeyFetcher.Form method="POST">
            <input
              type="text"
              name="userAPIKeyId"
              defaultValue={row.original.id}
              hidden
            />
            <Button
              className="w-full"
              type="submit"
              name="action"
              value="deleteAPIKey"
              variant="destructive"
            >
              {isDeleting ? "Deleting API Key..." : "Delete API Key"}
            </Button>
          </deleteAPIKeyFetcher.Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
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
