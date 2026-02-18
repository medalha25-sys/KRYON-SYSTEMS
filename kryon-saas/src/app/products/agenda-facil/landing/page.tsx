import Link from 'next/link'
import { Check, Calendar, Lock, BarChart, Users, Star } from 'lucide-react'

export default function AgendaLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-16 pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-8 animate-fade-in-up">
              <Star size={16} className="fill-blue-700" />
              Especialmente para Psicólogos e Terapeutas
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              Sua clínica organizada, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                seus pacientes em foco.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Elimine faltas com lembretes automáticos, organize prontuários com segurança e transforme a gestão do seu consultório.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/products/agenda-facil" // Or register
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Começar Gratuitamente
              </Link>
              <Link 
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg transition"
              >
                Ver Recursos
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Teste grátis de 14 dias</span>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo o que você precisa</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Uma suíte completa de ferramentas desenhada para simplificar o dia a dia do psicólogo moderno.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
                icon={<Calendar className="w-8 h-8 text-blue-600" />}
                title="Agenda Inteligente"
                description="Visualização intuitiva de horários, bloqueios recorrentes e confirmação automática via WhatsApp."
            />
            <FeatureCard 
                icon={<Lock className="w-8 h-8 text-indigo-600" />}
                title="Prontuário Seguro"
                description="Anamnese, evolução e documentos armazenados com criptografia de ponta a ponta. 100% seguro."
            />
            <FeatureCard 
                icon={<BarChart className="w-8 h-8 text-purple-600" />}
                title="Google Agenda Sync"
                description="Sincronize automaticamente com sua agenda pessoal para nunca perder um compromisso."
            />
             <FeatureCard 
                icon={<Users className="w-8 h-8 text-pink-600" />}
                title="Portal do Paciente"
                description="Permita que seus pacientes agendem horários online através de um link exclusivo."
            />
             <FeatureCard 
                icon={<Star className="w-8 h-8 text-yellow-500" />}
                title="Gestão Financeira"
                description="Controle de sessoes pagas, pendentes e emissão de recibos automatizada."
            />
             <FeatureCard 
                icon={<Lock className="w-8 h-8 text-teal-600" />}
                title="Multi-Clínica"
                description="Gerencie múltiplos consultórios ou locais de atendimento em uma única conta."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Pronto para transformar seu consultório?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de psicólogos que já profissionalizaram sua gestão com a Agenda Fácil.
          </p>
          <Link 
            href="/products/agenda-facil"
            className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition shadow-xl hover:shadow-2xl"
          >
            Criar Conta Gratuitamente
          </Link>
          <p className="mt-6 text-sm text-gray-500">Comece agora • Cancele quando quiser</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
         <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Clínica Serena - Agenda Fácil. Todos os direitos reservados.</p>
         </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="mb-6 p-4 rounded-xl bg-white shadow-sm inline-block group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
