export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    created_at: string;
}

export interface Tenant {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface TenantProduct {
    id: string;
    tenant_id: string;
    product_id: string;
    trial_ends_at: string | null;
    created_at: string;
}

export interface Subscription {
    id: string;
    tenant_id: string;
    product_id: string;
    status: SubscriptionStatus;
    mercadopago_subscription_id: string | null;
    current_period_end: string | null;
    created_at: string;
}

export interface Payment {
    id: string;
    tenant_id: string;
    product_id: string;
    mercadopago_payment_id: string;
    amount: number;
    status: string;
    paid_at: string | null;
    created_at: string;
}

// Helper types for join results
export interface SubscriptionWithDetails extends Subscription {
    tenants: Tenant;
    products: Product;
}
