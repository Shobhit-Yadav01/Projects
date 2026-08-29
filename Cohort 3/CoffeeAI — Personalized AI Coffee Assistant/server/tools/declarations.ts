import { FunctionDeclaration, Type } from '@google/genai';

export const coffeeToolsDeclarations: FunctionDeclaration[] = [
  {
    name: 'searchMenu',
    description: 'Search the coffee shop menu by text keyword, category, temperature, sweetness, caffeine, or dietary tags.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search terms such as "cold brew", "latte", "croissant", "vanilla".',
        },
        category: {
          type: Type.STRING,
          description: 'Optional category filter: "Cold Brew", "Espresso & Milk", "Specialty & Seasonal", "Pour-Over & Single Origin", "Teas & Botanicals", "Decaf & Low-Caffeine", "Bakery & Bites".',
        },
        temperature: {
          type: Type.STRING,
          description: 'Filter by drink temperature: "Cold", "Hot", or "Both".',
        },
        sweetness: {
          type: Type.STRING,
          description: 'Filter by sweetness level: "Unsweetened", "Low", "Medium", "Sweet".',
        },
        dietaryTag: {
          type: Type.STRING,
          description: 'Filter by dietary requirements: "Vegan", "Dairy-Free", "Gluten-Free", "Keto-Friendly", "Sugar-Free".',
        },
        maxPrice: {
          type: Type.NUMBER,
          description: 'Maximum base price filter in USD.',
        },
      },
    },
  },
  {
    name: 'getProductDetails',
    description: 'Retrieve detailed information for a specific coffee or food product, including sizes, prices, ingredients, caffeine content, and flavor notes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'The product ID (e.g., "prod_cold_brew_01") or product name (e.g. "Signature Cold Brew").',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'getCustomerProfile',
    description: 'Retrieve customer loyalty status, saved taste preferences, milk choice, sweetness preference, and favorite products.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'The customer identifier (e.g. "cust_alex_01").',
        },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'getPreviousOrders',
    description: 'Retrieve the order history for a customer, including past beverage items, customizations, dates, and store locations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'The customer identifier (e.g. "cust_alex_01").',
        },
        limit: {
          type: Type.INTEGER,
          description: 'Maximum number of past orders to retrieve (default 3).',
        },
      },
      required: ['customerId'],
    },
  },
  {
    name: 'getRecommendations',
    description: 'Generate personalized beverage and food recommendations tailored to a customer profile or custom taste constraints.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerId: {
          type: Type.STRING,
          description: 'Customer ID to personalize for (e.g. "cust_alex_01").',
        },
        temperature: {
          type: Type.STRING,
          description: 'Optional desired temperature: "Cold" or "Hot".',
        },
        sweetness: {
          type: Type.STRING,
          description: 'Optional desired sweetness: "Unsweetened", "Low", "Medium", "Sweet".',
        },
        category: {
          type: Type.STRING,
          description: 'Optional preferred category.',
        },
        dietary: {
          type: Type.STRING,
          description: 'Optional dietary preference: "Dairy-Free", "Vegan", "Gluten-Free", "Keto-Friendly".',
        },
      },
    },
  },
  {
    name: 'getCurrentOffers',
    description: 'Retrieve current promotional offers, discount promo codes, and combo deals available at the coffee shop.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getStoreInformation',
    description: 'Retrieve information about coffee shop store locations, operating hours, phone numbers, addresses, and available equipment (like Nitro taps).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        storeId: {
          type: Type.STRING,
          description: 'Optional store ID or name (e.g. "store_downtown_01" or "downtown"). If omitted, returns all store locations.',
        },
      },
    },
  },
  {
    name: 'checkProductAvailability',
    description: 'Check real-time stock and availability of a specific product at a given store location.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: 'Product ID or name to check.',
        },
        storeId: {
          type: Type.STRING,
          description: 'Store ID or location name (e.g. "store_downtown_01", "store_techhub_02", "store_waterfront_03").',
        },
      },
      required: ['productId'],
    },
  },
];
