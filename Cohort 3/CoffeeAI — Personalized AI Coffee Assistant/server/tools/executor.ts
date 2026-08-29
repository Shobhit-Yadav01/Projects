import { dataLayer } from '../services/dataLayer';
import { MenuItem, CustomerProfile, Order, ToolCallRecord } from '../../src/types';

export interface ToolExecutionResult {
  toolName: string;
  args: Record<string, any>;
  output: any;
  summary: string;
  recommendedProductIds?: string[];
}

export class ToolExecutor {
  public async execute(name: string, args: Record<string, any>): Promise<ToolExecutionResult> {
    console.log(`[ToolExecutor] Executing ${name} with args:`, JSON.stringify(args));

    try {
      switch (name) {
        case 'searchMenu': {
          const { query, category, temperature, sweetness, dietaryTag, maxPrice } = args;
          let items = dataLayer.getMenu();

          if (query) {
            const q = String(query).toLowerCase();
            items = items.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.flavorNotes.some((f) => f.toLowerCase().includes(q)) ||
                item.ingredients.some((i) => i.toLowerCase().includes(q))
            );
          }

          if (category) {
            const cat = String(category).toLowerCase();
            items = items.filter((item) => item.category.toLowerCase().includes(cat));
          }

          if (temperature) {
            const temp = String(temperature).toLowerCase();
            items = items.filter((item) => item.temperature.toLowerCase().includes(temp) || item.temperature === 'Both');
          }

          if (sweetness) {
            const sw = String(sweetness).toLowerCase();
            items = items.filter((item) => item.sweetnessLevel.toLowerCase().includes(sw));
          }

          if (dietaryTag) {
            const tag = String(dietaryTag).toLowerCase();
            items = items.filter((item) => item.dietaryTags.some((t) => t.toLowerCase().includes(tag)));
          }

          if (maxPrice && typeof maxPrice === 'number') {
            items = items.filter((item) => item.basePrice <= maxPrice);
          }

          const results = items.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            basePrice: item.basePrice,
            temperature: item.temperature,
            sweetnessLevel: item.sweetnessLevel,
            caffeineMg: item.caffeineMg,
            dietaryTags: item.dietaryTags,
            flavorNotes: item.flavorNotes,
            description: item.description,
          }));

