import React from 'react';
import { motion } from 'framer-motion';

const CreativeCalendar = () => {
    return (
        <section className="section py-12 sm:py-16 md:py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[radial-gradient(circle,rgba(112,0,255,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />

            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="title text-2xl sm:text-3xl md:text-5xl">
                            📅 Calendário Criativo com <span className="gradient-text">Inteligência Artificial</span>
                        </h2>
                        <p className="subtitle mx-auto text-sm sm:text-base md:text-lg mt-2 sm:mt-3 text-slate-400">
                            Marketing prático e inteligente para lojas de roupas e calçados
                        </p>
                    </div>

                    <div className="mb-8 sm:mb-12 text-sm sm:text-base md:text-lg text-slate-400 text-center max-w-3xl mx-auto space-y-3 leading-relaxed px-2">
                        <p>
                            O <strong className="text-white font-semibold">KryonSystem</strong> não é apenas um sistema de vendas.
                            Ele foi criado para ajudar sua loja a <strong className="text-white font-semibold">vender mais todos os meses</strong>.
                        </p>
                        <p>
                            Dentro do sistema, você conta com um <strong className="text-white font-semibold">Calendário Criativo Inteligente</strong>,
                            desenvolvido exclusivamente para <strong className="text-white font-semibold">lojas de roupas e calçados</strong>,
                            com datas estratégicas do varejo e ideias práticas para aumentar o faturamento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-5 sm:mb-8">
                        {/* Box 1 */}
                        <div className="card p-5 sm:p-7">
                            <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-white">
                                🧠 Dicas pensadas para o seu tipo de loja
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                                Nada de textos genéricos ou ideias que não funcionam na prática.
                                As dicas são adaptadas conforme o perfil da sua loja:
                            </p>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                                <li className="flex items-center gap-2"><span className="text-cyan-400 font-bold">•</span> Lojas de roupas</li>
                                <li className="flex items-center gap-2"><span className="text-cyan-400 font-bold">•</span> Lojas de calçados</li>
                                <li className="flex items-center gap-2"><span className="text-cyan-400 font-bold">•</span> Lojas que trabalham com ambos</li>
                            </ul>
                            <p className="mt-4 text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Você escolhe o perfil da loja, e o sistema ajusta as sugestões à sua realidade.
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="card p-5 sm:p-7">
                            <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-white">
                                🤖 Inteligência Artificial que personaliza as dicas
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm mb-3 leading-relaxed">
                                Cada dica do calendário pode ser expandida com IA,
                                levando em consideração:
                            </p>
                            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                                {[
                                    'Tipo de produto vendido',
                                    'Público-alvo da loja',
                                    'Estilo da loja (popular, premium, street, esportivo)',
                                    'Faixa de preço',
                                    'Tipo de conteúdo que você prefere postar'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2"><span className="text-cyan-400 font-bold">•</span> {item}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-slate-400 text-xs sm:text-sm leading-relaxed">
                                O resultado é uma dica personalizada, como se um especialista em marketing tivesse analisado sua loja.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-12">
                        {/* Box 3 */}
                        <div className="card p-5 sm:p-7">
                            <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-white">
                                💡 O que você recebe em cada dica
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                                {[
                                    'Sugestão de produtos ideais para cada data',
                                    'Ideias de kits e vendas casadas',
                                    'Indicação de desconto quando aplicável',
                                    'Dicas de fotos e vídeos para redes sociais',
                                    'Exemplo de descrição pronta para postagem',
                                    'Sugestão de hashtags relevantes'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2"><span className="text-cyan-400 font-bold">•</span> {item}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Tudo simples, direto e pronto para aplicar no dia a dia da loja.
                            </p>
                        </div>

                        {/* Box 4 & 5 grouped */}
                        <div className="flex flex-col gap-5 sm:gap-8">
                            <div className="card p-5 sm:p-7 flex-1">
                                <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2 text-white">
                                    📊 Acompanhe o que realmente funciona
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm mb-2 leading-relaxed">
                                    O sistema permite acompanhar quais dicas você visualizou, aplicou e quais trouxeram resultados positivos.
                                </p>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                    Assim, você entende o que funciona na sua loja e toma decisões baseadas em resultados, não em achismo.
                                </p>
                            </div>

                            <div className="card p-5 sm:p-7 flex-1">
                                <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2 text-white">
                                    🚀 Um diferencial que poucos sistemas oferecem
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                    Enquanto outros sistemas apenas registram vendas, o <strong className="text-white font-semibold">KryonSystem</strong> ajuda sua loja a crescer, com ideias práticas, inteligência aplicada e foco no varejo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="glass-card p-6 sm:p-10 text-center max-w-3xl mx-auto border-blue-500/30"
                        whileHover={{ scale: 1.01 }}
                    >
                        <p className="text-base sm:text-xl md:text-2xl leading-snug">
                            <strong className="block mb-2 text-white font-bold">
                                Seu sistema não deve apenas controlar vendas.
                            </strong>
                            <span className="text-cyan-400 font-extrabold">
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
