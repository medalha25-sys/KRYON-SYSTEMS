import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (payload: EmailPayload) => {
  if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email', payload);
      return { success: true, skipped: true }; // Dev mode safely skip
  }

  try {
    const data = await resend.emails.send({
      from: 'Kryon Systems <nao-responda@kryonsystems.com.br>', // Update with verified domain
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
