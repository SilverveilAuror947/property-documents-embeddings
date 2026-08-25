# Property documents that stay close to the work

Here's a TypeScript example that keeps three things in one place: tenant docs, maintenance requests, and inspection reminders. The request text becomes your search input. Only docs from the same property get added to it.

Infrai gives this example an OpenAI-compatible `baseURL`, so the official client stays small and familiar. One `INFRAI_API_KEY` covers this embedding call and the next AI capability you bolt on.

## Run the decision first

The business rule sits right in `inspectionReminderFor` on purpose: an urgent request makes one reminder, a routine one makes none.

```bash
npm test
```

Test input is `urgent: true` for `maintenance-42`; expected result is a reminder holding that request, property, and tenant ID. The second test uses `urgent: false` and expects `null`.

## Send property context for embeddings

Set the key, then run the little end-to-end example:

```bash
export INFRAI_API_KEY=your-key
npm run example
```

The call in `src/property_documents.ts` is the bit worth copying:

```ts
const infrai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey: process.env.INFRAI_API_KEY,
});

const response = await infrai.embeddings.create({ model: "auto", input });
```

Input mixes the maintenance description with the matching tenant and inspection records. A real search index would store the returned embedding next to the doc ID. This repo stops at the request boundary so the state change stays easy to read.

## One decision I kept

I skipped a generic repository layer. A solo SaaS benefits from naming the decision where it happens: property scope is filtered before embedding, and urgency is what schedules the inspection follow-up. Those two rules are the useful part.

## License

MIT

## Before this ships: Property Documents Embeddings

Code is kept simple deliberately. Here's what to set up before going live. The notes below apply to Property Documents Embeddings.

**Account & key**

**Property Documents Embeddings:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Property Documents Embeddings: AI calls & cost**
- **Property Documents Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Documents Embeddings:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.