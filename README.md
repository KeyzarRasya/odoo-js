# @keyzar/odoo-js Documentation

A lightweight JavaScript/TypeScript library for connecting to Odoo via the **Odoo JSON API**.
Framework-friendly — works with SvelteKit, Next.js, Nuxt, and any environment that provides a custom `fetch`.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [OdooConfig](#odooconfig)
  - [Custom Fetch (SvelteKit / SSR)](#custom-fetch-sveltekit--ssr)
- [API Reference](#api-reference)
  - [Odoo](#odoo)
    - [constructor](#new-odooconfiguration-odooconfig)
    - [model](#modelmodelname-string-model)
  - [Model](#model)
    - [search_read](#search_readdomains-fields)
    - [create](#createdata)
    - [id](#idid-number)
    - [authenticate](#authenticateauthentication)
  - [ModelExecutable](#modelexecutable)
    - [write](#writedata)
    - [unlink](#unlink)
    - [action](#actionactionname)
- [Usage with SvelteKit](#usage-with-sveltekit)
  - [Server Load Function](#server-load-function)
  - [Creating a Reusable Odoo Client](#creating-a-reusable-odoo-client)
  - [Using in +page.server.ts](#using-in-pageserverts)
  - [Using in +page.svelte](#using-in-pagesvelte)
- [Search Domains](#search-domains)
- [Error Handling](#error-handling)
- [Full Examples](#full-examples)

---

## Installation

```bash
npm install @keyzar/odoo-js
```

---

## Quick Start

```typescript
import { Odoo } from "@keyzar/odoo-js";

const odoo = new Odoo({
    baseUrl: "https://your-odoo-instance.com",
    apiKey: "YOUR_API_KEY"
});

// Read records
const partners = await odoo
    .model("res.partner")
    .search_read([], ["name", "email"]);

console.log(partners);
```

---

## Configuration

### OdooConfig

| Property  | Type             | Required | Description                                                                 |
|-----------|------------------|----------|-----------------------------------------------------------------------------|
| `baseUrl` | `string`         | ✅       | The base URL of your Odoo instance (e.g. `https://mycompany.odoo.com`)     |
| `apiKey`  | `string`         | ✅       | Your Odoo API key, used as a Bearer token in the `Authorization` header    |
| `fetch`   | `typeof fetch`   | ❌       | A custom `fetch` implementation. Defaults to `globalThis.fetch` if omitted |

```typescript
import type { OdooConfig } from "@keyzar/odoo-js";

const config: OdooConfig = {
    baseUrl: "https://your-odoo-instance.com",
    apiKey: "YOUR_API_KEY"
};
```

### Custom Fetch (SvelteKit / SSR)

Frameworks like **SvelteKit** provide a special `fetch` inside `load()` functions that handles cookie forwarding, SSR, and internal request optimization. Pass it via the `fetch` config option:

```typescript
const odoo = new Odoo({
    baseUrl: "https://your-odoo-instance.com",
    apiKey: "YOUR_API_KEY",
    fetch: svelteKitFetch  // provided by the framework
});
```

If you omit the `fetch` property, the library uses `globalThis.fetch` — which works in browsers and Node.js 18+.

---

## API Reference

### Odoo

The main entry point for the library.

#### `new Odoo(configuration: OdooConfig)`

Creates a new Odoo client instance.

```typescript
import { Odoo } from "@keyzar/odoo-js";

const odoo = new Odoo({
    baseUrl: "https://your-odoo-instance.com",
    apiKey: "YOUR_API_KEY"
});
```

#### `model(modelName: string): Model`

Returns a `Model` instance bound to the specified Odoo model.

| Parameter   | Type     | Description                                         |
|-------------|----------|-----------------------------------------------------|
| `modelName` | `string` | The Odoo model name (e.g. `res.partner`, `crm.lead`) |

```typescript
const partnerModel = odoo.model("res.partner");
```

---

### Model

Represents an Odoo model and provides methods for querying and creating records.

#### `search_read(domains, fields)`

Search for records matching the given domain filters and return the specified fields.

```typescript
search_read(
    domains: [string, string, any][],
    fields: string[]
): Promise<any>
```

| Parameter | Type                       | Description                                       |
|-----------|----------------------------|---------------------------------------------------|
| `domains` | `[string, string, any][]`  | Array of domain filter tuples (see [Search Domains](#search-domains)) |
| `fields`  | `string[]`                 | List of field names to return                     |

**Returns:** `Promise<any>` — An array of matching records.

```typescript
// Get all partners
const allPartners = await odoo
    .model("res.partner")
    .search_read([], ["name", "email", "phone"]);

// Get partners named "John"
const johns = await odoo
    .model("res.partner")
    .search_read(
        [["name", "ilike", "John"]],
        ["name", "email"]
    );

// Multiple domain conditions (AND logic)
const activeCustomers = await odoo
    .model("res.partner")
    .search_read(
        [
            ["customer_rank", ">", 0],
            ["active", "=", true]
        ],
        ["name", "email", "customer_rank"]
    );
```

---

#### `create(data)`

Create one or more new records.

```typescript
create(data: any): Promise<any>
```

| Parameter | Type  | Description                                              |
|-----------|-------|----------------------------------------------------------|
| `data`    | `any` | An object (or array of objects) with the field values     |

**Returns:** `Promise<any>` — The created record ID(s).

```typescript
// Create a single record
const newId = await odoo.model("res.partner").create({
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1234567890"
});

// Create multiple records
const newIds = await odoo.model("res.partner").create([
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" }
]);
```

---

#### `id(id: number): ModelExecutable`

Select a specific record by its ID, returning a `ModelExecutable` with write/delete/action methods.

| Parameter | Type     | Description             |
|-----------|----------|-------------------------|
| `id`      | `number` | The ID of the record    |

```typescript
const partner = odoo.model("res.partner").id(42);
```

---

#### `authenticate(authentication)`

Authenticate a user against the Odoo instance.

```typescript
authenticate(authentication: {
    type: string;
    login: string;
    password: string;
}): Promise<any>
```

| Parameter        | Type     | Description                       |
|------------------|----------|-----------------------------------|
| `type`           | `string` | Authentication type               |
| `login`          | `string` | The user's login / email          |
| `password`       | `string` | The user's password               |

**Returns:** `Promise<any>` — Authentication result from Odoo.

```typescript
const authResult = await odoo.model("res.users").authenticate({
    type: "password",
    login: "admin@example.com",
    password: "secret"
});
```

---

### ModelExecutable

Returned by `Model.id()`. Operates on a single record by ID.

#### `write(data)`

Update fields on the selected record.

```typescript
write(data: any): Promise<void>
```

| Parameter | Type  | Description                          |
|-----------|-------|--------------------------------------|
| `data`    | `any` | Object with field names and values   |

```typescript
await odoo.model("res.partner").id(42).write({
    name: "Jane Doe Updated",
    email: "jane.updated@example.com"
});
```

---

#### `unlink()`

Delete the selected record.

```typescript
unlink(): Promise<void>
```

```typescript
await odoo.model("res.partner").id(42).unlink();
```

---

#### `action(actionName)`

Trigger a server action or method on the selected record.

```typescript
action(actionName: string): Promise<void>
```

| Parameter    | Type     | Description                                    |
|--------------|----------|------------------------------------------------|
| `actionName` | `string` | The name of the action / method to execute     |

```typescript
// Confirm a sale order
await odoo.model("sale.order").id(15).action("action_confirm");

// Mark an invoice as sent
await odoo.model("account.move").id(100).action("action_invoice_sent");
```

---

## Usage with SvelteKit

### Server Load Function

The most straightforward usage—pass SvelteKit's `fetch` directly:

```typescript
// src/routes/partners/+page.server.ts
import { Odoo } from "@keyzar/odoo-js";
import { ODOO_API_KEY, ODOO_BASE_URL } from "$env/static/private";

export async function load({ fetch }) {
    const odoo = new Odoo({
        baseUrl: ODOO_BASE_URL,
        apiKey: ODOO_API_KEY,
        fetch
    });

    const partners = await odoo
        .model("res.partner")
        .search_read(
            [["customer_rank", ">", 0]],
            ["name", "email", "phone"]
        );

    return { partners };
}
```

### Creating a Reusable Odoo Client

For larger projects, create a helper that accepts SvelteKit's `fetch`:

```typescript
// src/lib/server/odoo.ts
import { Odoo } from "@keyzar/odoo-js";
import { ODOO_API_KEY, ODOO_BASE_URL } from "$env/static/private";

export function createOdoo(fetchFn: typeof fetch) {
    return new Odoo({
        baseUrl: ODOO_BASE_URL,
        apiKey: ODOO_API_KEY,
        fetch: fetchFn
    });
}
```

### Using in +page.server.ts

```typescript
// src/routes/leads/+page.server.ts
import { createOdoo } from "$lib/server/odoo";

export async function load({ fetch }) {
    const odoo = createOdoo(fetch);

    const leads = await odoo
        .model("crm.lead")
        .search_read([], ["name", "contact_name", "email_from", "stage_id"]);

    return { leads };
}
```

```typescript
// src/routes/leads/[id]/+page.server.ts
import { createOdoo } from "$lib/server/odoo";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
    const odoo = createOdoo(fetch);
    const id = parseInt(params.id);

    const results = await odoo
        .model("crm.lead")
        .search_read(
            [["id", "=", id]],
            ["name", "contact_name", "email_from", "phone", "expected_revenue"]
        );

    if (!results || results.length === 0) {
        throw error(404, "Lead not found");
    }

    return { lead: results[0] };
}
```

### Using in +page.svelte

Display the data returned by the load function:

```svelte
<!-- src/routes/leads/+page.svelte -->
<script lang="ts">
    export let data;
</script>

<h1>CRM Leads</h1>

<ul>
    {#each data.leads as lead}
        <li>
            <a href="/leads/{lead.id}">
                <strong>{lead.name}</strong>
            </a>
            — {lead.contact_name || "No contact"} ({lead.email_from || "No email"})
        </li>
    {/each}
</ul>
```

---

## Search Domains

Domains are arrays of filter tuples. Each tuple has three elements:

```
[field_name, operator, value]
```

### Operators

| Operator   | Description                     | Example                                |
|------------|---------------------------------|----------------------------------------|
| `=`        | Equals                          | `["state", "=", "done"]`              |
| `!=`       | Not equals                      | `["state", "!=", "cancel"]`           |
| `>`        | Greater than                    | `["amount", ">", 1000]`               |
| `>=`       | Greater than or equal           | `["amount", ">=", 500]`               |
| `<`        | Less than                       | `["amount", "<", 100]`                |
| `<=`       | Less than or equal              | `["amount", "<=", 200]`               |
| `like`     | Pattern match (case-sensitive)  | `["name", "like", "Tech"]`            |
| `ilike`    | Pattern match (case-insensitive)| `["name", "ilike", "tech"]`           |
| `in`       | Value in list                   | `["state", "in", ["draft", "sent"]]`  |
| `not in`   | Value not in list               | `["state", "not in", ["cancel"]]`     |
| `=like`    | SQL LIKE with wildcards         | `["email", "=like", "%@gmail.com"]`   |
| `=ilike`   | Case-insensitive SQL LIKE       | `["email", "=ilike", "%@Gmail.com"]`  |

### Examples

```typescript
// No filters — get all records
[]

// Single condition
[["active", "=", true]]

// Multiple conditions (implicit AND)
[
    ["state", "=", "sale"],
    ["amount_total", ">", 500]
]

// Using 'in' operator
[["stage_id", "in", [1, 2, 3]]]

// Partial text search
[["name", "ilike", "consulting"]]
```

---

## Error Handling

All methods throw on failure. Wrap calls in `try/catch`:

```typescript
try {
    const partners = await odoo
        .model("res.partner")
        .search_read([], ["name"]);
} catch (error) {
    console.error("Odoo API error:", error.message);
}
```

Error messages are extracted from the Odoo JSON response in this priority:

1. `error.message`
2. `error.error`
3. Full JSON stringified response
4. `"Unknown error"`

---

## Full Examples

### CRUD Operations

```typescript
import { Odoo } from "@keyzar/odoo-js";

const odoo = new Odoo({
    baseUrl: "https://your-odoo-instance.com",
    apiKey: "YOUR_API_KEY"
});

// CREATE
const newPartnerId = await odoo.model("res.partner").create({
    name: "Acme Corp",
    email: "info@acme.com",
    is_company: true
});
console.log("Created partner:", newPartnerId);

// READ
const partners = await odoo.model("res.partner").search_read(
    [["id", "=", newPartnerId]],
    ["name", "email", "is_company"]
);
console.log("Read partner:", partners[0]);

// UPDATE
await odoo.model("res.partner").id(newPartnerId).write({
    phone: "+1 555-0100",
    website: "https://acme.com"
});
console.log("Updated partner");

// DELETE
await odoo.model("res.partner").id(newPartnerId).unlink();
console.log("Deleted partner");
```

### CRM Pipeline in SvelteKit

```typescript
// src/routes/crm/+page.server.ts
import { createOdoo } from "$lib/server/odoo";

export async function load({ fetch }) {
    const odoo = createOdoo(fetch);

    const [leads, stages] = await Promise.all([
        odoo.model("crm.lead").search_read(
            [["active", "=", true]],
            ["name", "stage_id", "expected_revenue", "contact_name"]
        ),
        odoo.model("crm.stage").search_read(
            [],
            ["name", "sequence"]
        )
    ]);

    return { leads, stages };
}
```

### Sale Order Confirmation

```typescript
// Create a sale order and confirm it
const orderId = await odoo.model("sale.order").create({
    partner_id: 42,
    order_line: [[0, 0, {
        product_id: 1,
        product_uom_qty: 5
    }]]
});

await odoo.model("sale.order").id(orderId).action("action_confirm");
console.log("Order confirmed!");
```
