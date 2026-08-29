import { Router, Request, Response } from 'express';
import { coffeeAgent } from '../agent/coffeeAgent';
import { dataLayer } from '../services/dataLayer';
import { ChatApiRequest } from '../../src/types';

export const apiRouter = Router();

// Health Check Endpoint for Cloud Run
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CoffeeAI Backend',
    timestamp: new Date().toISOString(),
    menuCount: dataLayer.getMenu().length,
    storesCount: dataLayer.getStores().length,
  });
});

// Chat with CoffeeAI Agent
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { customerId, message, conversationId } = req.body;
    
    if (!message && typeof message !== 'string') {
      res.status(400).json({ error: 'Message field is required.' });
      return;
    }

    const payload: ChatApiRequest = {
      customerId: customerId || 'cust_alex_01',
      message: String(message),
      conversationId: conversationId ? String(conversationId) : undefined,
    };

    const result = await coffeeAgent.processMessage(payload);
    res.json(result);
  } catch (err: any) {
    console.error('[API Router] Error in /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process conversation with CoffeeAI assistant.',
      details: err.message,
    });
  }
});

// Get Full Menu with optional category/search query filters
apiRouter.get('/menu', (req: Request, res: Response) => {
  try {
    const { category, search, temperature, dietary } = req.query;
    let items = dataLayer.getMenu();

    if (category && typeof category === 'string' && category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    if (temperature && typeof temperature === 'string' && temperature !== 'All') {
      items = items.filter((i) => i.temperature === temperature || i.temperature === 'Both');
    }

    if (dietary && typeof dietary === 'string' && dietary !== 'All') {
      items = items.filter((i) => i.dietaryTags.some((t) => t.toLowerCase() === dietary.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.flavorNotes.some((f) => f.toLowerCase().includes(q))
      );
    }

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

// Get Single Product by ID
apiRouter.get('/menu/:id', (req: Request, res: Response) => {
  const item = dataLayer.getMenuItemById(req.params.id);
  if (!item) {
    res.status(404).json({ error: `Menu item with id '${req.params.id}' not found.` });
    return;
  }
  res.json(item);
});

// Get Customer Profile by ID
apiRouter.get('/customer/:id', (req: Request, res: Response) => {
  const customer = dataLayer.getCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({ error: `Customer with id '${req.params.id}' not found.` });
    return;
  }
  res.json(customer);
});

// Get All Customers (for profile switching in demo)
apiRouter.get('/customers', (req: Request, res: Response) => {
  res.json(dataLayer.getCustomers());
});

// Update Customer Preferences
apiRouter.put('/customer/:id/preferences', (req: Request, res: Response) => {
  const updated = dataLayer.updateCustomerPreferences(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: `Customer with id '${req.params.id}' not found.` });
    return;
  }
  res.json(updated);
});

// Get Customer Orders
apiRouter.get('/customer/:id/orders', (req: Request, res: Response) => {
  const orders = dataLayer.getOrdersByCustomerId(req.params.id);
  res.json(orders);
});

// Place a New Quick Order
apiRouter.post('/customer/:id/orders', (req: Request, res: Response) => {
  try {
    const { items, storeId, storeName } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.itemTotal || item.unitPrice * item.quantity), 0);
    const tax = Math.round(subtotal * 0.0875 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const pointsEarned = Math.round(total * 2);

    const newOrder = dataLayer.createOrder({
      customerId: req.params.id,
      storeId: storeId || 'store_downtown_01',
      storeName: storeName || 'CoffeeAI Downtown Roastery',
      status: 'Brewing',
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      pointsEarned,
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Get Active Offers
apiRouter.get('/offers', (req: Request, res: Response) => {
  res.json(dataLayer.getOffers());
});

// Get Stores
apiRouter.get('/stores', (req: Request, res: Response) => {
  res.json(dataLayer.getStores());
});

// Get Store by ID
apiRouter.get('/stores/:id', (req: Request, res: Response) => {
  const store = dataLayer.getStoreById(req.params.id);
  if (!store) {
    res.status(404).json({ error: `Store with id '${req.params.id}' not found.` });
    return;
  }
  res.json(store);
});
