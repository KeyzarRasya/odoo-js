# Odoo JS

This is a JavaScript/TypeScript library for interacting with an Odoo instance through its JSON-RPC API. It provides a simple and intuitive way to perform CRUD operations and call methods on Odoo models.

## Installation

```bash
npm install odoo-js
```

## Usage

### Initialization

First, you need to create an `Odoo` instance with your Odoo configuration.

```typescript
import { Odoo } from 'odoo-js';

const odoo = new Odoo({
  apiKey: 'YOUR_API_KEY', // Optional, if you use API Key for authentication
  baseUrl: 'https://your-odoo-instance.com',
});
```

### Selecting a Model

To interact with an Odoo model, you first need to select it using the `model()` method.

```typescript
const ResPartner = odoo.model('res.partner');
```

### Creating a Record

You can create a new record using the `create()` method. It accepts an array of objects with the data for the new records.

```typescript
const newPartner = await ResPartner.create([
  { name: 'John Doe', email: 'john.doe@example.com' },
]);

console.log(newPartner);
```

### Searching for Records

You can search for records using the `search_read()` method. It takes a domain to filter the records and a list of fields to return.

```typescript
const partners = await ResPartner.search_read(
  [['is_company', '=', true]],
  ['name', 'email']
);

console.log(partners);
```

### Updating a Record

To update a record, you first need to get a `ModelExecutable` instance by calling the `id()` method with the record's ID. Then you can use the `write()` method.

```typescript
const partner = ResPartner.id(1);

await partner.write({
  name: 'Jane Doe',
});
```

### Deleting a Record

You can delete a record using the `unlink()` method on a `ModelExecutable` instance.

```typescript
const partner = ResPartner.id(1);

await partner.unlink();
```

### Calling a Method on a Record

You can call any method on a record using the `action()` method on a `ModelExecutable` instance.

```typescript
const partner = ResPartner.id(1);

await partner.action('send_email');
```

### Authentication

You can authenticate with a username and password using the `authenticate()` method.

```typescript
const session = await odoo.model('res.users').authenticate({
    type: 'password',
    login: 'admin',
    password: 'password'
})

console.log(session)
```

## API Reference

### `Odoo`

The main class to interact with Odoo.

-   `constructor(config: OdooConfig)`: Creates a new `Odoo` instance.
    -   `config.apiKey`: Your Odoo API key.
    -   `config.baseUrl`: The base URL of your Odoo instance.
-   `model(modelName: string): Model`: Returns a `Model` instance for the given model name.

### `Model`

Represents an Odoo model.

-   `id(id: number): ModelExecutable`: Returns a `ModelExecutable` instance for the given record ID.
-   `create(data: any[]): Promise<any>`: Creates new records.
-   `search_read(domains: SearchDomain[], fields: string[]): Promise<any>`: Searches for records.
-   `authenticate(authentication: Authentication): Promise<any>`: Authenticates a user.

### `ModelExecutable`

Represents a specific record in an Odoo model.

-   `write(data: any): Promise<void>`: Updates the record.
-   `unlink(): Promise<void>`: Deletes the record.
-   `action(actionName: string): Promise<void>`: Calls a method on the record.