import assert from "node:assert/strict";
import test from "node:test";
import { inspectionReminderFor } from "./property_documents.ts";

test("urgent maintenance creates one inspection reminder", () => {
  const reminder = inspectionReminderFor({
    id: "maintenance-42",
    propertyId: "building-a",
    tenantId: "tenant-7",
    description: "Water is leaking below the kitchen sink.",
    urgent: true,
  });
  assert.deepEqual(reminder, {
    requestId: "maintenance-42",
    propertyId: "building-a",
    tenantId: "tenant-7",
    reason: "Urgent maintenance needs an inspection reminder.",
  });
});

test("routine maintenance does not create an inspection reminder", () => {
  assert.equal(inspectionReminderFor({
    id: "maintenance-43",
    propertyId: "building-a",
    tenantId: "tenant-7",
    description: "Replace a hallway light.",
    urgent: false,
  }), null);
});
