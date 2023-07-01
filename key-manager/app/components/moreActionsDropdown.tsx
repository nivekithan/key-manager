import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Form } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAdminFetcher } from "@/routes/admin";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";

export function MoreActionsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [considerGeneartedAPIKey, setConsiderGeneratedAPIKey] = useState(true);

  const newRootAPIKeyFetcher = useAdminFetcher();

  const isGeneratingNewAPIKey = newRootAPIKeyFetcher.state === "submitting";
  const rootAPIKeyGenerated =
    considerGeneartedAPIKey &&
    newRootAPIKeyFetcher.data &&
    newRootAPIKeyFetcher.data.success &&
    newRootAPIKeyFetcher.data.action === "generateAPIKey"
      ? newRootAPIKeyFetcher.data.apiKey
      : null;

  useEffect(() => {
    if (isGeneratingNewAPIKey) {
      return;
    }
    setConsiderGeneratedAPIKey(true);
  }, [isGeneratingNewAPIKey]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        setIsOpen(newOpen);

        if (newOpen === false && rootAPIKeyGenerated !== null) {
          setConsiderGeneratedAPIKey(false);
          return;
        }
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal size="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              type="submit"
            >
              New Root API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {rootAPIKeyGenerated ? "Copy Root API Key" : "New Root API Key"}
              </DialogTitle>
              <DialogDescription>
                {rootAPIKeyGenerated
                  ? "Copy Root API Key and store it safely. It will not be shown again."
                  : "It will regenerate root API Key which is used to authenticate all requests coming to our service from your app."}
              </DialogDescription>
              {rootAPIKeyGenerated ? (
                <div className="flex flex-col gap-y-2">
                  <p className="px-3 py-2 border rounded-md text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                    {rootAPIKeyGenerated}
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(rootAPIKeyGenerated);
                      toast({
                        description: "Copied Root API key to clipboard",
                      });
                    }}
                  >
                    Copy Root API Key
                  </Button>
                </div>
              ) : (
                <newRootAPIKeyFetcher.Form method="POST">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full mt-2"
                    name="action"
                    value="generateRootAPIKey"
                  >
                    {isGeneratingNewAPIKey
                      ? "Generating new API Key"
                      : "Generate new API Key"}
                  </Button>
                </newRootAPIKeyFetcher.Form>
              )}
            </DialogHeader>
          </DialogContent>
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
    </Dialog>
  );
}
