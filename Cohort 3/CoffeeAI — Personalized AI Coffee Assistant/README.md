# CoffeeAI — Intelligent Customer-Facing Agent & Roastery Platform

An intelligent, full-stack conversational coffee bar agent powered by **Google Gemini**, semantic **RAG (Retrieval-Augmented Generation)**, multi-step **Function Calling Tools**, and interactive customer loyalty management.

CoffeeAI acts as a customer-facing virtual barista that remembers personal taste profiles, retrieves specialty bean origins and roasting standards, searches live menu inventories, calculates orders, and provides grounded recommendations.

---

## 🌟 Key Features

### 1. Intelligent AI Barista Agent
- **Gemini-Powered Natural Language Interface**: Converse naturally with an agent that understands specialty coffee terminology, extraction styles, caffeine levels, and allergens.
- **Dynamic Tool Calling Loop**: Gemini autonomously invokes database tools (`searchMenu`, `getPreviousOrders`, `getCustomerProfile`, `getProductDetails`, `getRecommendations`, `getCurrentOffers`, `getStoreInformation`, `checkProductAvailability`) in multi-turn reasoning chains.
- **Adaptive Grounding Sources & Inspector**: Live visual panel in the UI displaying all retrieved RAG sources, execution latency, tools called, and confidence scores.

### 2. Multi-Signal Semantic RAG Pipeline
- **Hybrid Retrieval Engine**: In-memory vector-style retrieval indexing 6 distinct roastery datasets (`FAQ & Sourcing Philosophy`, `12 Handcrafted Menu Products`, `Customer Profiles & Taste Settings`, `Historic Orders`, `Active Promotions`, and `Store Locations`).
- **Personalization-Biased Scoring**: Dynamic TF-IDF, bigram phrase matching, allergen negative penalties, and automatic injection of the active customer's milk, sweetness, and temperature preferences.

### 3. Customer Profile & Personalization Hub
- **Taste Profile Management**: Granular control over milk alternatives (Oat, Almond, Coconut, Whole, Skim, Soy), exact sweetness percentages (0% to 100%), temperature preferences, and dietary restrictions (Vegan, Dairy-Free, Gluten-Free, Keto).
- **Customer Switcher**: Switch between multi-persona profiles (e.g., Alex Chen — *Gold Bean Member, Cold Brew enthusiast* vs. Maya Patel — *Oat Milk Matcha fan*) to test agent personalization in real-time.

