export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// Global Puter.js declaration — loaded via CDN in app.blade.php
declare global {
    interface Window {
        puter: {
            ai: {
                chat: (
                    prompt: string | Record<string, any>[],
                    imageOrOptions?: string | Record<string, any>,
                    options?: Record<string, any>
                ) => Promise<{
                    message: { content: string; tool_calls?: any[] };
                }>;
            };
        };
    }
}

