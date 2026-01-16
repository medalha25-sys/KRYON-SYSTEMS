import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
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
                    <h1 className="title" style={{ marginBottom: '2rem' }}>Termos de Uso</h1>

                    <div style={{ color: '#ccc', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Bem-vindo à Kryon Systems. Ao acessar nosso site, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>1. Uso de Licença</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Kryon Systems, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
                            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                <li>Modificar ou copiar os materiais;</li>
                                <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
                                <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Kryon Systems;</li>
                                <li>Remover quaisquer direitos autorais ou outras notações de propriedade dos materiais.</li>
                            </ul>
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>2. Isenção de Responsabilidade</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Os materiais no site da Kryon Systems são fornecidos 'como estão'. A Kryon Systems não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>3. Limitações</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Em nenhum caso a Kryon Systems ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Kryon Systems.
                        </p>

                        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>4. Precisão dos Materiais</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Os materiais exibidos no site da Kryon Systems podem incluir erros técnicos, tipográficos ou fotográficos. A Kryon Systems não garante que qualquer material em seu site seja preciso, completo ou atual.
                        </p>

                        <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666' }}>
                            Estes termos são efetivos a partir de Janeiro de 2026.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
