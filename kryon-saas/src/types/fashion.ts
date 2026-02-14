export interface FashionCustomer {
    id: string;
    shop_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    total_orders: number;
    created_at: string;
}
