'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus, 
  Percent, DollarSign, User, CreditCard, Banknote, 
  QrCode, ArrowRight, Printer, AlertTriangle, Sparkles, 
  Check, X, RefreshCw, Layers, FileText, ShieldCheck,
  Copy, CheckCheck, CheckCircle2, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../../contexts/AuthContext';
import { useStore } from '../../../contexts/StoreContext';
import { useCash } from '../../../contexts/CashContext';
import { useCart } from '../../../contexts/CartContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Product, Category, Customer, PaymentEntry, PaymentMethod, Sale } from '../../../lib/db/types';
import { formatCurrency, formatCpfCnpj } from '../../../lib/formatters';
import { generatePixPayload, getPixQrCodeUrl } from '../../../lib/pix';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { ReceiptModal } from '../../../components/receipt/ReceiptModal';
import { PriceCheckModal } from '../../../components/price-check/PriceCheckModal';

export default function PDVPage() {
  const router = useRouter();
  const { store } = useStore();
  const { user } = useAuth();
  const { isOpen, openCash, cashBalance } = useCash();
  const {
    items,
    customer,
    customerDocument,
    discount,
    discountType,
    subtotal,
    discountAmount,
    total,
    totalItemsCount,
    addItem,
    updateItemQuantity,
    updateItemDiscount,
    removeItem,
    setCustomer,
    setCustomerDocument,
    applyDiscount,
    clearCart,
    checkout,
  } = useCart();
  const { success, error, warning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modais
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfPromptedThisSale, setCpfPromptedThisSale] = useState(false);
  const [tempCpfInput, setTempCpfInput] = useState('');
  const [cpfMatchCustomer, setCpfMatchCustomer] = useState<Customer | null>(null);
  const [initialFloatInput, setInitialFloatInput] = useState('150');
  const [finishedSale, setFinishedSale] = useState<Sale | null>(null);
  const [showPriceCheckModal, setShowPriceCheckModal] = useState(false);

  // Estado do Pagamento no Modal
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [creditInstallments, setCreditInstallments] = useState<number>(1);
  const [paymentSplits, setPaymentSplits] = useState<PaymentEntry[]>([]);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitMethodInput, setSplitMethodInput] = useState<PaymentMethod>('pix');
  const [splitAmountInput, setSplitAmountInput] = useState<string>('');
  const [copiedPixType, setCopiedPixType] = useState<'key' | 'payload' | null>(null);

  // Discount modal state
  const [tempDiscountValue, setTempDiscountValue] = useState<string>('0');
  const [tempDiscountType, setTempDiscountType] = useState<'value' | 'percent'>('value');

  // Input ref para focar no leitor de código de barras
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Rolagem horizontal das categorias com o scroll do mouse (roda do mouse)
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({
        left: e.deltaY * 1.5,
        behavior: 'auto',
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    setProducts(db.getProducts(store.id));
    setCategories(db.getCategories(store.id));
    setCustomers(db.getCustomers(store.id));
  }, [store.id]);

  // Foco automático na busca/leitor de código de barras
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Adição inteligente de produto com gatilho automático de CPF no primeiro item
  const handleAddProduct = (product: Product, qty = 1) => {
    const isFirstItem = items.length === 0;
    addItem(product, qty);

    if (isFirstItem && !cpfPromptedThisSale && !customerDocument && !customer?.cpf_cnpj) {
      setCpfPromptedThisSale(true);
      setTempCpfInput('');
      setCpfMatchCustomer(null);
      setShowCpfModal(true);
    }
  };

  const handleCpfInputChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 14);
    let formatted = clean;
    if (clean.length <= 11) {
      if (clean.length > 9) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
      } else if (clean.length > 6) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
      } else if (clean.length > 3) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
      }
    } else {
      formatted = `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
    }
    setTempCpfInput(formatted);

    if (clean.length >= 11) {
      const matched = customers.find(c => c.cpf_cnpj?.replace(/\D/g, '') === clean);
      setCpfMatchCustomer(matched || null);
    } else {
      setCpfMatchCustomer(null);
    }
  };

  const handleConfirmCpf = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCpfInput.trim()) {
      if (cpfMatchCustomer) {
        setCustomer(cpfMatchCustomer);
      }
      setCustomerDocument(tempCpfInput.trim());
      success('CPF na nota registrado!', tempCpfInput.trim());
    }
    setShowCpfModal(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSkipCpf = () => {
    setShowCpfModal(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleClearCart = () => {
    clearCart();
    setCpfPromptedThisSale(false);
    setTempCpfInput('');
    setCpfMatchCustomer(null);
  };

  // Atalhos de teclado no PDV (F2 busca, F3 desconto, F4 pagamento, F6 CPF na nota, F8 limpar, Ctrl+A abrir caixa, Ctrl+F fechar caixa)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();
        if (key === 'a') {
          e.preventDefault();
          if (!isOpen) {
            setShowOpenCashModal(true);
          } else {
            warning('Caixa já aberto', `O caixa já está aberto com saldo de ${formatCurrency(cashBalance)}.`);
          }
          return;
        } else if (key === 'f') {
          e.preventDefault();
          if (isOpen) {
            router.push('/caixa');
          } else {
            warning('Caixa já fechado', 'O caixa já se encontra fechado.');
          }
          return;
        }
      }

      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowDiscountModal(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (items.length > 0) handleOpenPayment();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setTempCpfInput(customerDocument || customer?.cpf_cnpj || '');
        setShowCpfModal(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (items.length > 0) handleClearCart();
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowPriceCheckModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, isOpen, cashBalance, warning, router, customerDocument, customer]);

  // Filtragem de produtos no catálogo rápido
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.active);

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  // Manipulador de busca / Leitor de código de barras
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const match = db.getProductByBarcodeOrSku(searchQuery.trim(), store.id);
      if (match) {
        handleAddProduct(match, 1);
        setSearchQuery('');
        success(`Adicionado: ${match.name}`);
      } else if (filteredProducts.length === 1) {
        handleAddProduct(filteredProducts[0], 1);
        setSearchQuery('');
        success(`Adicionado: ${filteredProducts[0].name}`);
      } else {
        warning('Produto não encontrado', 'Nenhum item com este código exato.');
      }
    }
  };

  const handleOpenPayment = () => {
    if (!isOpen) {
      setShowOpenCashModal(true);
      return;
    }
    if (items.length === 0) {
      error('Carrinho vazio', 'Adicione produtos antes de finalizar a venda.');
      return;
    }
    setCashGiven(total.toFixed(2));
    setSelectedPaymentMethod('dinheiro');
    setPaymentSplits([]);
    setIsSplitMode(false);
    setSplitMethodInput('pix');
    setSplitAmountInput(total.toFixed(2));
    setShowPaymentModal(true);
  };

  const handleConfirmOpenCash = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialFloatInput) || 0;
    openCash(val, 'Abertura rápida no PDV');
    setShowOpenCashModal(false);
    success('Caixa aberto!', `Fundo de troco inicial: ${formatCurrency(val)}`);
  };

  // Cálculos no modo único
  const cashNum = parseFloat(cashGiven.replace(',', '.')) || 0;
  const cashChange = Math.max(0, cashNum - total);
  const cashRemaining = Math.max(0, total - cashNum);
  const isCashInsufficient = cashNum > 0 && cashNum < total;

  // Cálculos no modo dividido / misto
  const totalPaidInSplits = paymentSplits.reduce((acc, p) => acc + p.amount, 0);
  const remainingInSplits = Math.max(0, total - totalPaidInSplits);
  const isSplitFullyPaid = Math.abs(totalPaidInSplits - total) <= 0.01;

  // Validação estrita: Venda a Prazo (Fiado) exige cliente cadastrado obrigatoriamente
  const isFiadoWithoutCustomer = (
    (!isSplitMode && selectedPaymentMethod === 'fiado' && !customer) ||
    (isSplitMode && paymentSplits.some((p) => p.method === 'fiado') && !customer)
  );

  const handleAddSplitPayment = () => {
    const amountVal = parseFloat(splitAmountInput.replace(',', '.')) || 0;
    if (amountVal <= 0) {
      error('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (amountVal > remainingInSplits + 0.001) {
      error('Valor excedente', `O valor restante a pagar é de ${formatCurrency(remainingInSplits)}.`);
      return;
    }
    if (splitMethodInput === 'fiado' && !customer) {
      error('Cliente Obrigatório', 'É obrigatório selecionar um cliente cadastrado para registrar parcela a prazo (fiado).');
      setShowCustomerModal(true);
      return;
    }

    const newSplits = [
      ...paymentSplits,
      {
        method: splitMethodInput,
        amount: amountVal,
        installments: splitMethodInput === 'credito' ? creditInstallments : undefined,
      },
    ];

    setPaymentSplits(newSplits);
    const newRemaining = Math.max(0, total - newSplits.reduce((acc, p) => acc + p.amount, 0));
    setSplitAmountInput(newRemaining > 0 ? newRemaining.toFixed(2) : '');
    success(`Adicionado: ${formatCurrency(amountVal)} no ${splitMethodInput.toUpperCase()}`);
  };

  const handleRemoveSplitPayment = (index: number) => {
    const updated = paymentSplits.filter((_, idx) => idx !== index);
    setPaymentSplits(updated);
    const newRemaining = Math.max(0, total - updated.reduce((acc, p) => acc + p.amount, 0));
    setSplitAmountInput(newRemaining.toFixed(2));
  };

  const handleFinishSale = () => {
    try {
      // Bloqueio rigoroso de fiado sem cliente
      if (selectedPaymentMethod === 'fiado' || paymentSplits.some((p) => p.method === 'fiado')) {
        if (!customer) {
          error('Cliente Obrigatório', 'Para registrar venda no prazo (fiado), é obrigatório selecionar um cliente cadastrado.');
          setShowCustomerModal(true);
          return;
        }
      }

      let finalPayments: PaymentEntry[] = [];

      if (isSplitMode) {
        if (!isSplitFullyPaid) {
          error('Pagamento incompleto', `Ainda falta receber ${formatCurrency(remainingInSplits)} para completar o total.`);
          return;
        }
        finalPayments = paymentSplits;
      } else {
        if (selectedPaymentMethod === 'dinheiro') {
          if (cashNum < total) {
            error('Valor insuficiente', `Faltam ${formatCurrency(cashRemaining)} a pagar. Divida o pagamento ou informe o valor completo.`);
            return;
          }
          finalPayments = [
            {
              method: 'dinheiro',
              amount: total,
              change_amount: cashChange,
            },
          ];
        } else if (selectedPaymentMethod === 'credito') {
          finalPayments = [
            {
              method: 'credito',
              amount: total,
              installments: creditInstallments,
            },
          ];
        } else if (selectedPaymentMethod === 'fiado') {
          if (!customer) {
            error('Cliente Obrigatório', 'Selecione um cliente para registrar venda a prazo (fiado).');
            setShowCustomerModal(true);
            return;
          }
          finalPayments = [
            {
              method: 'fiado',
              amount: total,
            },
          ];
        } else {
          finalPayments = [
            {
              method: selectedPaymentMethod,
              amount: total,
            },
          ];
        }
      }

      const sale = checkout(finalPayments);
      setShowPaymentModal(false);
      setFinishedSale(sale);
      setCpfPromptedThisSale(false);
      setTempCpfInput('');
      setCpfMatchCustomer(null);

      // Efeito festivo de venda finalizada
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      error('Erro ao finalizar venda', err.message);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4">
      {/* LEFT SECTION: Search & Quick Product Catalog (60%) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 overflow-hidden">
        {/* Top Search & Barcode Input Bar */}
        <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1">
            <Input
              ref={searchInputRef}
              placeholder="Escanear código de barras ou buscar por nome/SKU... (Enter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              leftIcon={<Barcode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              className="py-3 text-base font-medium rounded-2xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Botão de Consulta de Preço Rápido (F9) */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowPriceCheckModal(true)}
            leftIcon={<Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            className="h-[46px] whitespace-nowrap font-bold border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm cursor-pointer"
            title="Consultar Preço de Produto (F9)"
          >
            <span className="hidden sm:inline">Consultar Preço</span>
            <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-800/70 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono ml-1 font-bold">
              F9
            </span>
          </Button>
        </div>

        {/* Category Horizontal Filter Pills with Mouse Wheel Scroll & Arrow Navigation */}
        <div className="relative flex items-center py-2.5">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm mr-1 flex-shrink-0 z-10 transition-colors cursor-pointer"
            title="Rolar categorias para esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={categoryScrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none"
            title="Role a roda do mouse aqui para ver mais categorias"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos os Itens ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm ml-1 flex-shrink-0 z-10 transition-colors cursor-pointer"
            title="Rolar categorias para direita"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <Search className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Nenhum produto encontrado</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tente outro termo ou limpe os filtros de categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-2">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock <= 0;
                const isLowStock = p.current_stock > 0 && p.current_stock <= p.min_stock;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p, 1)}
                    className={`group relative bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isOutOfStock ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <div>
                      {/* Product Image Thumbnail */}
                      <div className="w-full h-24 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden mb-2 border border-slate-100 dark:border-slate-800">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{p.sku}</span>
                        )}
                      </div>

                      {/* Name & SKU */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{p.sku}</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                        {p.name}
                      </h4>
                    </div>

                    {/* Price & Stock Badge */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(p.sale_price)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isOutOfStock
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400'
                            : isLowStock
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {p.current_stock} un
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart & Checkout (40%) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 overflow-hidden">
        {/* Customer & Cart Header */}
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Carrinho PDV</h3>
            <Badge variant="success" size="sm">
              {totalItemsCount} itens
            </Badge>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 p-1 transition-colors"
              title="Limpar Carrinho (F8)"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar (F8)
            </button>
          )}
        </div>

        {/* Customer & CPF Selector Bar */}
        <div className="py-2.5 flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {customer ? customer.name : 'Cliente Balcão (Não identificado)'}
              </span>
            </div>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 whitespace-nowrap ml-2 transition-colors cursor-pointer"
            >
              {customer ? 'Alterar' : '+ Identificar'}
            </button>
          </div>

          {/* Botão e Status Fixo de CPF na Nota */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                {customerDocument || customer?.cpf_cnpj ? (
                  <>CPF na Nota: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{customerDocument || customer?.cpf_cnpj}</strong></>
                ) : (
                  'CPF na Nota: Não informado'
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setTempCpfInput(customerDocument || customer?.cpf_cnpj || '');
                setShowCpfModal(true);
              }}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 whitespace-nowrap cursor-pointer hover:underline"
              title="Clique para informar ou alterar o CPF do cliente"
            >
              {customerDocument || customer?.cpf_cnpj ? 'Alterar CPF' : '+ CPF na Nota (F6)'}
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-100 dark:divide-slate-800">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <ShoppingCart className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">O carrinho está vazio</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Clique nos produtos ao lado ou use o leitor de código de barras.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.product_name}</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatCurrency(item.unit_price)} un. {item.discount > 0 && `(Desc. ${formatCurrency(item.discount)})`}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-sm transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Total price & remove */}
                <div className="text-right min-w-[70px]">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">{formatCurrency(item.total_price)}</p>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-[10px] text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions Bottom */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Subtotal & Discount Row */}
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Subtotal ({totalItemsCount} itens)</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              onClick={() => {
                setTempDiscountValue(discount.toString());
                setTempDiscountType(discountType);
                setShowDiscountModal(true);
              }}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Percent className="w-3 h-3" /> {discount > 0 ? 'Editar Desconto (F3)' : '+ Aplicar Desconto (F3)'}
            </button>
            {discountAmount > 0 && (
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatCurrency(discountAmount)}</span>
            )}
          </div>

          {/* Big Total */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Total a Pagar</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-display">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            variant="primary"
            className="w-full text-base font-extrabold shadow-lg shadow-emerald-600/30 mt-1"
            disabled={items.length === 0}
            onClick={handleOpenPayment}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Finalizar Venda (F4)
          </Button>

          {/* Keyboard Shortcuts Hint Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">F2</strong> Busca</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">F3</strong> Desc.</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">F4</strong> Pagar</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">F6</strong> CPF</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">F8</strong> Limpar</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Ctrl+A</strong> Abrir</span>
            <span className="font-medium"><strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Ctrl+F</strong> Fechar</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORMAS DE PAGAMENTO */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pagamento da Venda"
        subtitle={`Total da venda: ${formatCurrency(total)}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Alternador de Modo: Pagamento Único vs Dividir Pagamento */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsSplitMode(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isSplitMode
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Pagamento Único (100%)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSplitMode(true);
                if (paymentSplits.length === 0) {
                  setSplitAmountInput(total.toFixed(2));
                }
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isSplitMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Dividir / Misto (Múltiplas Formas)
            </button>
          </div>

          {/* ============================================================ */}
          {/* MODO 1: PAGAMENTO ÚNICO (100% EM UMA FORMA) */}
          {/* ============================================================ */}
          {!isSplitMode && (
            <div className="space-y-4">
              {/* Payment Method Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  { id: 'pix', label: 'PIX', icon: QrCode },
                  { id: 'debito', label: 'Débito', icon: CreditCard },
                  { id: 'credito', label: 'Crédito', icon: CreditCard },
                  { id: 'fiado', label: 'Fiado', icon: User },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedPaymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(m.id as PaymentMethod)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Method Content */}
              {selectedPaymentMethod === 'dinheiro' && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <Input
                    label="Valor Recebido em Dinheiro (R$)"
                    placeholder="0,00"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                    autoFocus
                  />

                  {/* Fast Cash Buttons */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Atalhos de Cédulas</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCashGiven(total.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        Exato ({formatCurrency(total)})
                      </button>
                      {[10, 20, 50, 100, 200].map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => setCashGiven(note.toFixed(2))}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                        >
                          R$ {note}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Painel Dinâmico: Valor Restante a Pagar vs Troco */}
                  {isCashInsufficient ? (
                    <div className="space-y-2">
                      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-300 dark:border-rose-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                              Valor Restante a Pagar:
                            </p>
                            <p className="text-[11px] text-rose-700 dark:text-rose-300">
                              Recebido {formatCurrency(cashNum)} de {formatCurrency(total)}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
                          {formatCurrency(cashRemaining)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSplitMode(true);
                          setPaymentSplits([
                            { method: 'dinheiro', amount: cashNum, change_amount: 0 }
                          ]);
                          setSplitAmountInput(cashRemaining.toFixed(2));
                          setSplitMethodInput('pix');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                      >
                        <Layers className="w-4 h-4" /> Dividir restante ({formatCurrency(cashRemaining)}) no PIX ou Cartão
                      </button>
                    </div>
                  ) : cashNum > total ? (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                          Troco a Devolver:
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          Recebido em mãos: {formatCurrency(cashNum)}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatCurrency(cashChange)}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor Exato Quitado:</span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(total)} (Sem troco)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {selectedPaymentMethod === 'pix' && (() => {
                const activePixKey = store.pix_key || '08395029667';
                const pixPayload = generatePixPayload({
                  key: activePixKey,
                  merchantName: store.name || 'VASISTORE UTILIDADES',
                  merchantCity: store.city || 'BRASILIA',
                  amount: total,
                });
                const pixQrUrl = getPixQrCodeUrl(pixPayload, 260);

                const handleCopyPix = (text: string, type: 'key' | 'payload') => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(text);
                    setCopiedPixType(type);
                    success(type === 'key' ? 'Chave PIX copiada com sucesso!' : 'Código PIX Copia e Cola copiado!');
                    setTimeout(() => setCopiedPixType(null), 3000);
                  }
                };

                return (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>QR Code de Pagamento PIX Gerado</span>
                    </div>

                    {/* QR Code Real Gerado Dinamicamente */}
                    <div className="relative inline-block bg-white p-3 rounded-2xl shadow-md border-2 border-emerald-500/30 mx-auto">
                      <img
                        src={pixQrUrl}
                        alt="QR Code PIX"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                      />
                    </div>

                    {/* Dados da Chave PIX e Botões de Ação */}
                    <div className="space-y-2 max-w-sm mx-auto">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Chave PIX Cadastrada</p>
                          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-black tracking-wider">
                            {activePixKey}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            Valor a receber: <strong className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(total)}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPix(activePixKey, 'key')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-300 dark:border-emerald-700 cursor-pointer"
                          title="Copiar Chave PIX"
                        >
                          {copiedPixType === 'key' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPixType === 'key' ? 'Copiada!' : 'Copiar'}</span>
                        </button>
                      </div>

                      {/* Botão Copiar PIX Copia e Cola */}
                      <button
                        type="button"
                        onClick={() => handleCopyPix(pixPayload, 'payload')}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-600 cursor-pointer"
                      >
                        {copiedPixType === 'payload' ? (
                          <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        )}
                        <span>{copiedPixType === 'payload' ? 'Código PIX Copiado!' : 'Copiar Código PIX (Copia e Cola)'}</span>
                      </button>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Abra o app do seu banco, escolha <strong>PIX</strong> e escaneie o QR Code acima.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {selectedPaymentMethod === 'credito' && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Quantidade de Parcelas no Cartão
                  </label>
                  <select
                    value={creditInstallments}
                    onChange={(e) => setCreditInstallments(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                      <option key={n} value={n} className="bg-white dark:bg-slate-900">
                        {n}x de {formatCurrency(total / n)} {n === 1 ? '(À vista)' : '(Sem juros)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPaymentMethod === 'debito' && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cartão de Débito</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Insira ou aproxime o cartão na maquininha no valor de <strong className="text-slate-900 dark:text-white">{formatCurrency(total)}</strong></p>
                </div>
              )}

              {selectedPaymentMethod === 'fiado' && (
                <div className="space-y-3">
                  {!customer ? (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/70 rounded-2xl border-2 border-rose-300 dark:border-rose-800 space-y-3 animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Cliente Obrigatório para Venda a Prazo</h4>
                          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                            A venda no prazo (fiado) de <strong>{formatCurrency(total)}</strong> não pode ser finalizada sem identificar um <strong>cliente cadastrado</strong>.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setShowCustomerModal(true)}
                        leftIcon={<User className="w-4 h-4" />}
                        className="w-full font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        + Selecionar / Cadastrar Cliente Agora
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Venda a Prazo Autorizada</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCustomerModal(true)}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-900 cursor-pointer"
                        >
                          Trocar Cliente
                        </button>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-left">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{customer.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            CPF/CNPJ: {customer.cpf_cnpj || 'Não informado'} • Tel: {customer.phone || customer.whatsapp || '-'}
                          </p>
                          {customer.credit_limit && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                              Limite de crédito: {formatCurrency(customer.credit_limit)}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 text-left">
                        O débito de <strong>{formatCurrency(total)}</strong> será vinculado ao cliente no módulo <strong>Contas a Receber</strong> com vencimento em 30 dias.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* MODO 2: DIVIDIR PAGAMENTO (MÚLTIPLAS FORMAS / MISTO) */}
          {/* ============================================================ */}
          {isSplitMode && (
            <div className="space-y-4">
              {/* Painel do Saldo Restante a Pagar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total da Venda</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(total)}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total Adicionado</p>
                  <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(totalPaidInSplits)}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  remainingInSplits > 0
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800'
                }`}>
                  <p className={`text-[10px] uppercase font-bold ${remainingInSplits > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                    {remainingInSplits > 0 ? '⚠️ Restante a Pagar' : '✅ Venda Coberta'}
                  </p>
                  <p className={`text-base font-black ${remainingInSplits > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {formatCurrency(remainingInSplits)}
                  </p>
                </div>
              </div>

              {/* Lista de Formas Adicionadas */}
              {paymentSplits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pagamentos Registrados:</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {paymentSplits.map((split, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">
                            {split.method.toUpperCase()}
                          </Badge>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(split.amount)}
                          </span>
                          {split.installments && split.installments > 1 && (
                            <span className="text-[10px] text-slate-400">({split.installments}x)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSplitPayment(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remover forma"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário para Adicionar Parte do Pagamento */}
              {remainingInSplits > 0.001 ? (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Adicionar Forma de Pagamento para o Restante ({formatCurrency(remainingInSplits)}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Forma</label>
                      <select
                        value={splitMethodInput}
                        onChange={(e) => setSplitMethodInput(e.target.value as PaymentMethod)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="pix">PIX</option>
                        <option value="debito">Cartão Débito</option>
                        <option value="credito">Cartão Crédito</option>
                        <option value="fiado">Fiado (A Prazo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Valor (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remainingInSplits}
                        value={splitAmountInput}
                        onChange={(e) => setSplitAmountInput(e.target.value)}
                        placeholder={remainingInSplits.toFixed(2)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddSplitPayment}
                        className="w-full font-bold h-[38px]"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Total da venda 100% coberto! Você já pode finalizar.</span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button
              variant={isFiadoWithoutCustomer ? 'outline' : 'primary'}
              size="lg"
              onClick={isFiadoWithoutCustomer ? () => setShowCustomerModal(true) : handleFinishSale}
              disabled={
                isSplitMode 
                  ? (!isSplitFullyPaid || isFiadoWithoutCustomer)
                  : ((selectedPaymentMethod === 'dinheiro' && isCashInsufficient) || isFiadoWithoutCustomer)
              }
              leftIcon={isFiadoWithoutCustomer ? <User className="w-5 h-5 text-amber-500" /> : <Check className="w-5 h-5" />}
              className={`font-bold transition-all ${
                isFiadoWithoutCustomer
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 cursor-pointer'
                  : 'shadow-emerald-600/30'
              }`}
            >
              {isFiadoWithoutCustomer
                ? '⚠️ Selecione o Cliente para Vender a Prazo'
                : isSplitMode
                ? !isSplitFullyPaid
                  ? `Falta ${formatCurrency(remainingInSplits)} a Pagar`
                  : 'Confirmar e Imprimir Recibo'
                : selectedPaymentMethod === 'dinheiro' && isCashInsufficient
                ? `Falta ${formatCurrency(cashRemaining)} a Pagar`
                : 'Confirmar e Imprimir Recibo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: APLICAR DESCONTO */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        title="Aplicar Desconto na Venda"
        subtitle={`Subtotal: ${formatCurrency(subtotal)}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTempDiscountType('value')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                tempDiscountType === 'value'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Em Reais (R$)
            </button>
            <button
              type="button"
              onClick={() => setTempDiscountType('percent')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                tempDiscountType === 'percent'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Em Porcentagem (%)
            </button>
          </div>

          <Input
            label={tempDiscountType === 'value' ? 'Valor do Desconto (R$)' : 'Percentual de Desconto (%)'}
            placeholder="0"
            type="number"
            min="0"
            value={tempDiscountValue}
            onChange={(e) => setTempDiscountValue(e.target.value)}
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDiscountModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const val = parseFloat(tempDiscountValue) || 0;
                applyDiscount(val, tempDiscountType);
                setShowDiscountModal(false);
                success('Desconto aplicado com sucesso!');
              }}
            >
              Aplicar Desconto
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: IDENTIFICAR CLIENTE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Identificar Cliente na Venda"
        subtitle="Vincule a venda a um cliente cadastrado para histórico e fiado"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCustomer(null);
                setShowCustomerModal(false);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
            >
              Consumidor Final (Sem cadastro)
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {customers.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCustomer(c);
                  setShowCustomerModal(false);
                  success(`Cliente vinculado: ${c.name}`);
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  customer?.id === c.id ? 'bg-emerald-50 border border-emerald-300' : ''
                }`}
              >
                <div>
                  <p className="font-bold text-xs text-slate-900">{c.name}</p>
                  <p className="text-[10px] text-slate-500">
                    CPF: {formatCpfCnpj(c.cpf_cnpj)} • Tel: {c.phone || c.whatsapp || '-'}
                  </p>
                </div>
                {customer?.id === c.id && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: ABERTURA DE CAIXA RÁPIDA */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showOpenCashModal}
        onClose={() => setShowOpenCashModal(false)}
        title="Abrir Caixa para Iniciar Vendas"
        subtitle="Informe o valor em dinheiro do fundo de troco inicial"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmOpenCash} className="space-y-4">
          <Input
            label="Fundo de Troco Inicial (R$)"
            type="number"
            step="0.01"
            min="0"
            value={initialFloatInput}
            onChange={(e) => setInitialFloatInput(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOpenCashModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Abrir Caixa
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: CPF NA NOTA (GATILHO AUTOMÁTICO NO 1º ITEM OU BOTÃO MANUAL) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showCpfModal}
        onClose={handleSkipCpf}
        title="CPF na Nota Fiscal"
        subtitle="Identificação do consumidor na venda"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmCpf} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Deseja CPF ou CNPJ na nota?</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Digite os números do documento para constar no cupom fiscal e comprovante.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              CPF ou CNPJ do Cliente
            </label>
            <Input
              value={tempCpfInput}
              onChange={(e) => handleCpfInputChange(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              leftIcon={<User className="w-4 h-4 text-emerald-600" />}
              autoFocus
            />
          </div>

          {cpfMatchCustomer && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs flex items-center gap-2 text-blue-800 dark:text-blue-200 animate-in fade-in">
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>Cliente cadastrado encontrado: <strong>{cpfMatchCustomer.name}</strong></span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSkipCpf}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold cursor-pointer py-2 px-1"
            >
              Não Informar / Pular (Esc)
            </button>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-4 h-4" />}
                className="font-bold shadow-emerald-600/30"
              >
                Confirmar CPF (Enter)
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: RECIBO TÉRMICO DE VENDA CONCLUÍDA */}
      {/* ========================================================================= */}
      <ReceiptModal
        isOpen={!!finishedSale}
        onClose={() => setFinishedSale(null)}
        sale={finishedSale}
        store={store}
      />

      {/* ========================================================================= */}
      {/* MODAL 7: CONSULTA RÁPIDA DE PREÇOS (TERMINAL DE PREÇOS) */}
      {/* ========================================================================= */}
      <PriceCheckModal
        isOpen={showPriceCheckModal}
        onClose={() => setShowPriceCheckModal(false)}
        onAddToCart={(prod) => {
          handleAddProduct(prod, 1);
        }}
      />
    </div>
  );
}
