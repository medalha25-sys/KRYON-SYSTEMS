import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Privacy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ paddingTop: '100px', paddingBottom: '4rem', background: '#050507', minHeight: '100vh', color: '#fff' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="title" style={{ marginBottom: '2rem' }}>Política de Privacidade</h1>

                    <div style={{ color: '#ccc', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            A Kryon Systems valoriza sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar nosso site e serviços.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>1. Coleta de Informações</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Coletamos informações que você nos fornece diretamente, como nome, e-mail e telefone ao preencher nossos formulários de contato. Também podemos coletar dados técnicos automaticamente, como seu endereço IP, tipo de navegador e comportamento de navegação em nosso site para fins de análise e melhoria de performance.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>2. Uso das Informações</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Utilizamos suas informações para:
                            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                <li>Responder às suas solicitações e dúvidas;</li>
                                <li>Fornecer e melhorar nossos serviços;</li>
                                <li>Enviar comunicações de marketing relevantes (caso você tenha optado por recebê-las);</li>
                                <li>Garantir a segurança do nosso site.</li>
                            </ul>
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>3. Compartilhamento de Dados</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Não vendemos ou alugamos seus dados pessoais para terceiros. Podemos compartilhar informações com prestadores de serviço confiáveis que nos auxiliam na operação do site e negócios, desde que estes concordem em manter a confidencialidade das informações.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>4. Seus Direitos</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Você tem o direito de solicitar acesso, correção ou exclusão de seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato conosco através dos nossos canais de atendimento.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>5. Alterações nesta Política</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página regularmente para estar ciente de quaisquer alterações.
                        </p>

                        <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666' }}>
                            Última atualização: Janeiro de 2026.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
