import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Form } from "@remix-run/react";

export function MoreActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreHorizontal size="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Generate new Root API Key</DropdownMenuItem>
        <Form action="/logout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start"
          >
            Logout
          </Button>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
