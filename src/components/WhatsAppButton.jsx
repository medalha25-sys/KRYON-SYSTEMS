import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppButton = () => {
    return (
        <motion.a
            href="https://wa.me/5538984257511"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Atendimento no WhatsApp"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-950/40 z-[1000] no-underline border-2 border-white/20 hover:border-white/40"
        >
            <MessageCircle size={26} className="sm:w-7 sm:h-7" fill="white" color="white" />
            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-75 pointer-events-none -z-10" />
        </motion.a>
    );
};

export default WhatsAppButton;
