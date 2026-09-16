import { AppointmentNotificationData, NotificationType } from './types';

function formatDate(dateInput: string | Date): { formattedDate: string; formattedTime: string; fullDate: string } {
  const d = new Date(dateInput);
  
  // Format in America/Sao_Paulo (or user local)
  const dateOptions: Intl.DateTimeFormatOptions = { 
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const formattedDate = new Intl.DateTimeFormat('pt-BR', dateOptions).format(d);
  const formattedTime = new Intl.DateTimeFormat('pt-BR', timeOptions).format(d);
  const fullDate = `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} às ${formattedTime}`;

  return { formattedDate, formattedTime, fullDate };
}

function baseEmailWrapper(title: string, content: string, clinicName: string, clinicLogo?: string | null): string {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f4f6f9;padding:30px 15px;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05);overflow:hidden;border:1px solid #e2e8f0;">
            
            <!-- Header -->
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);text-align:center;">
                ${clinicLogo ? `<img src="${clinicLogo}" alt="${clinicName}" style="max-height:48px;max-width:180px;object-fit:contain;margin-bottom:12px;border-radius:8px;" /><br/>` : ''}
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">${clinicName}</h1>
                <p style="margin:4px 0 0 0;color:#bfdbfe;font-size:13px;font-weight:500;">Agendamento Online</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Esta é uma mensagem automática de confirmação enviada por <strong>${clinicName}</strong> através da plataforma <strong>Kryon Agenda</strong>.
                </p>
                <p style="margin:6px 0 0 0;font-size:11px;color:#cbd5e1;">
                  Por favor, não responda diretamente a este e-mail.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function generateEmailTemplate(type: NotificationType, data: AppointmentNotificationData): { subject: string; html: string } {
  const { formattedDate, formattedTime, fullDate } = formatDate(data.startTime);
  const clinicName = data.organizationName || 'Clínica';

  const appointmentSummaryCard = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:20px 0;padding:16px;">
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#64748b;width:35%;"><strong>Paciente:</strong></td>
        <td style="padding:6px 12px;font-size:14px;color:#0f172a;font-weight:600;">${data.clientName}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#64748b;"><strong>Profissional:</strong></td>
        <td style="padding:6px 12px;font-size:14px;color:#0f172a;font-weight:600;">${data.professionalName}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#64748b;"><strong>Serviço:</strong></td>
        <td style="padding:6px 12px;font-size:14px;color:#0f172a;font-weight:600;">${data.serviceName}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#64748b;"><strong>Data e Horário:</strong></td>
        <td style="padding:6px 12px;font-size:14px;color:#2563eb;font-weight:700;">${fullDate}</td>
      </tr>
      ${data.organizationAddress ? `
      <tr>
        <td style="padding:6px 12px;font-size:13px;color:#64748b;"><strong>Local:</strong></td>
        <td style="padding:6px 12px;font-size:13px;color:#334155;">${data.organizationAddress}</td>
      </tr>` : ''}
    </table>
  `;

  switch (type) {
    case 'booking_created':
    case 'booking_confirmed': {
      const subject = `Agendamento Confirmado - ${clinicName}`;
      const content = `
        <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:18px;font-weight:700;">Olá, ${data.clientName}!</h2>
        <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
          Seu agendamento foi registrado com sucesso em <strong>${clinicName}</strong>. Confira abaixo os detalhes da sua consulta:
        </p>
        
        ${appointmentSummaryCard}

        <p style="margin:16px 0;font-size:13px;color:#64748b;">
          💡 <strong>Recomendação:</strong> Solicitamos que compareça com cerca de 10 minutos de antecedência.
        </p>

        <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
          Caso precise remarcar ou cancelar seu horário, solicitamos que entre em contato com a clínica com antecedência.
        </p>
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }

    case 'reminder_24h': {
      const subject = `Lembrete de Consulta Amanhã - ${clinicName}`;
      const content = `
        <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:18px;font-weight:700;">Lembrete de Consulta</h2>
        <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
          Olá, <strong>${data.clientName}</strong>! Lembramos que você tem uma consulta agendada para <strong>amanhã</strong> em <strong>${clinicName}</strong>.
        </p>
        
        ${appointmentSummaryCard}

        <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:20px 0;">
          <p style="margin:0;font-size:13px;color:#1e40af;font-weight:500;">
            Aguardamos você amanhã às <strong>${formattedTime}</strong>!
          </p>
        </div>
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }

    case 'reminder_2h': {
      const subject = `Sua Consulta é em 2 Horas - ${clinicName}`;
      const content = `
        <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:18px;font-weight:700;">Sua consulta está próxima!</h2>
        <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
          Olá, <strong>${data.clientName}</strong>! Este é um lembrete de que sua consulta em <strong>${clinicName}</strong> acontecerá hoje, aproximadamente às <strong>${formattedTime}</strong>.
        </p>
        
        ${appointmentSummaryCard}

        <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
          Tenha uma excelente consulta!
        </p>
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }

    case 'booking_canceled': {
      const subject = `Cancelamento de Agendamento - ${clinicName}`;
      const content = `
        <h2 style="margin:0 0 12px 0;color:#dc2626;font-size:18px;font-weight:700;">Agendamento Cancelado</h2>
        <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
          Olá, <strong>${data.clientName}</strong>. Informamos que o seu agendamento em <strong>${clinicName}</strong> foi cancelado.
        </p>
        
        ${appointmentSummaryCard}

        ${data.cancellationReason ? `
        <p style="margin:12px 0;font-size:13px;color:#64748b;">
          <strong>Motivo informado:</strong> ${data.cancellationReason}
        </p>` : ''}

        <p style="margin:20px 0 0 0;font-size:13px;color:#475569;">
          Caso deseje agendar um novo horário, estamos à sua disposição.
        </p>
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }

    case 'booking_rescheduled': {
      const prev = data.previousStartTime ? formatDate(data.previousStartTime).fullDate : null;
      const subject = `Agendamento Remarcado - ${clinicName}`;
      const content = `
        <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:18px;font-weight:700;">Agendamento Remarcado</h2>
        <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
          Olá, <strong>${data.clientName}</strong>! Informamos que seu horário em <strong>${clinicName}</strong> foi atualizado.
        </p>
        
        ${prev ? `
        <div style="background-color:#fef3c7;border-left:4px solid #d97706;padding:10px 14px;border-radius:4px;margin-bottom:16px;">
          <p style="margin:0;font-size:12px;color:#92400e;">
            <strong>Horário anterior:</strong> <span style="text-decoration:line-through;">${prev}</span>
          </p>
        </div>` : ''}

        <p style="margin:0 0 8px 0;font-size:13px;color:#0f172a;font-weight:600;">Novo Horário Confirmado:</p>
        ${appointmentSummaryCard}

        <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
          Aguardamos você no novo horário marcado!
        </p>
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }

    default: {
      const subject = `Notificação de Agendamento - ${clinicName}`;
      const content = `
        <p>Olá, <strong>${data.clientName}</strong>!</p>
        ${appointmentSummaryCard}
      `;
      return { subject, html: baseEmailWrapper(subject, content, clinicName, data.organizationLogo) };
    }
  }
}
