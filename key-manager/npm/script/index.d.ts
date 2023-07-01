export type Endpoints<EndpointName extends string> = {
    [name in EndpointName]: {
        default: {
            maxReq: number;
            duration: number;
        };
        roles?: Record<string, {
            maxReq: number;
            duration: number;
        }>;
    };
};
export type InitKeyManagerOptions<EndpointName extends string> = {
    rootAPIKey: string;
    url?: string;
    endpoints: Endpoints<EndpointName>;
};
export declare function initKeyManager<EndpointName extends string>({ rootAPIKey, url, endpoints, }: InitKeyManagerOptions<EndpointName>): {
    createUserAPIKey(prefix: string, roles?: Array<string>): Promise<{
        success: true;
        apiKey: string;
        id: string;
        roles: string[];
    } | {
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        error: "invalidId";
        success: false;
        reason: string;
    }>;
    deleteUserAPIKey(id: string): Promise<{
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        error: "invalidId";
        success: false;
        reason: string;
    } | {
        success: true;
        id: string;
    }>;
    rotateUserAPIKey(id: string): Promise<{
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        error: "invalidId";
        success: false;
        reason: string;
    } | {
        success: true;
        id: string;
        apikey: string;
    }>;
    addRoles(userAPIKeyId: string, roles: Array<string>): Promise<{
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        error: "invalidId";
        success: false;
        reason: string;
    } | {
        success: true;
        count: number;
    }>;
    removeRoles(userAPIKeyId: string, roles: Array<string>): Promise<{
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        error: "invalidId";
        success: false;
        reason: string;
    } | {
        success: true;
        count: number;
    }>;
    verifyUserAPIKey(userAPIKey: string, endpointName: EndpointName, variables?: Array<string>): Promise<{
        error: "authorizationHeaderNotPresent";
        success: false;
        reason: string;
    } | {
        error: "apiTokenNotPresent";
        success: false;
        reason: string;
    } | {
        error: "invalidAPIToken";
        success: false;
        reason: string;
    } | {
        error: "invalidBody";
        success: false;
        reason: string;
    } | {
        success: true;
        keyValid: false;
        ok: false;
    } | {
        success: true;
        keyValid: true;
        ok: boolean;
        remaining: number;
        total: number;
        reset: number;
    }>;
};
