import { config } from '../config';
import { getGeminiClient } from '../services/geminiClient';
import { dataLayer } from '../services/dataLayer';
import { retriever, RetrievalResult } from '../rag/retriever';
import { coffeeToolsDeclarations } from '../tools/declarations';
import { toolExecutor, ToolExecutionResult } from '../tools/executor';
import { sessionMemory } from './memory';
import {
  ChatApiRequest,
  ChatApiResponse,
  GroundingSource,
  MenuItem,
  RecommendationCard,
  ToolCallRecord,
} from '../../src/types';

export class CoffeeAgent {
  public async processMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
    const customerId = request.customerId || 'cust_alex_01';
    const conversationId = request.conversationId || `conv_${customerId}_${Date.now()}`;
    const userMessage = request.message.trim();

    // 1. Validate input
    if (!userMessage) {
      return {
        response: "Hello! I am your CoffeeAI assistant. How can I help you today? You can ask for personalized coffee recommendations, check our menu, view current offers, or look up your past orders.",
        recommendations: [],
        sources: [],
        toolCalls: [],
        conversationId,
        groundingTag: 'System Greeting',
      };
    }

    // 2. Retrieve grounded knowledge via RAG
    const ragResult: RetrievalResult = retriever.retrieve(userMessage, customerId);
    const customer = dataLayer.getCustomerById(customerId);

    // 3. Retrieve conversation history
    const history = sessionMemory.getHistory(conversationId);

    // 4. Construct System Instruction with strict grounding constraints
    const systemInstruction = `You are CoffeeAI, an intelligent, warm, and expert barista AI assistant for our specialty coffee shop.
You operate using an agentic architecture with Retrieval-Augmented Generation (RAG) and tool calling.

CRITICAL OPERATIONAL RULES:
1. FACTUAL GROUNDING: NEVER invent menu items, prices, sizes, offers, stores, or ingredients. Use ONLY the retrieved knowledge base data or tool outputs.
2. PRICE PRECISION: Always quote exact prices from the menu data (e.g. Signature Cold Brew is $4.75 base; sizes are Small $4.25, Medium $4.75, Large $5.45). Never guess prices.
3. PERSONALIZATION: When recommending items, tailor choices to the customer's preferences (${customer?.name || 'Customer'}: prefers ${customer?.preferences.preferredTemperature || 'Cold'} drinks, ${customer?.preferences.sweetnessLevel || 'Low'} sweetness, ${customer?.preferences.milkPreference || 'Oat Milk'}, dietary: ${customer?.preferences.dietaryPreferences?.join(', ') || 'Dairy-Free'}). Always explain WHY each recommended item fits their taste profile.
4. PREVIOUS ORDERS: When asked about previous orders ("what did I order last time?", "order history", "the usual"), look up or retrieve their past orders.
5. CONCISE & ACTIONABLE: Provide helpful, welcoming, and concise responses. Format key product names in bold.
6. UNAVAILABLE ITEMS: If a user asks for something not on the menu or unavailable at a specific store, politely explain that it is not available and offer the closest matching alternative.
7. TOOLS USAGE: Use the provided tools (searchMenu, getProductDetails, getCustomerProfile, getPreviousOrders, getRecommendations, getCurrentOffers, getStoreInformation, checkProductAvailability) whenever needed to retrieve accurate real-time data.

KNOWLEDGE BASE CONTEXT (RAG):
${ragResult.formattedContext}
`;

    const toolExecutionLogs: ToolCallRecord[] = [];
    const collectedRecommendedIds = new Set<string>();
    let finalAssistantText = '';

