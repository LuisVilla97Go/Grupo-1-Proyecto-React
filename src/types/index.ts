export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  shortDesc?: string;
  longDesc?: string;
  price: number;
  cost: number;
  comparePrice?: number;
  stock: number;
  minStock?: number;
  status: "published" | "draft";
  images: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface User {
  username: string;
  name: string;
  role: string;
}
