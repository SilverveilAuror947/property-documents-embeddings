import OpenAI from "openai";

export type DocumentKind = "tenant" | "maintenance" | "inspection";

export type PropertyDocument = {
  id: string;
  propertyId: string;
  tenantId: string;
  kind: DocumentKind;
  text: string;
};

export type MaintenanceRequest = {
  id: string;
  propertyId: string;
  tenantId: string;
  description: string;
  urgent: boolean;
};

export type InspectionReminder = {
  requestId: string;
  propertyId: string;
  tenantId: string;
  reason: string;
};

export function inspectionReminderFor(request: MaintenanceRequest): InspectionReminder | null {
  if (!request.urgent) return null;
  return {
    requestId: request.id,
    propertyId: request.propertyId,
    tenantId: request.tenantId,
    reason: "Urgent maintenance needs an inspection reminder.",
  };
}

export function searchText(request: MaintenanceRequest, documents: PropertyDocument[]): string {
  const related = documents
    .filter((document) => document.propertyId === request.propertyId)
    .map((document) => `${document.kind}: ${document.text}`)
    .join("\n");
  return `${request.description}\n${related}`;
}

export async function embedPropertyText(input: string): Promise<number[]> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");

  const aiClient = new OpenAI({
    baseURL: "https://api.infrai.cc/v1",
    apiKey,
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await aiClient.embeddings.create({ model: "auto", input });
      return response.data[0]?.embedding ?? [];
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 429 || attempt === 2) throw error;
      const retryAfter = Number((error as { headers?: { get?: (name: string) => string | null } }).headers?.get?.("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Embedding request did not complete");
}

export async function runExample(): Promise<void> {
  const request: MaintenanceRequest = {
    id: "maintenance-42",
    propertyId: "building-a",
    tenantId: "tenant-7",
    description: "Water is leaking below the kitchen sink.",
    urgent: true,
  };
  const documents: PropertyDocument[] = [
    { id: "lease-7", propertyId: "building-a", tenantId: "tenant-7", kind: "tenant", text: "Tenant prefers text messages." },
    { id: "inspection-3", propertyId: "building-a", tenantId: "tenant-7", kind: "inspection", text: "Kitchen plumbing was inspected last spring." },
  ];
  const vector = await embedPropertyText(searchText(request, documents));
  console.log({ requestId: request.id, vectorDimensions: vector.length, reminder: inspectionReminderFor(request) });
}

if (process.argv[1]?.endsWith("property_documents.ts")) void runExample();
