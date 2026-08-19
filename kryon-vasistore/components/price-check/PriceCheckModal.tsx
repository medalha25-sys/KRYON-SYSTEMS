'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Barcode, Tag, Package, Boxes, CheckCircle2, 
  AlertTriangle, Plus, X, ArrowRight, Sparkles, CornerDownLeft
} from 'lucide-react';
import { Product, Category } from '../../lib/db/types';
import { db } from '../../lib/db';
import { useStore } from '../../contexts/StoreContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../lib/formatters';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface PriceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export function PriceCheckModal({ isOpen, onClose, onAddToCart }: PriceCheckModalProps) {
  const { store } = useStore();
  const { addItem } = useCart();
  const { success } = useToast();

  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar produtos e categorias
  useEffect(() => {
    if (isOpen) {
      const p = db.getProducts(store.id);
      const c = db.getCategories(store.id);
      setProducts(p);
      setCategories(c);
      setQuery('');
      setSelectedProduct(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, store.id]);

  // Busca de produtos correspondentes
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const cleanQ = q.replace(/\D/g, '');

    return products.filter((p) => {
      if (!p.active) return false;
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchBarcode = p.barcode && (p.barcode.toLowerCase() === q || p.barcode.includes(q));
      return matchName || matchSku || matchBarcode;
    }).slice(0, 8);
  }, [query, products]);

  // Se houver correspondência exata de código de barras, seleciona direto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim()) {
      const cleanVal = val.trim().toLowerCase();
      const exactMatch = products.find(
        (p) => p.active && (p.barcode?.toLowerCase() === cleanVal || p.sku?.toLowerCase() === cleanVal)
      );
      if (exactMatch) {
        setSelectedProduct(exactMatch);
      }
    }
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setQuery(prod.name);
  };

  const handleAddToCart = (prod: Product) => {
    if (onAddToCart) {
      onAddToCart(prod);
    } else {
      addItem(prod, 1);
      success('Produto adicionado ao carrinho!', prod.name);
    }
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    setSelectedProduct(null);
    inputRef.current?.focus();
  };

  const getCategoryName = (catId?: string) => {
    if (!catId) return 'Geral';
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Geral';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terminal de Consulta de Preços" maxWidth="xl">
      <div className="space-y-4">
        {/* Input de Busca com Autofocus e leitor de código de barras */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Barcode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Bipe o código de barras ou digite o nome / código..."
            className="w-full pl-11 pr-24 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-emerald-500/50 focus:border-emerald-600 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner"
            autoFocus
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[10px] uppercase font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
              Esc
            </span>
          </div>
        </div>

        {/* Exibição Principal do Produto Consultado */}
        {selectedProduct ? (
          <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/60 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-emerald-500/40 shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="success" size="sm">
                    {getCategoryName(selectedProduct.category_id)}
                  </Badge>
                  {selectedProduct.sku && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Cód: {selectedProduct.sku}
                    </span>
                  )}
                  {selectedProduct.barcode && (
                    <span className="text-[11px] font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border text-slate-600 dark:text-slate-300">
                      EAN: {selectedProduct.barcode}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedProduct.name}
                </h3>
              </div>

              {/* Tag de Estoque */}
              <div className="text-right flex-shrink-0">
                {selectedProduct.current_stock > selectedProduct.min_stock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {selectedProduct.current_stock} {selectedProduct.unit || 'UN'} em estoque
                  </span>
                ) : selectedProduct.current_stock > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Estoque baixo ({selectedProduct.current_stock})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Esgotado
                  </span>
                )}
              </div>
            </div>

            {/* Grande Painel de Preço de Venda */}
            <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Preço de Venda à Vista / Cartão / PIX
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {formatCurrency(selectedProduct.sale_price)}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    / {selectedProduct.unit || 'UN'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => handleAddToCart(selectedProduct)}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="flex-1 sm:flex-none font-bold shadow-md shadow-emerald-600/30"
                >
                  Adicionar ao Carrinho (+1)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClear}
                  className="font-bold"
                >
                  Nova Consulta
                </Button>
              </div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          /* Lista de Resultados de Busca Rápida */
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase px-1">
              Produtos Encontrados ({searchResults.length}):
            </p>
            {searchResults.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer group"
              >
                <div className="space-y-0.5 overflow-hidden pr-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                    {prod.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{getCategoryName(prod.category_id)}</span>
                    {prod.barcode && <span>• EAN: {prod.barcode}</span>}
                    <span>• Est: {prod.current_stock} un</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(prod.sale_price)}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          /* Nenhum produto encontrado */
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Tag className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum produto encontrado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifique se o código de barras ou nome "{query}" foi digitado corretamente.
            </p>
          </div>
        ) : (
          /* Estado Inicial: Dica de Uso */
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <Barcode className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Terminal Pronto para Consulta
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Aponte o leitor óptico para o código de barras do produto ou digite o nome acima para ver o preço e estoque em tempo real.
            </p>
          </div>
        )}

        {/* Footer com atalhos */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Atalho: Pressione <strong className="font-mono text-slate-700 dark:text-slate-300">F9</strong> a qualquer momento</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
