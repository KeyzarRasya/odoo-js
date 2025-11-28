# Odoo JS Connector

This is a lightweight JavaScript/TypeScript library for connecting to an Odoo instance via its JSON/2 endpoint. It provides a simple and intuitive API for interacting with your Odoo models.

## Installation

```bash
npm install odoo-js-connector
```

## Usage

### Initialization

First, you need to create an instance of the `Odoo` class with your Odoo configuration.

```typescript
import { Odoo } from 'odoo-js-connector';

const odoo = new Odoo({
  baseUrl: 'https://your-odoo-instance.com',
  apiKey: 'your-api-key'
});
```

### Creating records

To create a new record for a model, you can use the `create` method on a `Model` instance.

```typescript
const model = odoo.model('res.partner');

model.create({ name: 'New Partner' })
  .then(result => {
    console.log('Created record:', result);
  })
  .catch(error => {
    console.error('Error creating record:', error);
  });
```

### Searching records

You can search for records using the `search_read` method. It takes a domain to filter the records and a list of fields to return.

```typescript
const model = odoo.model('res.partner');

model.search_read([['is_company', '=', true]], ['name', 'email'])
  .then(result => {
    console.log('Found records:', result);
  })
  .catch(error => {
    console.error('Error searching records:', error);
  });
```

### Updating records

To update a record, you first need to get a `ModelExecutable` instance by calling the `id` method with the record's ID. Then you can use the `write` method to update the record.

```typescript
const model = odoo.model('res.partner');

model.id(123).write({ name: 'Updated Partner Name' })
  .then(() => {
    console.log('Record updated successfully');
  })
  .catch(error => {
    console.error('Error updating record:', error);
  });
```

## API Reference

### `Odoo` class

#### `constructor(configuration: OdooConfig)`

Creates a new `Odoo` instance.

*   `configuration`: An object with the following properties:
    *   `baseUrl`: The base URL of your Odoo instance.
    *   `apiKey`: Your Odoo API key.

#### `model(modelName: string): Model`

Returns a `Model` instance for the specified model.

*   `modelName`: The name of the Odoo model (e.g., `'res.partner'`).

### `Model` class

#### `id(id: number): ModelExecutable`

Returns a `ModelExecutable` instance for the record with the specified ID.

*   `id`: The ID of the record.

#### `create(data: any): Promise<any>`

Creates a new record for the model.

*   `data`: An object containing the values for the new record.

#### `search_read(domains: SearchDomain[], fields: string[]): Promise<any>`

Searches for records and returns the specified fields.

*   `domains`: An array of domains to filter the records. A domain is an array of three elements: `[field, operator, value]`.
*   `fields`: An array of field names to return for the found records.

### `ModelExecutable` class

#### `write(data: any): Promise<void>`

Updates the record.

*   `data`: An object containing the fields to update and their new values.
