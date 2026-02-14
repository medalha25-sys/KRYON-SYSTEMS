import Link from 'next/link'

interface ButtonProps {
  text: string
  href: string
  style: string
}

const heroData = {
  section_style: "py-24 px-6 text-center bg-gray-50",
  container_style: "max-w-4xl mx-auto",
  title: "Organize sua agenda, reduza faltas e controle sua clínica em um só lugar.",
  subtitle: "O Agenda Fácil é um sistema completo para psicólogos com agendamento online, prontuário digital e controle financeiro integrado.",
  buttons: [
    {
      text: "Começar teste grátis de 15 dias",
      href: "/register",
      style: "bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
    },
    {
      text: "Ver como funciona",
      href: "#como-funciona",
      style: "border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition"
    }
  ]
}

export default function Hero() {
  return (
    <section className={heroData.section_style}>
      <div className={heroData.container_style}>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
          {heroData.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {heroData.subtitle}
        </p>

        <div className={`flex flex-col md:flex-row gap-4 justify-center`}>
          {heroData.buttons.map((btn: ButtonProps, index: number) => (
             <Link 
                key={index} 
                href={btn.href} 
                className={`${btn.style} inline-flex items-center justify-center`}
             >
                {btn.text}
             </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
