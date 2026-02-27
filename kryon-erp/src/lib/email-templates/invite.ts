export const inviteTemplate = (param: { clinicName: string, inviteLink: string, role: string }) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #059669;">Convite para a ${param.clinicName}</h2>
  <p>Você foi convidado(a) para atuar como <strong>${param.role === 'professional' ? 'Profissional de Saúde' : param.role === 'secretary' ? 'Secretária(o)' : 'Administrador'}</strong>.</p>
  <p>Para aceitar e configurar seu acesso, clique no botão abaixo:</p>
  <a href="${param.inviteLink}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Aceitar Convite</a>
  <p style="margin-top: 20px; color: #666; font-size: 12px;">Este convite expira em 48 horas.</p>
</div>
`
