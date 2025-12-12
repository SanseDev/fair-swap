"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Check if Label exists or use standard label
import { ArrowLeftRight, Loader2 } from "lucide-react";

export function CreateOfferForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Add form state and submission logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  You Pay (Token A)
                </label>
                <Input placeholder="Token Mint Address" />
                <Input type="number" placeholder="Amount" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  You Receive (Token B)
                </label>
                <Input placeholder="Token Mint Address" />
                <Input type="number" placeholder="Amount" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
                 {/* TODO: Add Checkbox component if available, or use standard input */}
                 <input type="checkbox" id="alternatives" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                 <label htmlFor="alternatives" className="text-sm text-muted-foreground">Allow alternative proposals</label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Offer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

