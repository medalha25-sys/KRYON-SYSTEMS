import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json(); // 'monthly' or 'annual'

    let title, price, expirationDays;

    if (planType === 'annual') {
        title = 'Agenda Fácil - Plano Profissional (Anual)';
        price = 970;
        expirationDays = 365;
    } else {
        title = 'Agenda Fácil - Plano Profissional (Mensal)';
        price = 97;
        expirationDays = 30;
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: planType,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          }
        ],
        payer: {
            email: user.email,
        },
        external_reference: user.id, // Link payment to user
        metadata: {
            plan_type: planType,
            expiration_days: expirationDays
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/products/agenda-facil?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/products/agenda-facil?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/products/agenda-facil?status=pending`,
        },
        auto_return: 'approved',
      }
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Mercado Pago Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
