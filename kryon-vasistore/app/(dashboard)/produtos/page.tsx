'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Plus, Search, Filter, Edit3, Trash2, 
  Copy, Barcode, AlertTriangle, Check, ExternalLink, 
  DollarSign, ArrowUpDown, Download, Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Product, Category, Supplier, ProductUnit } from '../../../lib/db/types';
import { formatCurrency, formatPercent, generateSku, generateBarcode } from '../../../lib/formatters';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';

export default function ProductsPage() {
  const { store } = useStore();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Campos do formulário
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    category_id: '',
    supplier_id: '',
    brand: '',
    unit: 'unidade' as ProductUnit,
    cost_price: '0.00',
    sale_price: '0.00',
    current_stock: '0',
    min_stock: '5',
    max_stock: '100',
    image_url: '',
    active: true,
  });

  const loadData = () => {
    setProducts(db.getProducts(store.id));
    setCategories(db.getCategories(store.id));
    setSuppliers(db.getSuppliers(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  // Cálculo em tempo real da margem de lucro no formulário
  const cost = parseFloat(formData.cost_price.replace(',', '.')) || 0;
  const sale = parseFloat(formData.sale_price.replace(',', '.')) || 0;
  const calculatedMargin = cost > 0 ? ((sale - cost) / cost) * 100 : 0;

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: generateSku('UTL'),
      barcode: generateBarcode(),
      description: '',
      category_id: categories[0]?.id || '',
      supplier_id: suppliers[0]?.id || '',
      brand: 'UtilLar',
      unit: 'unidade',
      cost_price: '10.00',
      sale_price: '20.00',
      current_stock: '10',
      min_stock: '5',
      max_stock: '50',
      image_url: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || '',
      description: p.description || '',
      category_id: p.category_id || '',
      supplier_id: p.supplier_id || '',
      brand: p.brand || '',
      unit: p.unit,
      cost_price: p.cost_price.toString(),
      sale_price: p.sale_price.toString(),
      current_stock: p.current_stock.toString(),
      min_stock: p.min_stock.toString(),
      max_stock: (p.max_stock || 100).toString(),
      image_url: p.image_url || '',
      active: p.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      error('Campos obrigatórios', 'Preencha o nome e o código SKU do produto.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === formData.category_id);
    const selectedSup = suppliers.find((s) => s.id === formData.supplier_id);

    try {
      if (editingProduct) {
        db.updateProduct(editingProduct.id, {
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode,
          description: formData.description,
          category_id: formData.category_id,
          category_name: selectedCat?.name,
          supplier_id: formData.supplier_id,
          supplier_name: selectedSup?.trade_name || selectedSup?.company_name,
          brand: formData.brand,
          unit: formData.unit,
          cost_price: cost,
          sale_price: sale,
          current_stock: parseFloat(formData.current_stock) || 0,
          min_stock: parseFloat(formData.min_stock) || 5,
          max_stock: parseFloat(formData.max_stock) || 100,
          image_url: formData.image_url,
          active: formData.active,
        });
        success('Produto atualizado com sucesso!');
      } else {
        db.addProduct({
          store_id: store.id,
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode,
          description: formData.description,
          category_id: formData.category_id,
          category_name: selectedCat?.name,
          supplier_id: formData.supplier_id,
          supplier_name: selectedSup?.trade_name || selectedSup?.company_name,
          brand: formData.brand,
          unit: formData.unit,
          cost_price: cost,
          sale_price: sale,
          current_stock: parseFloat(formData.current_stock) || 0,
          min_stock: parseFloat(formData.min_stock) || 5,
          max_stock: parseFloat(formData.max_stock) || 100,
          image_url: formData.image_url,
          active: formData.active,
        });
        success('Produto cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao salvar produto', err.message);
    }
  };

  const handleDuplicate = (p: Product) => {
    try {
      const dup = db.duplicateProduct(p.id);
      success(`Produto duplicado: ${dup.name}`, `Novo SKU: ${dup.sku}`);
      loadData();
    } catch (err: any) {
      error('Erro ao duplicar', err.message);
    }
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${p.name}"?`)) {
      db.deleteProduct(p.id);
      success('Produto excluído com sucesso!');
      loadData();
    }
  };

  // Filtragem dos produtos
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;

      if (stockFilter === 'low' && (p.current_stock <= 0 || p.current_stock > p.min_stock)) return false;
      if (stockFilter === 'out' && p.current_stock > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & New Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Catálogo de Produtos & Utensílios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Controle de potes herméticos, vasilhas, faqueiros, panelas, margem de lucro e estoque.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleOpenNewModal}
          className="shadow-emerald-600/30"
        >
          Cadastrar Produto
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Buscar por nome, SKU ou código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todas as Categorias ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todos os Níveis de Estoque</option>
            <option value="low" className="bg-white dark:bg-slate-900">⚠️ Apenas Estoque Baixo</option>
            <option value="out" className="bg-white dark:bg-slate-900">⛔ Apenas Sem Estoque (Zerados)</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Produto</th>
                <th className="px-4 py-3.5">Categoria</th>
                <th className="px-4 py-3.5 text-right">Preço Custo</th>
                <th className="px-4 py-3.5 text-right">Preço Venda</th>
                <th className="px-4 py-3.5 text-center">Margem</th>
                <th className="px-4 py-3.5 text-center">Estoque Atual</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Nenhum produto cadastrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isOutOfStock = p.current_stock <= 0;
                  const isLowStock = p.current_stock > 0 && p.current_stock <= p.min_stock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                              SKU: {p.sku} {p.barcode && `• EAN: ${p.barcode}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {p.category_name || 'Utilidades'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                        {formatCurrency(p.cost_price)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(p.sale_price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          {formatPercent(p.profit_margin)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-bold px-2 py-1 rounded-lg text-xs ${
                            isOutOfStock
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 animate-pulse'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {p.current_stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={p.active ? 'success' : 'default'} size="sm">
                          {p.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Duplicar Produto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Editar Produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Cadastrar / Editar Produto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        subtitle="Preencha os dados e preços com cálculo automático de margem"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Produto *"
              placeholder="Ex: Kit 5 Potes Herméticos Quadrados Sanremo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Código SKU *"
                placeholder="POT-1001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
              <Input
                label="Código de Barras (EAN)"
                placeholder="789..."
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Fornecedor
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="" className="bg-white dark:bg-slate-900">Nenhum</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">
                    {s.trade_name || s.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Unidade de Medida
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="unidade" className="bg-white dark:bg-slate-900">Unidade</option>
                <option value="kit" className="bg-white dark:bg-slate-900">Kit</option>
                <option value="caixa" className="bg-white dark:bg-slate-900">Caixa</option>
                <option value="pacote" className="bg-white dark:bg-slate-900">Pacote</option>
                <option value="duzia" className="bg-white dark:bg-slate-900">Dúzia</option>
              </select>
            </div>
          </div>

          {/* Pricing & Automatic Profit Margin Bar */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-3">
              Precificação & Margem de Lucro Automática
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <Input
                label="Preço de Custo (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Preço de Venda (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              />

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Margem de Lucro</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {formatPercent(calculatedMargin)}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Estoque Atual"
              type="number"
              value={formData.current_stock}
              onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
            />
            <Input
              label="Estoque Mínimo (Alerta)"
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
            />
            <Input
              label="Estoque Máximo"
              type="number"
              value={formData.max_stock}
              onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
            />
          </div>

          {/* Image & Description */}
          <Input
            label="URL da Foto do Produto"
            placeholder="https://..."
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              Produto Ativo para Vendas no PDV
            </label>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
                {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
