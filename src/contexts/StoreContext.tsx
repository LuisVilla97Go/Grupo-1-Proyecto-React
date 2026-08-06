/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { type Product, type Category, type Sale, type CartItem, type Notification, type StoreSettings } from "../types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { fetchFromLocalAPI, saveToLocalAPI } from "../services/api";

interface StoreContextType {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, amount: number) => void;
  removeFromCart: (productId: string, name: string) => void;
  clearCart: () => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, "id" | "productCount">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  registerSale: (sale: Omit<Sale, "id" | "date" | "seller">) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  settings: StoreSettings | null;
  updateSettings: (settings: StoreSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const { user } = useAuth();

  // Cargar datos (Productos, Categorías, Ventas) desde localStorage o sembrarlos de la API
  useEffect(() => {
    const loadStoreData = async () => {
      // 1. Fetch Categories
      const savedCats = localStorage.getItem("dash_categories");
      if (savedCats && savedCats !== "[]") {
        setCategories(JSON.parse(savedCats));
      } else {
        const catData = await fetchFromLocalAPI("categories.json");
        if (catData) {
          setCategories(catData);
          localStorage.setItem("dash_categories", JSON.stringify(catData));
        }
      }

      // 2. Fetch Products
      const savedProds = localStorage.getItem("dash_products");
      if (savedProds && savedProds !== "[]") {
        setProducts(JSON.parse(savedProds));
      } else {
        const prodData = await fetchFromLocalAPI("products.json");
        if (prodData) {
          setProducts(prodData);
          localStorage.setItem("dash_products", JSON.stringify(prodData));
        }
      }

      // 3. Fetch Sales
      const savedSales = localStorage.getItem("dash_sales");
      if (savedSales && savedSales !== "[]") {
        setSales(JSON.parse(savedSales));
      } else {
        const salesData = await fetchFromLocalAPI("sales.json");
        if (salesData) {
          setSales(salesData);
          localStorage.setItem("dash_sales", JSON.stringify(salesData));
        }
      }

      // 4. Fetch Notifications
      const savedNotifs = localStorage.getItem("dash_notifs");
      if (savedNotifs !== null) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        const notifData = await fetchFromLocalAPI("notifications.json");
        if (notifData) {
          setNotifications(notifData);
          localStorage.setItem("dash_notifs", JSON.stringify(notifData));
        }
      }

      // 5. Fetch Cart
      const savedCart = localStorage.getItem("dash_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // 6. Fetch Settings
      const savedSettings = localStorage.getItem("store_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        const settingsData = await fetchFromLocalAPI("settings.json");
        if (settingsData) {
          setSettings(settingsData);
          localStorage.setItem("store_settings", JSON.stringify(settingsData));
        }
      }
    };

    loadStoreData();
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("dash_products", JSON.stringify(newProducts));
    saveToLocalAPI("save-products", newProducts);
  };

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem("dash_categories", JSON.stringify(newCategories));
    saveToLocalAPI("save-categories", newCategories);
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("dash_cart", JSON.stringify(newCart));
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem("store_settings", JSON.stringify(newSettings));
    saveToLocalAPI("save-settings", newSettings);
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const maxId = products.reduce((max, p) => {
      if (p.id.startsWith("prod-")) {
        const num = parseInt(p.id.replace("prod-", ""), 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `prod-${maxId + 1}`;
    const updated = [...products, { ...product, id: newId }];
    saveProducts(updated);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    const updatedList = products.map((p) =>
      p.id === id ? { ...p, ...updated } : p
    );
    saveProducts(updatedList);
  };

  const deleteProduct = (id: string) => {
    const updatedList = products.filter((p) => p.id !== id);
    saveProducts(updatedList);
  };

  const addCategory = (category: Omit<Category, "id" | "productCount">) => {
    const maxId = categories.reduce((max, c) => {
      const num = parseInt(c.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = String(maxId + 1);
    const updated = [
      ...categories,
      { ...category, id: newId, productCount: 0 },
    ];
    saveCategories(updated);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    const updatedList = categories.map((c) =>
      c.id === id ? { ...c, ...updated } : c
    );
    saveCategories(updatedList);
  };

  const deleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const productsUsingCategory = products.filter(
      (p) => p.category === category.name,
    );
    if (productsUsingCategory.length > 0) {
      throw new Error(
        `No se puede eliminar la categoría porque tiene ${productsUsingCategory.length} producto(s) asociado(s)`,
      );
    }
    const updatedList = categories.filter((c) => c.id !== id);
    saveCategories(updatedList);
  };

  const registerSale = (saleData: Omit<Sale, "id" | "date" | "seller">) => {
    // 1. Crear el registro de venta con id, fecha y vendedor activo
    const newSale: Sale = {
      ...saleData,
      id: `sale-${crypto.randomUUID().substring(0, 8)}`,
      date: new Date().toISOString(),
      seller: user?.name || "Cliente Web / Ecommerce",
    };

    // 2. Decrementar el stock de los productos comprados
    const updatedProducts = products.map((p) => {
      const purchasedItem = saleData.items.find((item) => item.productId === p.id);
      if (purchasedItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - purchasedItem.quantity),
        };
      }
      return p;
    });

    // 3. Actualizar estados y persistir
    saveProducts(updatedProducts);

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    localStorage.setItem("dash_sales", JSON.stringify(updatedSales));
    localStorage.setItem("dash_sales_seeded", "true");
    saveToLocalAPI("save-sales", updatedSales);

    // 4. Generar Notificación
    const newNotif: Notification = {
      id: `notif-${crypto.randomUUID().substring(0, 8)}`,
      title: "Nueva Venta Registrada",
      message: `El usuario ${newSale.seller} ha registrado una venta de ${saleData.items.length} ítem(s) por un total de S/ ${newSale.total.toFixed(2)}.`,
      type: "success",
      isRead: false,
      date: newSale.date,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("dash_notifs", JSON.stringify(updatedNotifs));
    saveToLocalAPI("save-notifications", updatedNotifs);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem("dash_notifs", JSON.stringify(updated));
    saveToLocalAPI("save-notifications", updated);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("dash_notifs", JSON.stringify([]));
    saveToLocalAPI("save-notifications", []);
  };

  // E-COMMERCE CART METHODS
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" está agotado en estos momentos.`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        toast.warning(`Lo sentimos, solo quedan ${product.stock} unidades de este producto.`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      saveCart(updatedCart);
      toast.success(`Incrementado en el carrito: "${product.name}".`);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
        stockLimit: product.stock,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      };
      saveCart([...cart, newItem]);
      toast.success(`"${product.name}" agregado al carrito.`);
    }
  };

  const updateQuantity = (productId: string, amount: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + amount;
          if (newQty > item.stockLimit) {
            toast.warning(`Solo quedan ${item.stockLimit} unidades de este producto.`);
            return item;
          }
          if (newQty > 0) {
            return { ...item, quantity: newQty };
          }
          return null; // Será filtrado
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string, name: string) => {
    saveCart(cart.filter((item) => item.productId !== productId));
    toast.info(`"${name}" removido de la bolsa.`);
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        sales,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        registerSale,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        settings,
        updateSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");
  return context;
};
