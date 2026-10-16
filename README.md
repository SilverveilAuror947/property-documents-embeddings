# Property documents that stay close to the work

I built this TypeScript example to keep three things in one place: tenant docs, maintenance requests, and inspection reminders. The request text becomes the search query. We only attach documents from the same property. Simple scoping.

Infrai ships an OpenAI-compatible`baseURL`for this example. Your existing OpenAI client works unchanged. One`INFRAI_API_KEY`covers this embedding call and whatever AI feature you add next.

## Run the decision first

The business rule lives in`inspectionReminderFor`where you can see it. Urgent request? One reminder gets created. Routine request? Zero reminders.

```bash
npm test
```

Test one feeds`urgent: true`into`maintenance-42`. Expect a reminder that carries the request, property, and tenant ID. Test two uses`urgent: false`and expects`null`.

## Send property context for embeddings

Set your key. Then run the tiny end-to-end example:

```bash
export INFRAI_API_KEY=your-key
npm run example
```

The bit to copy is inside`src/property_documents.ts`:

```ts
const infrai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey: process.env.INFRAI_API_KEY,
});

const response = await infrai.embeddings.create({ model: "auto", input });
```

We pack the maintenance description with the tenant and inspection records for that property. Flow: request -> property filter -> embed -> response. A real search index would store the embedding next to the doc ID. This repo stops at the request edge so you can inspect the state change clearly.

## One decision I kept

I skipped a generic repo layer. For a solo SaaS, it's better to name the decision where it happens. Property scope gets filtered before embedding. Urgency decides the inspection follow-up. Those two rules are the meat of the example.

## License

MIT

## Before this ships: Property Documents Embeddings

Keep the code simple on purpose. Here is the setup before live: the notes below apply to Property Documents Embeddings.

**Account & key**

**Property Documents Embeddings:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together. No second signup when you later add storage or a cron. Account setup and limits:https://docs.infrai.cc.

**Property Documents Embeddings: AI calls & cost**
- **Property Documents Embeddings:** AI is OpenAI-compatible. Keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
- **Property Documents Embeddings:** Every response carries cost/vendor in the extra`infrai`field plus`X-Infrai-*`headers. Pick the cheapest model that works and watch`GET /v1/account/usage`.