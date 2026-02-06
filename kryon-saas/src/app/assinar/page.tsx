import { MessageCircle, CreditCard } from 'lucide-react'
import '../login/login.css'

export default function AssinarPage() {
  return (
    <div className="loginContainer">
      <div className="loginCard" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div className="logoArea">
          <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Seu período de teste terminou</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            Obrigado por utilizar a Kryon Systems. Identificamos que seu período de degustação de 7 dias chegou ao fim. Para continuar acessando seus dados e sistemas, ative sua assinatura.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '30px', 
          borderRadius: '20px', 
          margin: '30px 0',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#00f2ff', fontWeight: 600, display: 'block', marginBottom: '10px' }}>PLANO MENSAL</span>
          <div style={{ fontSize: '3rem', fontWeight: 800 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 400 }}>R$</span> 99<span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'rgba(255, 255, 255, 0.5)' }}>/mês</span>
          </div>
        </div>

        <a 
          href="https://wa.me/5538984257511" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <button className="submitBtn" style={{ 
            background: '#25D366', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            height: '60px',
            fontSize: '1.1rem'
          }}>
            <MessageCircle size={24} />
            Falar com a Kryon Systems no WhatsApp
          </button>
        </a>

        <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          Ativação imediata após a confirmação do pagamento.
        </p>
      </div>
    </div>
  )
}
