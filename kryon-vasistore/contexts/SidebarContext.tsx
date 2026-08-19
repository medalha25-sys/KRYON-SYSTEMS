'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('vasistore_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vasistore_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const expandSidebar = () => {
    setIsCollapsed(false);
    try {
      localStorage.setItem('vasistore_sidebar_collapsed', 'false');
    } catch {}
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
    try {
      localStorage.setItem('vasistore_sidebar_collapsed', 'true');
    } catch {}
  };

  // Atalho global: Ctrl+B para ocultar / mostrar barra lateral
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        // Evita interceptar se estiver digitando em campo de texto
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        expandSidebar,
        collapseSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
