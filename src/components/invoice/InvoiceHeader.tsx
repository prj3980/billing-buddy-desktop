
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: string;
  gstEnabled: boolean;
  onInvoiceNumberChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onGstToggle: (value: boolean) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  date,
  gstEnabled,
  onInvoiceNumberChange,
  onDateChange,
  onGstToggle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="gst-enabled"
            checked={gstEnabled}
            onCheckedChange={onGstToggle}
          />
          <Label htmlFor="gst-enabled">Enable GST (18%)</Label>
        </div>
      </CardContent>
    </Card>
  );
};
