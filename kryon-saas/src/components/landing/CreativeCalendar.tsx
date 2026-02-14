'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Brain, Lightbulb, TrendingUp, CheckCircle, Target } from 'lucide-react';

const CreativeCalendar = () => {
    return (
        <section className="py-24 bg-[#050507] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                            📅 Calendário Criativo com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Inteligência Artificial</span>
                        </h2>
                        <p className="text-gray-400 text-lg mx-auto max-w-2xl">
                            Marketing prático e inteligente para lojas de roupas e calçados
                        </p>
                    </div>

                    <div className="text-center max-w-3xl mx-auto mb-16 text-lg text-gray-400 space-y-4">
                        <p>
                            O <strong className="text-white">KryonSystem</strong> não é apenas um sistema de vendas.
                            Ele foi criado para ajudar sua loja a <strong className="text-white">vender mais todos os meses</strong>.
                        </p>
                        <p>
                            Dentro do sistema, você conta com um <strong className="text-white">Calendário Criativo Inteligente</strong>,
                            desenvolvido exclusivamente para <strong className="text-white">lojas de roupas e calçados</strong>,
                            com datas estratégicas do varejo e ideias práticas para aumentar o faturamento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Box 1 */}
                        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <Brain className="text-blue-500" /> Dicas pensadas para o seu tipo de loja
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Nada de textos genéricos ou ideias que não funcionam na prática.
                                As dicas são adaptadas conforme o perfil da sua loja:
                            </p>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Lojas de roupas</li>
                                <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Lojas de calçados</li>
                                <li className="flex items-center gap-2"><span className="text-blue-500">•</span> Lojas que trabalham com ambos</li>
                            </ul>
                            <p className="mt-4 text-gray-400 text-sm italic">
                                Você escolhe o perfil da loja, e o sistema ajusta as sugestões à sua realidade.
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <Target className="text-purple-500" /> Inteligência Artificial que personaliza as dicas
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Cada dica do calendário pode ser expandida com IA,
                                levando em consideração:
                            </p>
                            <ul className="space-y-2 text-gray-400">
                                {[
                                    'Tipo de produto vendido',
                                    'Público-alvo da loja',
                                    'Estilo da loja (popular, premium, street, esportivo)',
                                    'Faixa de preço',
                                    'Tipo de conteúdo que você prefere postar'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2"><span className="text-purple-500">•</span> {item}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-gray-400 text-sm italic">
                                O resultado é uma dica personalizada,
                                como se um especialista em marketing tivesse analisado sua loja.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* Box 3 */}
                        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <Lightbulb className="text-yellow-500" /> O que você recebe em cada dica
                            </h3>
                            <ul className="space-y-2 text-gray-400">
                                {[
                                    'Sugestão de produtos ideais para cada data',
                                    'Ideias de kits e vendas casadas',
                                    'Indicação de desconto quando aplicável',
                                    'Dicas de fotos e vídeos para redes sociais',
                                    'Exemplo de descrição pronta para postagem',
                                    'Sugestão de hashtags relevantes'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2"><span className="text-yellow-500">•</span> {item}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-gray-400 text-sm italic">
                                Tudo simples, direto e pronto para aplicar no dia a dia da loja.
                            </p>
                        </div>

                        {/* Box 4 & 5 grouped */}
                        {/* AI Deep Dive & Differentials */}
                        <div className="flex flex-col gap-8">
                             <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors flex-1">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <TrendingUp className="text-green-500" /> Como a IA funciona na sua Loja de Roupas
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Nossa Inteligência Artificial não é apenas um gerador de texto. Ela foi treinada especificamente com dados de <strong>varejo de moda</strong>.
                                    Veja o nível de detalhe que ela entrega:
                                </p>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 font-semibold text-white">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Entende de Moda e Tecidos
                                        </span>
                                        <span className="text-sm pl-6">
                                            A IA sabe a diferença entre vender um vestido de linho (foco em frescor/elegância) e um jeans (foco em durabilidade/caimento). As legendas destacam os benefícios reais da peça.
                                        </span>
                                    </li>
                                    <li className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 font-semibold text-white">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Gatilhos Mentais de Venda
                                        </span>
                                        <span className="text-sm pl-6">
                                            Os textos gerados usam técnicas de copywriting (escassez, urgência, autoridade) para fazer o cliente sentir desejo de comprar agora.
                                        </span>
                                    </li>
                                    <li className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 font-semibold text-white">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Ciclos e Coleções
                                        </span>
                                        <span className="text-sm pl-6">
                                            O sistema entende sazonalidade. Se está chegando o verão, ele sugere campanhas para peças leves. Se é troca de coleção, ele monta estratégias de "Queima de Estoque" automaticamente.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/50 transition-colors flex-1">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                                    <Brain className="text-purple-400" /> Um diferencial exclusivo
                                </h3>
                                <p className="text-gray-300">
                                    Enquanto outros sistemas apenas registram o que você vendeu,
                                    o <strong>KryonSystem</strong> atua como um <strong>Gerente de Marketing Digital</strong>.
                                    Ele analisa, sugere e cria o conteúdo para você postar, economizando horas do seu dia e garantindo que sua loja esteja sempre ativa nas redes sociais.
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden backdrop-blur-md"
                        whileHover={{ scale: 1.02 }}
                        style={{
                            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        <p className="text-2xl md:text-3xl font-light mb-0 leading-relaxed text-white">
                            <span className="block mb-2 font-semibold">
                                Seu sistema não deve apenas controlar vendas.
                            </span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 font-bold">
                                Ele deve ajudar sua loja a crescer.
                            </span>
                        </p>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
};

export default CreativeCalendar;