    // If initial RAG retrieved relevant products, add them to recommendation candidates
    ragResult.relevantProducts.forEach((p) => collectedRecommendedIds.add(p.id));

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        // Safe Fallback if API Key is not set: Generate intelligent grounded response using RAG & tools
        console.warn('[CoffeeAgent] GEMINI_API_KEY not found. Running deterministic RAG fallback response engine.');
        const fallback = this.generateDeterministicResponse(userMessage, customerId, ragResult);
        sessionMemory.addTurn(conversationId, 'user', userMessage);
        sessionMemory.addTurn(conversationId, 'assistant', fallback.response);
        return {
          ...fallback,
          conversationId,
        };
      }

      const ai = getGeminiClient();

      // Build conversation contents including history
      const contentsPayload: any[] = [];
      for (const turn of history) {
        contentsPayload.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text }],
        });
      }
      contentsPayload.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      let currentStep = 0;
      let modelTurnFinished = false;

      while (!modelTurnFinished && currentStep < config.maxToolSteps) {
        currentStep++;

        // 8 second timeout per model generation turn
        const generatePromise = ai.models.generateContent({
          model: config.geminiModel,
          contents: contentsPayload,
          config: {
            systemInstruction,
            temperature: config.temperature,
            tools: [{ functionDeclarations: coffeeToolsDeclarations }],
          },
        });

        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Gemini API call timed out after 8000ms')), 8000);
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]).finally(() => {
          clearTimeout(timer!);
        });

        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          // Execute all function calls requested by the model
          const functionResponseParts: any[] = [];

          for (const call of functionCalls) {
            const toolResult: ToolExecutionResult = await toolExecutor.execute(call.name, call.args || {});
            
            toolExecutionLogs.push({
              id: `tool_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: call.name,
              args: call.args || {},
              resultSummary: toolResult.summary,
              timestamp: new Date().toLocaleTimeString(),
            });

            if (toolResult.recommendedProductIds) {
              toolResult.recommendedProductIds.forEach((id) => collectedRecommendedIds.add(id));
            }

            const structuredResponse =
              typeof toolResult.output === 'object' && !Array.isArray(toolResult.output) && toolResult.output !== null
                ? toolResult.output
                : { result: toolResult.output };

            functionResponseParts.push({
              functionResponse: {
                name: call.name,
                response: structuredResponse,
              },
            });
          }

          // Append model turn with function calls and user turn with function responses
          contentsPayload.push(response.candidates?.[0]?.content);
          contentsPayload.push({
            role: 'user',
            parts: functionResponseParts,
          });
        } else {
          // Model completed its final text output
          finalAssistantText = response.text || '';
          modelTurnFinished = true;
        }
      }

      if (!finalAssistantText) {
        finalAssistantText = "I've checked our menu and store data for you. Here are our recommendations tailored to your preferences!";
      }

    } catch (err: any) {
      console.error('[CoffeeAgent] Gemini API invocation error, falling back gracefully:', err);
      const fallback = this.generateDeterministicResponse(userMessage, customerId, ragResult);
      finalAssistantText = fallback.response;
      fallback.toolCalls.forEach((t) => toolExecutionLogs.push(t));
      fallback.recommendations.forEach((r) => collectedRecommendedIds.add(r.productId));
    }

    // Save to memory
    sessionMemory.addTurn(conversationId, 'user', userMessage);
    sessionMemory.addTurn(conversationId, 'assistant', finalAssistantText);

    // Build structured recommendation cards
    const recommendationCards = this.buildRecommendationCards(collectedRecommendedIds, customerId, userMessage);

    // Derive Grounding Tag for transparency
    const groundingTag = this.deriveGroundingTag(ragResult.sources, toolExecutionLogs);

    return {
      response: finalAssistantText,
      recommendations: recommendationCards,
      sources: ragResult.sources,
      toolCalls: toolExecutionLogs,
      conversationId,
      groundingTag,
    };
  }

  /**
   * Deterministic high-quality fallback engine when offline or testing without API key
   */
  private generateDeterministicResponse(query: string, customerId: string, rag: RetrievalResult): ChatApiResponse {
    const q = query.toLowerCase();
    const customer = dataLayer.getCustomerById(customerId);
    const tools: ToolCallRecord[] = [];
    let responseText = '';
    const recommendedIds: string[] = [];

    if (q.includes('profile') || q.includes('tier') || q.includes('points') || q.includes('loyalty') || q.includes('membership')) {
      tools.push({
        id: `tool_${Date.now()}_profile`,
        name: 'getCustomerProfile',
        args: { customerId },
        resultSummary: `Loaded profile: ${customer?.name || customerId} (${customer?.membershipTier || 'Member'}, ${customer?.loyaltyPoints || 0} pts)`,
        timestamp: new Date().toLocaleTimeString(),
      });

      responseText = `Here are your profile details, **${customer?.name || 'Valued Customer'}**:\n\n• **Membership Tier**: ${customer?.membershipTier || 'Gold Bean Member'}\n• **Loyalty Points**: **${customer?.loyaltyPoints || 0} pts** (redeemable for free upgrades and pastries)\n• **Milk Preference**: ${customer?.preferences.milkPreference || 'Oat Milk'}\n• **Sweetness**: ${customer?.preferences.sweetnessLevel || 'Low'} (${customer?.preferences.sweetnessPercent || 15}%)\n• **Dietary Preferences**: ${customer?.preferences.dietaryPreferences?.join(', ') || 'Dairy-Free, Low-Sugar'}\n\nWould you like to update any of your taste settings or order your usual?`;
      if (customer?.preferences.favoriteProductIds) {
        customer.preferences.favoriteProductIds.forEach((id) => recommendedIds.push(id));
      }
    } else if (q.includes('search') || q.includes('vegan') || q.includes('gluten') || q.includes('dairy-free') || q.includes('under') || q.includes('less than') || q.includes('calorie') || q.includes('find')) {
      let dietaryTag: string | undefined;
      if (q.includes('vegan')) dietaryTag = 'Vegan';
      else if (q.includes('gluten')) dietaryTag = 'Gluten-Free';
      else if (q.includes('dairy-free')) dietaryTag = 'Dairy-Free';
      else if (q.includes('keto')) dietaryTag = 'Keto-Friendly';

      let maxPrice: number | undefined;
      const priceMatch = q.match(/(?:under|less than|\$)\s*(\d+(?:\.\d+)?)/);
      if (priceMatch) {
        maxPrice = parseFloat(priceMatch[1]);
      }

      let allItems = dataLayer.getMenu();
      if (dietaryTag) {
        allItems = allItems.filter((i) => i.dietaryTags.includes(dietaryTag!));
      }
      if (maxPrice) {
        allItems = allItems.filter((i) => i.basePrice <= maxPrice!);
      }

      tools.push({
        id: `tool_${Date.now()}_search`,
        name: 'searchMenu',
        args: { dietaryTag, maxPrice, query: q.includes('drink') || q.includes('coffee') ? undefined : q },
        resultSummary: `Found ${allItems.length} matching menu items (${dietaryTag || 'Filtered'}${maxPrice ? `, <= $${maxPrice}` : ''})`,
        timestamp: new Date().toLocaleTimeString(),
      });

      allItems.slice(0, 3).forEach((i) => recommendedIds.push(i.id));

      if (allItems.length > 0) {
        const list = allItems.slice(0, 4).map((i) => `• **${i.name}** ($${i.basePrice.toFixed(2)}) — ${i.flavorNotes.slice(0, 2).join(', ')} [${i.dietaryTags.join(', ')}]`).join('\n');
        responseText = `I found **${allItems.length}** item${allItems.length > 1 ? 's' : ''} matching your criteria:\n\n${list}\n\nWould you like more details or customizations for any of these?`;
      } else {
        responseText = `I couldn't find any menu items exactly matching those filters. Our baristas can happily customize any regular coffee to fit your dietary preferences!`;
      }
    } else if (q.includes('last') || q.includes('order') || q.includes('previous') || q.includes('history') || q.includes('the usual')) {
      const orders = dataLayer.getOrdersByCustomerId(customerId);
      tools.push({
        id: `tool_${Date.now()}_orders`,
        name: 'getPreviousOrders',
        args: { customerId, limit: 3 },
        resultSummary: `Retrieved ${orders.length} order records for ${customer?.name || 'Customer'}`,
        timestamp: new Date().toLocaleTimeString(),
      });

      if (orders.length > 0) {
        const last = orders[0];
        const items = last.items.map((i) => `**${i.productName}** (${i.size}, $${i.unitPrice.toFixed(2)})`).join(' and ');
        responseText = `Your most recent order was on **${new Date(last.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}** at our **${last.storeName}**.\n\nYou ordered ${items} for a total of **$${last.total.toFixed(2)}** (Earned ${last.pointsEarned} points). Would you like to reorder this or customize it today?`;
        last.items.forEach((i) => recommendedIds.push(i.productId));
      } else {
        responseText = `I couldn't find any past orders under your profile. Let me help you find a great first drink from our menu!`;
      }
    } else if (q.includes('cost') || q.includes('price') || q.includes('how much') || q.includes('ingredient') || q.includes('caffeine')) {
      const menu = dataLayer.getMenu();
      const matched = menu.find((m) => q.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes('cold brew'));
      if (matched) {
        tools.push({
          id: `tool_${Date.now()}_details`,
          name: 'getProductDetails',
          args: { productId: matched.id },
          resultSummary: `Looked up ${matched.name} price & ingredient details`,
          timestamp: new Date().toLocaleTimeString(),
        });
        const sizesStr = matched.sizes.map((s) => `${s.name} is **$${s.price.toFixed(2)}**`).join(', ');
        responseText = `Our **${matched.name}** starts at **$${matched.basePrice.toFixed(2)}**.\n\n• **Sizes & Prices**: ${sizesStr}\n• **Flavor Profile**: ${matched.flavorNotes.join(', ')}\n• **Caffeine**: ${matched.caffeineMg}mg\n• **Ingredients**: ${matched.ingredients.join(', ')}`;
        recommendedIds.push(matched.id);
      } else {
        responseText = `Here are our current prices from the menu. Our handcrafted espresso drinks and cold brews range from $4.25 to $6.75 for single-origin series.`;
      }
    } else if (q.includes('offer') || q.includes('discount') || q.includes('deal') || q.includes('promo') || q.includes('coupon') || q.includes('special')) {
      const offers = dataLayer.getOffers();
      tools.push({
        id: `tool_${Date.now()}_offers`,
        name: 'getCurrentOffers',
        args: {},
        resultSummary: `Found ${offers.length} active promotions`,
        timestamp: new Date().toLocaleTimeString(),
      });
      const list = offers.map((o) => `• **${o.title}** (Code: \`${o.code}\`): ${o.description}`).join('\n');
      responseText = `Here are our current active specials:\n\n${list}\n\nYou can apply any promo code directly during checkout!`;
    } else if (q.includes('store') || q.includes('hour') || q.includes('location') || q.includes('where') || q.includes('open') || q.includes('address')) {
      const stores = dataLayer.getStores();
      tools.push({
        id: `tool_${Date.now()}_stores`,
        name: 'getStoreInformation',
        args: {},
        resultSummary: `Retrieved all ${stores.length} store locations`,
        timestamp: new Date().toLocaleTimeString(),
      });
      const list = stores.map((s) => `• **${s.name}** at ${s.address}\n  Hours: Mon-Fri ${s.hours.monday_friday}, Sat-Sun ${s.hours.saturday_sunday} | Current wait: ~${s.currentWaitMinutes} mins`).join('\n');
      responseText = `We have 3 roastery and coffee bar locations in San Francisco:\n\n${list}`;
    } else {
      // Personalized recommendation
      tools.push({
        id: `tool_${Date.now()}_recs`,
        name: 'getRecommendations',
        args: { customerId, temperature: customer?.preferences.preferredTemperature },
        resultSummary: `Generated tailored recommendations based on ${customer?.preferences.milkPreference || 'Oat Milk'} and ${customer?.preferences.sweetnessLevel || 'Low'} sweetness`,
        timestamp: new Date().toLocaleTimeString(),
      });

      const recs = dataLayer.getMenu().filter((m) => m.temperature === 'Cold' || m.isFeatured).slice(0, 3);
      recs.forEach((r) => recommendedIds.push(r.id));
      responseText = `Based on your preference for **${customer?.preferences.preferredTemperature || 'Cold'}** beverages with **${customer?.preferences.sweetnessLevel || 'Low'} sweetness** and **${customer?.preferences.milkPreference || 'Oat Milk'}**, I recommend:\n\n1. **Signature Cold Brew** ($4.75) — Slow-steeped 20 hours for zero bitterness with natural cocoa notes.\n2. **Madagascar Oat Vanilla Latte** ($5.85) — Made with real Bourbon vanilla and Oatly Barista oat milk, ordered quarter-sweet (25%).\n3. **Nitro Velvet Draft** ($5.25) — Micro-foamed on tap for a creamy texture with 0g sugar.\n\nWould you like me to customize any of these for you?`;
    }

    return {
      response: responseText,
      recommendations: this.buildRecommendationCards(new Set(recommendedIds), customerId, query),
      sources: rag.sources,
      toolCalls: tools,
      conversationId: `conv_${customerId}_demo`,
      groundingTag: 'Grounded in CoffeeAI Knowledge Base & Preferences',
    };
  }

  private buildRecommendationCards(productIds: Set<string>, customerId: string, query: string): RecommendationCard[] {
    const customer = dataLayer.getCustomerById(customerId);
    const allMenu = dataLayer.getMenu();
    const cards: RecommendationCard[] = [];

    const idsToInclude = productIds.size > 0 ? Array.from(productIds) : allMenu.slice(0, 3).map((m) => m.id);

    idsToInclude.slice(0, 3).forEach((id) => {
      const prod = allMenu.find((m) => m.id === id);
      if (prod) {
        let reason = `Popular in ${prod.category}`;
        if (customer) {
          if (prod.temperature.toLowerCase() === customer.preferences.preferredTemperature.toLowerCase()) {
            reason = `Matches your ${customer.preferences.preferredTemperature} temperature & ${customer.preferences.sweetnessLevel} sweetness profile.`;
          } else if (customer.preferences.favoriteProductIds.includes(prod.id)) {
            reason = `One of your saved favorite drinks.`;
          }
        }

        cards.push({
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.basePrice,
          imageUrl: prod.imageUrl,
          reason,
          matchingTags: prod.dietaryTags.slice(0, 3),
          temperature: prod.temperature,
          sweetnessLevel: prod.sweetnessLevel,
          caffeineMg: prod.caffeineMg,
        });
      }
    });

    return cards;
  }

  private deriveGroundingTag(sources: GroundingSource[], toolCalls: ToolCallRecord[]): string {
    const types = new Set(sources.map((s) => s.type));
    if (toolCalls.length > 0) {
      return `Grounded via ${toolCalls.length} Live Agent Tool${toolCalls.length > 1 ? 's' : ''} & Menu RAG`;
    }
    if (types.has('customer_profile') && types.has('menu')) {
      return 'Grounded in Menu Data & Customer Taste Profile';
    }
    if (types.has('order_history')) {
      return 'Grounded in Customer Order History';
    }
    if (types.has('faq')) {
      return 'Grounded in Roastery FAQ & Barista Sourcing Guide';
    }
    return 'Grounded in CoffeeAI Knowledge Base';
  }
}

export const coffeeAgent = new CoffeeAgent();
