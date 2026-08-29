import fs from 'fs';
import path from 'path';
import { CustomerProfile, CustomerPreferences, MenuItem, OfferPromotion, Order, StoreLocation } from '../../src/types';

class DataLayer {
  private menu: MenuItem[] = [];
  private customers: CustomerProfile[] = [];
  private orders: Order[] = [];
  private offers: OfferPromotion[] = [];
  private stores: StoreLocation[] = [];
  private faqText: string = '';
  private initialized = false;

  constructor() {
    this.loadAll();
  }

  private getFilePath(filename: string): string {
    return path.join(process.cwd(), 'data', filename);
  }

  private loadAll(): void {
    try {
      const menuPath = this.getFilePath('menu.json');
      if (fs.existsSync(menuPath)) {
        this.menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
      }

      const customersPath = this.getFilePath('customers.json');
      if (fs.existsSync(customersPath)) {
        this.customers = JSON.parse(fs.readFileSync(customersPath, 'utf-8'));
      }

      const ordersPath = this.getFilePath('orders.json');
      if (fs.existsSync(ordersPath)) {
        this.orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
      }

      const offersPath = this.getFilePath('offers.json');
      if (fs.existsSync(offersPath)) {
        this.offers = JSON.parse(fs.readFileSync(offersPath, 'utf-8'));
      }

      const storesPath = this.getFilePath('stores.json');
      if (fs.existsSync(storesPath)) {
        this.stores = JSON.parse(fs.readFileSync(storesPath, 'utf-8'));
      }

      const faqPath = this.getFilePath('faq.txt');
      if (fs.existsSync(faqPath)) {
        this.faqText = fs.readFileSync(faqPath, 'utf-8');
      }

      this.initialized = true;
      console.log(`[DataLayer] Initialized successfully. Loaded ${this.menu.length} menu items, ${this.customers.length} customers, ${this.orders.length} orders.`);
    } catch (err) {
      console.error('[DataLayer] Error loading data files:', err);
    }
  }

  public getMenu(): MenuItem[] {
    return this.menu;
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.menu.find((m) => m.id === id || m.name.toLowerCase() === id.toLowerCase());
  }

  public getCustomers(): CustomerProfile[] {
    return this.customers;
  }

  public getCustomerById(id: string): CustomerProfile | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public updateCustomerPreferences(id: string, newPreferences: Partial<CustomerPreferences>): CustomerProfile | null {
    const customer = this.getCustomerById(id);
    if (!customer) return null;
    customer.preferences = {
      ...customer.preferences,
      ...newPreferences,
    };
    return customer;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrdersByCustomerId(customerId: string): Order[] {
    return this.orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${randomNum}`,
      orderNumber: `#CF-${randomNum}`,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);

    // Increment customer loyalty points
    const customer = this.getCustomerById(orderData.customerId);
    if (customer) {
      customer.loyaltyPoints += orderData.pointsEarned || Math.round(orderData.total * 2);
    }

    return newOrder;
  }

  public getOffers(): OfferPromotion[] {
    return this.offers.filter((o) => o.active);
  }

  public getStores(): StoreLocation[] {
    return this.stores;
  }

  public getStoreById(id: string): StoreLocation | undefined {
    return this.stores.find((s) => s.id === id || s.name.toLowerCase().includes(id.toLowerCase()));
  }

  public getFaqContent(): string {
    return this.faqText;
  }
}

export const dataLayer = new DataLayer();
