import React from 'react';
import { motion } from 'framer-motion';

const CreativeCalendar = () => {
    return (
        <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '20%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(112,0,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 className="title">📅 Calendário Criativo com <span className="gradient-text">Inteligência Artificial</span></h2>
                        <p className="subtitle" style={{ margin: '0 auto' }}>
                            Marketing prático e inteligente para lojas de roupas e calçados
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem', fontSize: '1.1rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
                        <p style={{ marginBottom: '1rem' }}>
                            O <strong style={{ color: 'var(--text-main)' }}>KryonSystem</strong> não é apenas um sistema de vendas.
                            Ele foi criado para ajudar sua loja a <strong style={{ color: 'var(--text-main)' }}>vender mais todos os meses</strong>.
                        </p>
                        <p>
                            Dentro do sistema, você conta com um <strong style={{ color: 'var(--text-main)' }}>Calendário Criativo Inteligente</strong>,
                            desenvolvido exclusivamente para <strong style={{ color: 'var(--text-main)' }}>lojas de roupas e calçados</strong>,
                            com datas estratégicas do varejo e ideias práticas para aumentar o faturamento.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Box 1 */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                🧠 Dicas pensadas para o seu tipo de loja
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Nada de textos genéricos ou ideias que não funcionam na prática.
                                As dicas são adaptadas conforme o perfil da sua loja:
                            </p>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-muted)' }}>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>•</span> Lojas de roupas</li>
                                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>•</span> Lojas de calçados</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>•</span> Lojas que trabalham com ambos</li>
                            </ul>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                Você escolhe o perfil da loja, e o sistema ajusta as sugestões à sua realidade.
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                🤖 Inteligência Artificial que personaliza as dicas
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Cada dica do calendário pode ser expandida com IA,
                                levando em consideração:
                            </p>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-muted)' }}>
                                {[
                                    'Tipo de produto vendido',
                                    'Público-alvo da loja',
                                    'Estilo da loja (popular, premium, street, esportivo)',
                                    'Faixa de preço',
                                    'Tipo de conteúdo que você prefere postar'
                                ].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>•</span> {item}</li>
                                ))}
                            </ul>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                O resultado é uma dica personalizada,
                                como se um especialista em marketing tivesse analisado sua loja.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        {/* Box 3 */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                💡 O que você recebe em cada dica
                            </h3>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-muted)' }}>
                                {[
                                    'Sugestão de produtos ideais para cada data',
                                    'Ideias de kits e vendas casadas',
                                    'Indicação de desconto quando aplicável',
                                    'Dicas de fotos e vídeos para redes sociais',
                                    'Exemplo de descrição pronta para postagem',
                                    'Sugestão de hashtags relevantes'
                                ].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>•</span> {item}</li>
                                ))}
                            </ul>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                Tudo simples, direto e pronto para aplicar no dia a dia da loja.
                            </p>
                        </div>

                        {/* Box 4 & 5 grouped */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card" style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    📊 Acompanhe o que realmente funciona
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    O sistema permite acompanhar quais dicas você visualizou,
                                    aplicou e quais trouxeram resultados positivos.
                                </p>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Assim, você entende o que funciona na sua loja
                                    e toma decisões baseadas em resultados, não em achismo.
                                </p>
                            </div>

                            <div className="card" style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    🚀 Um diferencial que poucos sistemas oferecem
                                </h3>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Enquanto outros sistemas apenas registram vendas,
                                    o <strong style={{ color: 'var(--text-main)' }}>KryonSystem</strong> ajuda sua loja a crescer,
                                    com ideias práticas, inteligência aplicada e foco no varejo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="cta-box"
                        whileHover={{ scale: 1.02 }}
                        style={{
                            background: 'linear-gradient(90deg, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            maxWidth: '900px',
                            margin: '0 auto',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <p style={{ fontSize: '1.4rem', marginBottom: '0', lineHeight: '1.4' }}>
                            <strong style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                                Seu sistema não deve apenas controlar vendas.
                            </strong>
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
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
