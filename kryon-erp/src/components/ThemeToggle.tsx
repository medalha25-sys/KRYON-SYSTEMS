'use client';

import React from 'react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 text-[#617589] hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
            title={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
        >
            <span className="material-symbols-outlined notranslate">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
        </button>
    );
};