### 4. Interactive Menu & Ordering
- **Full 12-Item Specialty Catalog**: Single-origin pour-overs, nitro drafts, espresso drinks, botanical teas, and artisan bakery items with full macro and allergen breakdowns.
- **Quick Order & Customizer Modal**: Customize cup sizes, milk bases, sweetness levels, ice amounts, and espresso shots with real-time price recalculations.
- **Loyalty & Rewards Ledger**: Earn 10 points per order dollar with real-time tracking, badge upgrades, and tier progression.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Tailwind UI               │
│  (Chat, Live Menu, Preferences Hub, Inspector Modal)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON / REST API
┌───────────────────────────▼────────────────────────────┐
│                    Express.js Backend                  │
│                     (Port 3000)                        │
├────────────────────────────────────────────────────────┤
│  /api/chat         /api/menu       /api/customer       │
│  /api/offers       /api/stores     /api/health         │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
│  RAG Engine │      │ Tool Engine │      │  Data Layer │
│(retriever.ts│      │(executor.ts)│      │(dataLayer.ts│
│ 6 Datasets) │      │  8 Tools    │      │ In-Memory DB│
└──────┬──────┘      └──────┬──────┘      └─────────────┘
       │                    │
┌──────▼────────────────────▼────────────────────────────┐
│             @google/genai (Gemini Models)              │
│       Multi-turn Tool Calling & Context Grounding      │
└────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Directory Structure

```
├── data/                          # Ground Truth Datasets
│   ├── customers.json             # Profiles, loyalty points, dietary preferences
│   ├── faq.txt                    # Roasting policies, decaf process, certifications
│   ├── menu.json                  # 12 handcrafted items with allergens & tasting notes
│   ├── offers.json                # Active promo codes and discount rules
│   ├── orders.json                # Historic order receipts and item customizations
│   └── stores.json                # Roastery locations, wait times, hours, gear
├── server/                        # Backend Service (Node.js / Express)
│   ├── agent/
│   │   ├── coffeeAgent.ts         # Agent orchestrator, prompt synthesis, fallback
│   │   └── memory.ts              # Short-term conversational context buffers
│   ├── rag/
│   │   └── retriever.ts           # Multi-source semantic RAG retrieval engine
│   ├── routes/
│   │   └── api.ts                 # Express REST endpoints
│   ├── services/
│   │   ├── dataLayer.ts           # JSON data persistence & mutation layer
│   │   └── geminiClient.ts        # @google/genai SDK singleton client
│   ├── tools/
│   │   ├── declarations.ts        # Gemini Tool Function Declarations
│   │   └── executor.ts            # Tool handlers executing data lookups
│   └── config.ts                  # Server environment configuration
├── src/                           # Frontend Application (React 19 + Tailwind CSS)
│   ├── components/
│   │   ├── ChatView.tsx           # Interactive AI Barista chat with source tags
│   │   ├── HomeView.tsx           # Hero dashboard with quick actions & features
│   │   ├── MenuView.tsx           # Category tabs, filter search, and drink cards
│   │   ├── Navbar.tsx             # Top navigation & active customer switcher
│   │   ├── OrdersView.tsx         # Order history timeline and status tracking
│   │   ├── PreferencesView.tsx    # Live customer taste profile tuning controls
│   │   ├── ProductDetailModal.tsx # Nutritional specs, tasting notes & macro info
│   │   ├── QuickOrderModal.tsx    # Drink customizer & checkout flow
│   │   └── TestScenariosModal.tsx # Pre-loaded interactive testing queries
│   ├── App.tsx                    # Top-level view routing and global state
│   ├── index.css                  # Tailwind styles
│   ├── main.tsx                   # React root mount
│   └── types.ts                   # Unified TypeScript data types and schemas
├── index.html                     # Web entry point
├── metadata.json                  # AI Studio Applet configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler & Tailwind configuration
└── server.ts                      # Full-stack server entry point (API + Vite proxy)
```

---

## 🛠️ Gemini Agent Tools

The agent is equipped with 8 declared tools defined in `server/tools/declarations.ts` and executed in `server/tools/executor.ts`:

| Tool Name | Purpose | Example Parameters |
| :--- | :--- | :--- |
| `searchMenu` | Filters drinks by category, temperature, dietary tags, max price, or caffeine level. | `{ "dietaryTag": "Vegan", "maxPrice": 5.0 }` |
| `getProductDetails` | Retrieves exact cup sizes, prices, ingredients, allergens, and flavor notes. | `{ "productId": "prod_cold_brew_01" }` |
| `getCustomerProfile` | Loads loyalty tier, points balance, milk/sweetness preferences, and saved favorites. | `{ "customerId": "cust_alex_01" }` |
| `getPreviousOrders` | Fetches previous order receipts, item customizations, and timestamps. | `{ "customerId": "cust_alex_01", "limit": 3 }` |
| `getRecommendations` | Computes drinks matching the customer's taste profile and temperature choice. | `{ "customerId": "cust_alex_01", "temperature": "Cold" }` |
| `getCurrentOffers` | Returns valid promotional coupons (`MORNING15`, `FREEPLANTMILK`) and rules. | `{}` |
| `getStoreInformation` | Returns roastery addresses, operating hours, real-time wait times, and equipment. | `{ "storeId": "store_downtown_01" }` |
| `checkProductAvailability` | Verifies real-time stock and equipment status at a specific store location. | `{ "storeId": "store_downtown_01", "productId": "prod_cold_brew_01" }` |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, menu count, and roastery store count |
| `POST` | `/api/chat` | Main conversational agent endpoint with RAG context & tool grounding |
| `GET` | `/api/menu` | Complete roastery product catalog |
| `GET` | `/api/menu/:id` | Single product details with nutritional and size data |
| `GET` | `/api/customer/:id` | Retrieve customer profile and taste preferences |
| `PUT` | `/api/customer/:id/preferences` | Update customer taste settings (sweetness %, milk, etc.) |
| `GET` | `/api/customer/:id/orders` | Customer order history ledger |
| `POST` | `/api/customer/:id/orders` | Place a new order and earn loyalty points |
| `GET` | `/api/offers` | Active roastery promotional codes and discounts |
| `GET` | `/api/stores` | Store locations, hours, and real-time wait times |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or bun

### 1. Installation
```bash
git clone <repository-url>
cd coffeeai-barista
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```
*(Note: If running in Google AI Studio, `GEMINI_API_KEY` is injected automatically via the platform secrets).*

### 3. Development Server
Starts the full-stack server on port `3000` (serving Express API routes and Vite frontend with middleware):
```bash
npm run dev
```

### 4. Production Build & Execution
```bash
npm run build
npm start
```

### 5. Type Checking & Linting
```bash
npm run lint
```

---

## 🧪 Test Scenarios

Try sending these prompts to the AI Barista in the chat view:

1. **Preference Grounding**: *"What cold drinks do you have with low sweetness?"*
2. **Order History**: *"What did I order last time and from which store?"*
3. **Dietary & Price Search**: *"Can you search your menu for vegan drinks under 5 dollars?"*
4. **Loyalty Status**: *"What is my current loyalty points balance and membership tier?"*
5. **Roastery Policies (RAG FAQ)**: *"How do you decaffeinate your coffee?"* or *"Is your oat milk gluten-free?"*
6. **Promotions & Offers**: *"Do you have any discount codes or morning specials today?"*

---

## 📄 License
MIT License. Built for conversational AI and specialty roastery exploration.
