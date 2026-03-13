import { error } from "console";
import type { Odoo, OdooConfig } from "./Odoo";

interface Executable {
    id: number;
    modelName: string;
    baseUrl: string;
    apiKey: string;
}

interface Authentication {
    type: string;
    login: string;
    password: string;
}

type SearchDomain = [string, string, any]

class ModelExecutable {
    private executable: Executable;
    private fetchImpl: typeof fetch;

    constructor(executable: Executable, fetchImpl: typeof fetch) {
        this.executable = executable;
        this.fetchImpl = fetchImpl;
    }

    private getHeaders(includeAuth: boolean): Record<string, string> {
        let headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            if (this.executable.apiKey) {
                headers['Authorization'] = `Bearer ${this.executable.apiKey}`
            }
        }

        return headers;
    }

    private async handleResponse(response: Response): Promise<any> {
        if (!response.ok) {
            let err: any;

            try {
                err = await response.json();
            } catch {
                err = { message: "Network Error" };
            }

            throw new Error(
                err?.message || err?.error || JSON.stringify(err) || "Unknown error"
            );
        }
        return response.json()
    }

    private async request(endpoint: string, options: any): Promise<any> {
        try {
            let url: string = `${this.executable.baseUrl}${endpoint}`;
            const response: Response = await this.fetchImpl(url, {
                ...options,
                headers: this.getHeaders(options.includeAuth !== false)
            })
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API ERROR: ${endpoint}`, error);
            throw error;
        }
    }

    async write(data: any): Promise<void> {
        return this.request(`/json/2/${this.executable.modelName}/write`, {
            method: "POST",
            body: JSON.stringify({
                ids: [this.executable.id],
                vals: data
            })
        })
    }

    async unlink(): Promise<void> {
        return this.request(`/json/2/${this.executable.modelName}/unlink`, {
            method: "POST",
            body: JSON.stringify({
                ids: [this.executable.id]
            })
        })
    }

    async action(actionName: string): Promise<void> {
        return this.request(`/json/2/${this.executable.modelName}/${actionName}`, {
            method: "POST",
            body: JSON.stringify({
                ids: [this.executable.id]
            })
        })
    }
}

export class Model {
    private odooConfig: OdooConfig;
    private modelName: string;
    private fetchImpl: typeof fetch;

    constructor(odooConfiguration: OdooConfig, modelName: string, fetchImpl: typeof fetch) {
        this.odooConfig = odooConfiguration;
        this.modelName = modelName;
        this.fetchImpl = fetchImpl;
    }

    private getHeaders(includeAuth: boolean): Record<string, string> {
        let headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            if (this.odooConfig.apiKey) {
                headers['Authorization'] = `Bearer ${this.odooConfig.apiKey}`
            }
        }

        return headers;
    }

    private async handleResponse(response: Response): Promise<any> {
        if (!response.ok) {
            let err: any;

            try {
                err = await response.json();
            } catch {
                err = { message: "Network Error" };
            }

            throw new Error(
                err?.message || err?.error || JSON.stringify(err) || "Unknown error"
            );
        }
        return response.json()
    }

    private async request(endpoint: string, options: any): Promise<any> {
        try {
            let url: string = `${this.odooConfig.baseUrl}${endpoint}`;
            const response: Response = await this.fetchImpl(url, {
                ...options,
                headers: this.getHeaders(options.includeAuth !== false)
            })
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API ERROR: ${endpoint}`, error);
            throw error;
        }
    }

    id(id: number): ModelExecutable {
        return new ModelExecutable({
            id: id,
            modelName: this.modelName,
            baseUrl: this.odooConfig.baseUrl,
            apiKey: this.odooConfig.apiKey
        }, this.fetchImpl);
    }

    async create(data: any): Promise<any> {
        return this.request(`/json/2/${this.modelName}/create`, {
            method: "POST",
            body: JSON.stringify({ vals_list: data })
        });
    }

    async search_read(domains: SearchDomain[], fields: string[]): Promise<any> {
        return this.request(`/json/2/${this.modelName}/search_read`, {
            method: "POST",
            body: JSON.stringify({ domain: domains, fields: fields })
        })
    }

    async authenticate(authentication: Authentication): Promise<any> {
        return this.request(`/json/2/${this.modelName}/authenticate`, {
            method: 'POST',
            body: JSON.stringify({
                ids: [],
                context: {},
                credential: authentication,
                user_agent_env: {}
            })
        })
    }

}

