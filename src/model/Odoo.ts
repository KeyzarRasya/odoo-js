import {Model} from "./Model";

export interface OdooConfig {
    apiKey: string;
    baseUrl: string;
}

export class Odoo {
    private configuration: OdooConfig;

    constructor(configuration: OdooConfig) {
        this.configuration = configuration;
    }

    model(modelName: string): Model {
        return new Model(this.configuration, modelName)
    }
}