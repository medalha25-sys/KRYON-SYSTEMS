export const gracePeriodTemplates = {
  friendly_reminder: (name: string, paymentLink: string) => `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #059669;">Olá, ${name}</h2>
      <p>Notamos que houve uma pendência no processamento da sua assinatura do <strong>Agenda Fácil</strong>.</p>
      <p>Isso é comum e geralmente acontece por cartões vencidos ou limites momentâneos. Seu acesso Premium continua ativo normalmente enquanto aguardamos a regularização.</p>
      <p>Por favor, verifique seus dados de pagamento para evitar interrupções futuras.</p>
      <a href="${paymentLink}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Atualizar Pagamento</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">Se você já realizou o pagamento, desconsidere este aviso.</p>
    </div>
  `,
  soft_warning: (name: string, paymentLink: string) => `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d97706;">Atenção, ${name}</h2>
      <p>Este é um lembrete gentil de que sua assinatura do <strong>Agenda Fácil</strong> ainda consta como pendente.</p>
      <p>Para garantir que você não perca acesso aos seus prontuários ilimitados e gestão financeira, recomendamos regularizar a situação.</p>
      <a href="${paymentLink}" style="display: inline-block; background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Manter Acesso Premium</a>
    </div>
  `,
  final_notice: (name: string, paymentLink: string) => `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Importante: Seu plano será ajustado hoje</h2>
      <p>Olá, ${name}.</p>
      <p>Hoje é o último dia do seu período de tolerância. Caso o pagamento não seja identificado, sua conta será migrada para o plano Gratuito.</p>
      <p>Isso pode limitar seu acesso a funções exclusivas que você usa no dia a dia.</p>
      <p>Ainda dá tempo de resolver!</p>
      <a href="${paymentLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Regularizar Agora</a>
    </div>
  `
}
