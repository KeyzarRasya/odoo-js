import { Model } from "./Model";

export interface OdooConfig {
    apiKey: string;
    baseUrl: string;
    fetch?: typeof fetch;
}

export class Odoo {
    private configuration: OdooConfig;
    private fetchImpl: typeof fetch;

    constructor(configuration: OdooConfig) {
        this.configuration = configuration;
        this.fetchImpl = configuration.fetch ?? globalThis.fetch;
    }

    model(modelName: string): Model {
        return new Model(this.configuration, modelName, this.fetchImpl)
    }
}