          return {
            toolName: name,
            args,
            output: results.length > 0 ? results : { message: 'No menu items found matching these specific filters.' },
            summary: `Found ${results.length} menu items matching criteria.`,
            recommendedProductIds: results.slice(0, 3).map((r) => r.id),
          };
        }

        case 'getProductDetails': {
          const { productId } = args;
          const menu = dataLayer.getMenu();
          const p = menu.find(
            (item) =>
              item.id === productId ||
              item.name.toLowerCase().includes(String(productId).toLowerCase()) ||
              String(productId).toLowerCase().includes(item.name.toLowerCase())
          );

          if (!p) {
            return {
              toolName: name,
              args,
              output: { error: `Product '${productId}' was not found on our current menu.` },
              summary: `Product not found: ${productId}`,
            };
          }

          return {
            toolName: name,
            args,
            output: p,
            summary: `Retrieved specifications for ${p.name} ($${p.basePrice.toFixed(2)})`,
            recommendedProductIds: [p.id],
          };
        }

        case 'getCustomerProfile': {
          const { customerId } = args;
          const customer = dataLayer.getCustomerById(customerId);

          if (!customer) {
            return {
              toolName: name,
              args,
              output: { message: `Customer '${customerId}' not found. Using guest profile.` },
              summary: `Guest profile fallback for ${customerId}`,
            };
          }

          return {
            toolName: name,
            args,
            output: {
              id: customer.id,
              name: customer.name,
              membershipTier: customer.membershipTier,
              loyaltyPoints: customer.loyaltyPoints,
              preferences: customer.preferences,
            },
            summary: `Loaded preferences for ${customer.name} (${customer.membershipTier})`,
          };
        }

        case 'getPreviousOrders': {
          const { customerId, limit = 3 } = args;
          const orders = dataLayer.getOrdersByCustomerId(customerId).slice(0, limit);

          if (orders.length === 0) {
            return {
              toolName: name,
              args,
              output: { message: `No previous order records found for customer ${customerId}.` },
              summary: `No previous orders found for ${customerId}`,
            };
          }

          return {
            toolName: name,
            args,
            output: orders,
            summary: `Retrieved ${orders.length} previous order(s) for customer.`,
            recommendedProductIds: orders[0]?.items?.map((i) => i.productId) || [],
          };
        }

        case 'getRecommendations': {
          const { customerId, temperature, sweetness, category, dietary } = args;
          const customer = customerId ? dataLayer.getCustomerById(customerId) : undefined;
          const allMenu = dataLayer.getMenu();

          // Preference scoring
          const scored = allMenu.map((item) => {
            let score = item.popularity / 20; // baseline 0-5

            if (customer) {
              if (item.category === customer.preferences.favoriteCategory) score += 4;
              if (item.temperature === customer.preferences.preferredTemperature || item.temperature === 'Both') score += 3;
              if (item.sweetnessLevel.toLowerCase().includes(customer.preferences.sweetnessLevel.toLowerCase())) score += 3;
              if (customer.preferences.favoriteProductIds.includes(item.id)) score += 3;
              for (const diet of customer.preferences.dietaryPreferences) {
                if (item.dietaryTags.some((t) => t.toLowerCase() === diet.toLowerCase())) score += 2;
              }
            }

            if (temperature && (item.temperature.toLowerCase().includes(temperature.toLowerCase()) || item.temperature === 'Both')) {
              score += 4;
            }

            if (sweetness && item.sweetnessLevel.toLowerCase().includes(sweetness.toLowerCase())) {
              score += 4;
            }

            if (category && item.category.toLowerCase().includes(category.toLowerCase())) {
              score += 3;
            }

            if (dietary && item.dietaryTags.some((t) => t.toLowerCase().includes(dietary.toLowerCase()))) {
              score += 3;
            }

            return { item, score };
          });

          scored.sort((a, b) => b.score - a.score);
          const topItems = scored.slice(0, 3).map((s) => s.item);

          return {
            toolName: name,
            args,
            output: topItems.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              basePrice: item.basePrice,
              temperature: item.temperature,
              sweetnessLevel: item.sweetnessLevel,
              caffeineMg: item.caffeineMg,
              dietaryTags: item.dietaryTags,
              flavorNotes: item.flavorNotes,
              matchReason: customer
                ? `Matches your ${customer.preferences.preferredTemperature} temperature & ${customer.preferences.milkPreference} preference.`
                : 'Highly rated customer favorite.',
            })),
            summary: `Generated ${topItems.length} personalized recommendations.`,
            recommendedProductIds: topItems.map((t) => t.id),
          };
        }

        case 'getCurrentOffers': {
          const offers = dataLayer.getOffers();
          return {
            toolName: name,
            args,
            output: offers,
            summary: `Found ${offers.length} active promotional offers.`,
          };
        }

        case 'getStoreInformation': {
          const { storeId } = args;
          if (storeId) {
            const store = dataLayer.getStoreById(storeId);
            if (!store) {
              return {
                toolName: name,
                args,
                output: { error: `Store location '${storeId}' not found.` },
                summary: `Store not found: ${storeId}`,
              };
            }
            return {
              toolName: name,
              args,
              output: store,
              summary: `Loaded location details for ${store.name}`,
            };
          }

          const stores = dataLayer.getStores();
          return {
            toolName: name,
            args,
            output: stores,
            summary: `Retrieved all ${stores.length} store locations.`,
          };
        }

        case 'checkProductAvailability': {
          const { productId, storeId } = args;
          const menu = dataLayer.getMenu();
          const product = menu.find(
            (p) =>
              p.id === productId ||
              p.name.toLowerCase().includes(String(productId).toLowerCase()) ||
              String(productId).toLowerCase().includes(p.name.toLowerCase())
          );

          if (!product) {
            return {
              toolName: name,
              args,
              output: { available: false, error: `Product '${productId}' not found on menu.` },
              summary: `Product not found: ${productId}`,
            };
          }

          const stores = dataLayer.getStores();
          const targetStore = storeId ? dataLayer.getStoreById(storeId) : stores[0];
          const isAvailable = targetStore ? product.availability[targetStore.id] !== false : true;

          return {
            toolName: name,
            args,
            output: {
              productId: product.id,
              productName: product.name,
              storeId: targetStore?.id,
              storeName: targetStore?.name,
              isAvailable,
              currentWaitMinutes: targetStore?.currentWaitMinutes || 3,
            },
            summary: `${product.name} is ${isAvailable ? 'AVAILABLE' : 'CURRENTLY OUT OF STOCK'} at ${targetStore?.name || 'all locations'}.`,
            recommendedProductIds: [product.id],
          };
        }

        default:
          return {
            toolName: name,
            args,
            output: { error: `Unknown tool '${name}' requested.` },
            summary: `Error: Unknown tool ${name}`,
          };
      }
    } catch (err: any) {
      console.error(`[ToolExecutor] Error executing ${name}:`, err);
      return {
        toolName: name,
        args,
        output: { error: `Execution failed: ${err.message}` },
        summary: `Execution error in ${name}`,
      };
    }
  }
}

export const toolExecutor = new ToolExecutor();
