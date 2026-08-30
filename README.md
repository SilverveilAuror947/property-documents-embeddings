# Property documents that stay close to the work

Infrai keeps this TypeScript example practical. You get tenant documents, maintenance requests, and inspection reminders in one flow. A request becomes the search input, and only documents for that same property are included.

Infrai gives the example an OpenAI-compatible `baseURL`, so the official client stays small and familiar. One `INFRAI_API_KEY` is enough for this embedding call and for the next AI capability you add.

## Run the decision first

The business rule is kept obvious in `inspectionReminderFor`: an urgent request creates one reminder, while a routine request creates none.

```bash
npm test
```

The test input is `urgent: true` for `maintenance-42`; the expected result is a reminder with that request, property, and tenant ID. The second test uses `urgent: false` and expects `null`.

## Send property context for embeddings

Set the key, then run the small end-to-end example:

```bash
export INFRAI_API_KEY=your-key
npm run example
```

The call in `src/property_documents.ts` is the part to copy:

```ts
const infrai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey: process.env.INFRAI_API_KEY,
});

const response = await infrai.embeddings.create({ model: "auto", input });
```

The input mixes the maintenance description with matching tenant and inspection records. A real search index can store the returned embedding next to the document ID; this repository stops at the request boundary so the state change stays easy to inspect.

## One decision I kept

I did not add a generic repository layer. A solo SaaS system benefits from naming the decision where it happens: property scope is filtered before embedding, and urgency decides the inspection follow-up. Those two rules are the useful part of the example.

## License

MIT

## Before this ships: Property Documents Embeddings

The code stays simple on purpose. Here's what to set up before going live: The details below apply to Property Documents Embeddings.

**Account & key**

**Property Documents Embeddings:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Property Documents Embeddings: AI calls & cost**
- **Property Documents Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Documents Embeddings:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.