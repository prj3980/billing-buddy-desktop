
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface InvoiceSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  gstEnabled: boolean;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  tax,
  total,
  gstEnabled
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="flex items-center font-medium">
              <IndianRupee className="h-4 w-4" />
              {subtotal.toFixed(2)}
            </span>
          </div>
          {gstEnabled && (
            <div className="flex justify-between text-sm">
              <span>GST (18%):</span>
              <span className="flex items-center font-medium">
                <IndianRupee className="h-4 w-4" />
                {tax.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total:</span>
            <span className="flex items-center">
              <IndianRupee className="h-4 w-4" />
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
