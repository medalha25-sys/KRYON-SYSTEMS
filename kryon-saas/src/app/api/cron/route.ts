import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify Cron Secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient()
  
  // Fetch active trials and subscriptions
  // We need to check:
  // 1. Started today (D+0)
  // 2. Started 3 days ago (D+3)
  // 3. Ending in 3 days (D-3)
  // 4. Expired yesterday (D+15 + 1)

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  console.log(`Running Cron Job: ${now.toISOString()}`);

  try {
      // 1. Fetch active/trialing subscriptions
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
            id, 
            user_id, 
            status, 
            trial_start, 
            trial_end, 
            product_slug,
            products(name)
        `)
        .in('status', ['trial', 'trialing', 'expired'])

      if (error) throw error;

      if (!subscriptions) return NextResponse.json({ ok: true, processed: 0 });

      let processed = 0;

      for (const sub of subscriptions) {
          if (!sub.trial_start || !sub.trial_end) continue;

          const trialStart = new Date(sub.trial_start);
          const trialEnd = new Date(sub.trial_end);
          const diffStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          const diffEnd = Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Fetch user email
          const { data: { user } } = await supabase.auth.admin.getUserById(sub.user_id);
          if (!user || !user.email) continue;
          
          const productsData = sub.products as any;
          const productName = Array.isArray(productsData) ? productsData[0]?.name : productsData?.name;
          if (!productName) continue;

          let emailType = '';
          let subject = '';
          let content = '';

          // Logic
          if (diffStart === 0) {
              emailType = 'trial_welcome';
              subject = `Bem-vindo ao ${productName}! 🚀`;
              content = `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Seu teste começou! 🎉</h1>
                    <p>Olá,</p>
                    <p>Seu período de teste de 15 dias no <strong>${productName}</strong> já está valendo.</p>
                    <p>Aproveite para cadastrar clientes, simular vendas e explorar todos os recursos.</p>
                    <a href="https://kryonsystems.com.br/app/${sub.product_slug}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Acessar Sistema</a>
                </div>`;
          } else if (diffStart === 3) {
              emailType = 'trial_tips';
              subject = `Dicas para aproveitar o ${productName} 💡`;
              content = `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Como estão os primeiros dias?</h1>
                    <p>Separamos algumas dicas para você extrair o máximo do sistema:</p>
                    <ul>
                        <li>Cadastre seus principais serviços/produtos.</li>
                        <li>Explore os relatórios de gestão.</li>
                    </ul>
                    <a href="https://kryonsystems.com.br/app/${sub.product_slug}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Continuar Explorando</a>
                </div>`;
          } else if (diffEnd === 3) {
              emailType = 'trial_ending';
              subject = `Seu teste acaba em 3 dias! ⏳`;
              content = `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Não perca seu progresso</h1>
                    <p>Faltam apenas 3 dias para encerrar seu teste gratuito.</p>
                    <p>Garanta acesso contínuo e todos os benefícios do plano profissional.</p>
                    <a href="https://kryonsystems.com.br/upgrade?product=${sub.product_slug}" style="display: inline-block; padding: 10px 20px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 5px;">Assinar Agora</a>
                </div>`;
          } else if (sub.status === 'expired' && diffEnd <= -1 && diffEnd > -3) { // Just expired (within last 2 days)
               emailType = 'trial_expired';
               subject = `Seu acesso ao ${productName} foi pausado 🔒`;
               content = `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Seu teste gratuito terminou</h1>
                    <p>Para continuar usando o sistema sem interrupções, reative sua assinatura.</p>
                    <p>Seus dados estão salvos e seguros.</p>
                    <a href="https://kryonsystems.com.br/upgrade?product=${sub.product_slug}" style="display: inline-block; padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px;">Reativar Assinatura</a>
                </div>`;
          } else {
              continue; // No email to send for this day
          }

          if (emailType) {
              // Check if already sent (Idempotency)
              const { data: logs } = await supabase
                .from('notification_logs')
                .select('id')
                .eq('subscription_id', sub.id)
                .eq('type', emailType)
                .maybeSingle(); // Changed to maybeSingle to avoid null error

              if (!logs) {
                  // Send Email
                  const { success, error: emailError } = await sendEmail({
                      to: user.email,
                      subject,
                      html: content
                  });
                  
                  if (success) {
                    // Log Notification
                    await supabase.from('notification_logs').insert({
                        user_id: user.id,
                        subscription_id: sub.id,
                        type: emailType
                    });
                    processed++;
                  } else {
                      console.error('Failed to send email:', emailError);
                  }
              }
          }
      }

      return NextResponse.json({ ok: true, processed });

  } catch (err) {
      console.error('Cron Error:', err);
      // Return 200 even on error to prevent Vercel Cron from retrying infinitely if it's a code bug
      // But log it properly.
      return NextResponse.json({ ok: false, error: 'Internal Error' }, { status: 500 });
  }
}
