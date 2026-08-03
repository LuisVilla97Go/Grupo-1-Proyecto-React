export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface CartItem extends SaleItem {
  stockLimit: number;
  image?: string;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  igv: number;
  total: number;
  paymentMethod: "Efectivo" | "Tarjeta" | "Yape/Plin" | "Contraentrega";
  seller: string;
  customerName?: string;
  deliveryAddress?: string;
}
