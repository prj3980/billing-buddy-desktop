
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice?: number;
  category: string;
  hasVariableColors: boolean;
  predefinedColors?: string[];
  volumes?: string[];
  stockQuantity?: number;
  unit: 'liters' | 'kg' | 'pieces';
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    basePrice: undefined,
    category: '',
    hasVariableColors: false,
    predefinedColors: [],
    volumes: [],
    stockQuantity: undefined,
    unit: 'liters'
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p
      );
      saveProducts(updatedProducts);
      toast({ title: "Success", description: "Product updated successfully!" });
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString()
      };
      saveProducts([...products, newProduct]);
      toast({ title: "Success", description: "Product added successfully!" });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: undefined,
      category: '',
      hasVariableColors: false,
      predefinedColors: [],
      volumes: [],
      stockQuantity: undefined,
      unit: 'liters'
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      category: product.category,
      hasVariableColors: product.hasVariableColors,
      predefinedColors: product.predefinedColors || [],
      volumes: product.volumes || [],
      stockQuantity: product.stockQuantity,
      unit: product.unit || 'liters'
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    toast({ title: "Success", description: "Product deleted successfully!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your paint products and inventory</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <CardDescription>
              Add paint products with base information. Pricing can be set per invoice for variable products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Asian Paints Ace Exterior Emulsion"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Exterior Paint, Interior Paint"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit of Measurement *</Label>
                  <Select value={formData.unit} onValueChange={(value: 'liters' | 'kg' | 'pieces') => setFormData({...formData, unit: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price (₹) - Optional</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                    placeholder="Leave empty for variable pricing"
                  />
                </div>
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity - Optional</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Current stock"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product details, specifications, etc."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasVariableColors"
                  checked={formData.hasVariableColors}
                  onChange={(e) => setFormData({...formData, hasVariableColors: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasVariableColors">Has variable colors/codes</Label>
              </div>
              
              {formData.hasVariableColors && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="predefinedColors">Predefined Colors (comma separated)</Label>
                    <Input
                      id="predefinedColors"
                      value={formData.predefinedColors?.join(', ') || ''}
                      onChange={(e) => setFormData({...formData, predefinedColors: e.target.value.split(',').map(c => c.trim()).filter(c => c)})}
                      placeholder="Red, Blue, Green"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volumes">Available Volumes (comma separated)</Label>
                    <Input
                      id="volumes"
                      value={formData.volumes?.join(', ') || ''}
                      onChange={(e) => setFormData({...formData, volumes: e.target.value.split(',').map(v => v.trim()).filter(v => v)})}
                      placeholder="1L, 4L, 20L"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {product.basePrice ? (
                      <span className="flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {product.basePrice.toFixed(2)} per {product.unit}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Variable pricing per {product.unit}</span>
                    )}
                  </span>
                  {product.hasVariableColors && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Variable Colors
                    </span>
                  )}
                </div>
                {product.stockQuantity && (
                  <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity} {product.unit}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Products;
