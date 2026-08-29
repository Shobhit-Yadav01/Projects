import { dataLayer } from '../services/dataLayer';
import { GroundingSource, MenuItem, CustomerProfile, Order } from '../../src/types';

export interface RetrievalResult {
  formattedContext: string;
  sources: GroundingSource[];
  relevantProducts: MenuItem[];
}

export class KnowledgeRetriever {
  /**
   * Main RAG retrieval method: Given user query and optional customerId,
   * finds top relevant knowledge pieces across Menu, FAQ, Offers, Stores, and Customer Order History.
   */
  public retrieve(query: string, customerId?: string): RetrievalResult {
    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = this.tokenize(cleanQuery);
    const sources: GroundingSource[] = [];
    const contextBlocks: string[] = [];
    const matchedProducts: MenuItem[] = [];

    // 1. Customer Context Retrieval (if customerId provided)
    let customer: CustomerProfile | undefined;
    let customerOrders: Order[] = [];
    if (customerId) {
      customer = dataLayer.getCustomerById(customerId);
      if (customer) {
        customerOrders = dataLayer.getOrdersByCustomerId(customerId);
        
        // Add customer preference grounding
        const prefSummary = `Customer Profile: ${customer.name} (Tier: ${customer.membershipTier}, Points: ${customer.loyaltyPoints}) | Prefers: ${customer.preferences.favoriteCategory}, ${customer.preferences.preferredTemperature} temperature, ${customer.preferences.sweetnessLevel} sweetness (${customer.preferences.sweetnessPercent}%), Milk: ${customer.preferences.milkPreference}, Dietary: ${customer.preferences.dietaryPreferences.join(', ')}.`;
        
        sources.push({
          title: `Customer Preferences (${customer.name})`,
          type: 'customer_profile',
          snippet: prefSummary,
          confidence: 0.98,
          id: customer.id,
        });
        contextBlocks.push(`[CUSTOMER CONTEXT]\n${prefSummary}`);
      }
    }

    // 2. Order History Retrieval (if query asks about past orders or recommendations)
    if (customer && (cleanQuery.includes('last') || cleanQuery.includes('order') || cleanQuery.includes('previous') || cleanQuery.includes('bought') || cleanQuery.includes('usual') || cleanQuery.includes('again'))) {
      if (customerOrders.length > 0) {
        const lastOrder = customerOrders[0];
        const itemsSummary = lastOrder.items
          .map((item) => `${item.quantity}x ${item.productName} (${item.size}, $${item.unitPrice.toFixed(2)}${item.customizations?.milk ? `, ${item.customizations.milk}` : ''}${item.customizations?.sweetness ? `, ${item.customizations.sweetness}` : ''})`)
          .join('; ');
        
        const orderSnippet = `Most Recent Order ${lastOrder.orderNumber} placed on ${new Date(lastOrder.createdAt).toLocaleDateString()} at ${lastOrder.storeName}: Total $${lastOrder.total.toFixed(2)}. Items: ${itemsSummary}. Status: ${lastOrder.status}.`;
        
        sources.push({
          title: `Previous Order History (${lastOrder.orderNumber})`,
          type: 'order_history',
          snippet: orderSnippet,
          confidence: 0.99,
          id: lastOrder.id,
        });
        contextBlocks.push(`[ORDER HISTORY]\n${orderSnippet}`);
      }
    }

    // 3. Menu Items Retrieval
    const allMenu = dataLayer.getMenu();
    const scoredProducts = allMenu.map((prod) => {
      let score = 0;
      const nameLower = prod.name.toLowerCase();
      const descLower = prod.description.toLowerCase();
      const catLower = prod.category.toLowerCase();
      const ingredientsLower = prod.ingredients.join(' ').toLowerCase();
      const dietaryLower = prod.dietaryTags.join(' ').toLowerCase();
      const notesLower = prod.flavorNotes.join(' ').toLowerCase();

      // Direct exact matches
      if (nameLower.includes(cleanQuery)) score += 10;
      if (catLower.includes(cleanQuery)) score += 7;

      // Token matching
      for (const token of queryTokens) {
        if (token.length <= 2) continue;
        if (nameLower.includes(token)) score += 4;
        if (catLower.includes(token)) score += 3;
        if (descLower.includes(token)) score += 2;
        if (ingredientsLower.includes(token)) score += 3;
        if (dietaryLower.includes(token)) score += 3;
        if (notesLower.includes(token)) score += 2;
        if (prod.temperature.toLowerCase().includes(token)) score += 2;
        if (prod.sweetnessLevel.toLowerCase().includes(token)) score += 2;
      }

      // Customer preference bias
      if (customer) {
        if (prod.temperature.toLowerCase() === customer.preferences.preferredTemperature.toLowerCase() || prod.temperature === 'Both') {
          score += 1;
        }
        if (prod.category.toLowerCase() === customer.preferences.favoriteCategory.toLowerCase()) {
          score += 2;
        }
        if (customer.preferences.favoriteProductIds.includes(prod.id)) {
          score += 2;
        }
        // Dietary match
        for (const tag of customer.preferences.dietaryPreferences) {
          if (prod.dietaryTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
            score += 1.5;
          }
        }
      }

      return { product: prod, score };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    // Pick top matching products (up to 4 most relevant)
    const topProducts = scoredProducts.filter((p) => p.score > 0).slice(0, 4);
    
    // If no specific keyword matched, include popular or customer favorite items
    const selectedProducts = topProducts.length > 0 ? topProducts.map((p) => p.product) : allMenu.slice(0, 3);
    
    selectedProducts.forEach((prod) => {
      matchedProducts.push(prod);
      const sizePrices = prod.sizes.map((s) => `${s.name}: $${s.price.toFixed(2)}`).join(', ');
      const prodSnippet = `${prod.name} ($${prod.basePrice.toFixed(2)} base | Sizes: ${sizePrices}) - Category: ${prod.category} | Temp: ${prod.temperature} | Sweetness: ${prod.sweetnessLevel} (${prod.defaultSweetnessPercent}%) | Caffeine: ${prod.caffeineLevel} (${prod.caffeineMg}mg) | Calories: ${prod.calories} | Milk Options: ${prod.milkOptions.join(', ')} | Dietary: ${prod.dietaryTags.join(', ')} | Ingredients: ${prod.ingredients.join(', ')} | Notes: ${prod.flavorNotes.join(', ')}. Description: ${prod.description}`;
      
      sources.push({
        title: `Menu Item: ${prod.name}`,
        type: 'menu',
        snippet: prodSnippet,
        confidence: 0.95,
        id: prod.id,
      });
      contextBlocks.push(`[MENU ITEM: ${prod.name}]\n${prodSnippet}`);
    });

    // 4. FAQ & Knowledge Base Chunk Retrieval
    const faqText = dataLayer.getFaqContent();
    const faqSections = faqText.split(/\n##\s+/);
    
    faqSections.forEach((section) => {
      if (!section.trim()) return;
      const sectionLower = section.toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (token.length > 3 && sectionLower.includes(token)) {
          matchCount++;
        }
      }
      if (matchCount > 0 || cleanQuery.includes('brew') || cleanQuery.includes('oat') || cleanQuery.includes('decaf') || cleanQuery.includes('allergy') || cleanQuery.includes('point') || cleanQuery.includes('wifi') || cleanQuery.includes('bean') || cleanQuery.includes('roast')) {
        const lines = section.split('\n');
        const header = lines[0].replace(/^#*\s*/, '').trim();
        const snippet = lines.slice(1).join('\n').trim();
        if (snippet) {
          sources.push({
            title: `FAQ Guide: ${header}`,
            type: 'faq',
            snippet: snippet.slice(0, 300) + (snippet.length > 300 ? '...' : ''),
            confidence: 0.88,
          });
          contextBlocks.push(`[FAQ: ${header}]\n${snippet}`);
        }
      }
    });

    // 5. Offers & Promotions Retrieval
    if (cleanQuery.includes('offer') || cleanQuery.includes('deal') || cleanQuery.includes('discount') || cleanQuery.includes('special') || cleanQuery.includes('promo') || cleanQuery.includes('tuesday') || cleanQuery.includes('morning')) {
      const offers = dataLayer.getOffers();
      offers.forEach((off) => {
        const offSnippet = `Promo Code [${off.code}]: ${off.title} - ${off.description} (Valid for: ${off.eligibleCategories.join(', ')} until ${off.validUntil})`;
        sources.push({
          title: `Special Offer: ${off.title}`,
          type: 'offers',
          snippet: offSnippet,
          confidence: 0.92,
          id: off.id,
        });
        contextBlocks.push(`[OFFER]\n${offSnippet}`);
      });
    }

    // 6. Stores Retrieval
    if (cleanQuery.includes('store') || cleanQuery.includes('location') || cleanQuery.includes('hour') || cleanQuery.includes('open') || cleanQuery.includes('address') || cleanQuery.includes('where') || cleanQuery.includes('downtown') || cleanQuery.includes('pier') || cleanQuery.includes('tech hub')) {
      const stores = dataLayer.getStores();
      stores.forEach((store) => {
        const storeSnippet = `${store.name}: ${store.address} (Phone: ${store.phone}) | Mon-Fri: ${store.hours.monday_friday}, Sat-Sun: ${store.hours.saturday_sunday} | Features: ${store.features.join(', ')} | Nitro Tap: ${store.hasNitroTap ? 'Available' : 'No'}.`;
        sources.push({
          title: `Store: ${store.name}`,
          type: 'store_info',
          snippet: storeSnippet,
          confidence: 0.90,
          id: store.id,
        });
        contextBlocks.push(`[STORE INFO]\n${storeSnippet}`);
      });
    }

    return {
      formattedContext: contextBlocks.join('\n\n'),
      sources: sources.slice(0, 5), // Keep top 5 sources for UI display
      relevantProducts: selectedProducts,
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }
}

export const retriever = new KnowledgeRetriever();
