import { Payment, Preference, PreApproval } from 'mercadopago';

// Initialize MP SDK
// Note: 'mercadopago' SDK structure might vary by version. 
// Using a generic fetch wrapper in case SDK types are tricky or strict.
// But let's try to use the classes if available or fallback to internal helper.

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
    console.warn("MP_ACCESS_TOKEN is missing. Payments will fail.");
}

export class MercadoPagoService {
    
    private static async request(endpoint: string, method: string, body?: any) {
        if (!MP_ACCESS_TOKEN) throw new Error("MP Token missing");

        const res = await fetch(`https://api.mercadopago.com/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`MP API Error [${endpoint}]:`, err);
            throw new Error(`Mercado Pago Error: ${res.statusText}`);
        }

        return res.json();
    }

    /**
     * Creates a Preapproval (Subscription) Preference
     * Used for the Checkout flow to start a subscription.
     */
    static async createSubscriptionPreference(data: {
        reason: string,
        auto_recurring: {
            frequency: number,
            frequency_type: 'days' | 'months',
            transaction_amount: number,
            currency_id: 'BRL'
        },
        payer_email: string,
        back_url: string,
        external_reference: string // organization_id
    }) {
        // Endpoint: /preapproval_plan (Plan) or /preapproval (Subscription direct)? 
        // For dynamic subscription (one-off config per user), we use /preapproval with "status": "pending" 
        // OR we create a "Plan" first?
        // Actually, for simple SaaS, creating a 'preapproval' (Assinatura) is best.
        
        // However, MP API distinguishes between 'preapproval_plan' (Seller creates a plan) and 'preapproval' (Payer agrees).
        // To get a checkout link, we usually POST to /preapproval with init_point.
        
        const payload = {
            reason: data.reason,
            auto_recurring: {
                ...data.auto_recurring,
                currency_id: 'BRL'
            },
            payer_email: data.payer_email,
            back_url: data.back_url,
            external_reference: data.external_reference,
            status: 'pending' // Initiates flow
        };

        return this.request('preapproval', 'POST', payload);
    }
    
    /**
     * Get Preapproval Details
     */
    static async getSubscription(id: string) {
        return this.request(`preapproval/${id}`, 'GET');
    }
}
