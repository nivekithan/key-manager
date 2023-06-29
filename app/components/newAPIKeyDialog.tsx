import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useAdminFetcher } from "@/routes/admin";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";

export function NewAPIKeyDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [considerGeneartedAPIKey, setConsiderGeneratedAPIKey] = useState(true);
  const newAPIKeyFetcher = useAdminFetcher();

  const isSubmitting = newAPIKeyFetcher.state === "submitting";
  const generatedAPIKey =
    considerGeneartedAPIKey &&
    newAPIKeyFetcher.data !== undefined &&
    newAPIKeyFetcher.data.success &&
    newAPIKeyFetcher.data.action === "newUserAPIKey"
      ? newAPIKeyFetcher.data.apiKey
      : null;

  useEffect(() => {
    if (isSubmitting) {
      return;
    }
    setConsiderGeneratedAPIKey(true);
  }, [isSubmitting]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        setIsOpen(newOpen);

        if (newOpen === false && generatedAPIKey !== null) {
          setConsiderGeneratedAPIKey(false);
          return;
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>New API key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {generatedAPIKey === null ? "New API Key" : "Copy API Key"}
          </DialogTitle>
          <DialogDescription>
            {generatedAPIKey === null
              ? "Generate new API Key to verify requests coming to our api."
              : "Copy API Key and store it safely. It will not be shown again"}
          </DialogDescription>
        </DialogHeader>
        {generatedAPIKey === null ? (
          <newAPIKeyFetcher.Form
            method="POST"
            className="flex flex-col gap-y-4"
          >
            <div>
              <Label htmlFor="get-prefix">Prefix</Label>
              <Input
                name="prefix"
                placeholder="generated token will look like prefix_xxx..."
                required
                id="get-prefix"
              />
            </div>
            <div>
              <Label htmlFor="get-roles">Roles</Label>
              <Input
                name="roles"
                placeholder="List of roles (comma seperated)"
                id="get-roles"
              />
            </div>
            <Button name="action" value="newUserAPIKey">
              {isSubmitting ? "Submitting" : "Submit"}
            </Button>
          </newAPIKeyFetcher.Form>
        ) : (
          <div className="flex  flex-col gap-y-2">
            <p className="px-3 py-2 border overflow-hidden whitespace-nowrap text-ellipsis rounded-md text-sm">
              {generatedAPIKey}
            </p>
            <Button
              className="w-full"
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedAPIKey);
                toast({ description: "Copied API Key to clipboard" });
              }}
            >
              Copy API Key
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
