
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerDetailsProps {
  customerDetails: {
    name: string;
    phone: string;
    address: string;
  };
  onCustomerChange: (field: string, value: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerDetails,
  onCustomerChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerDetails.name}
              onChange={(e) => onCustomerChange('name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              value={customerDetails.phone}
              onChange={(e) => onCustomerChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={customerDetails.address}
            onChange={(e) => onCustomerChange('address', e.target.value)}
            placeholder="Enter address"
          />
        </div>
      </CardContent>
    </Card>
  );
};
