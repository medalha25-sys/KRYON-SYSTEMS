'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, Plus, Search, Edit3, Trash2, Phone, 
  MessageCircle, Mail, MapPin, Package, Check 
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Supplier, Product } from '../../../lib/db/types';
import { formatCpfCnpj, formatPhone, getWhatsAppLink } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function SuppliersPage() {
  const { store } = useStore();
  const { success, error } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    trade_name: '',
    cnpj_cpf: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    notes: '',
  });

  const loadData = () => {
    setSuppliers(db.getSuppliers(store.id));
    setProducts(db.getProducts(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenNew = () => {
    setEditingSupplier(null);
    setFormData({
      company_name: '',
      trade_name: '',
      cnpj_cpf: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: 'São Paulo',
      state: 'SP',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      company_name: s.company_name,
      trade_name: s.trade_name || '',
      cnpj_cpf: s.cnpj_cpf || '',
      phone: s.phone || '',
      whatsapp: s.whatsapp || '',
      email: s.email || '',
      address: s.address || '',
      city: s.city || 'São Paulo',
      state: s.state || 'SP',
      notes: s.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) {
      error('Campo obrigatório', 'Informe a Razão Social do fornecedor.');
      return;
    }

    try {
      if (editingSupplier) {
        db.updateSupplier(editingSupplier.id, {
          company_name: formData.company_name,
          trade_name: formData.trade_name,
          cnpj_cpf: formData.cnpj_cpf,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          notes: formData.notes,
        });
        success('Fornecedor atualizado com sucesso!');
      } else {
        db.addSupplier({
          store_id: store.id,
          company_name: formData.company_name,
          trade_name: formData.trade_name,
          cnpj_cpf: formData.cnpj_cpf,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          notes: formData.notes,
          active: true,
        });
        success('Fornecedor cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao salvar fornecedor', err.message);
    }
  };

  const handleDelete = (s: Supplier) => {
    if (confirm(`Deseja realmente excluir o fornecedor "${s.trade_name || s.company_name}"?`)) {
      db.deleteSupplier(s.id);
      success('Fornecedor removido com sucesso!');
      loadData();
    }
  };

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase().trim();
    return suppliers.filter(
      (s) =>
        s.company_name.toLowerCase().includes(q) ||
        (s.trade_name && s.trade_name.toLowerCase().includes(q)) ||
        (s.cnpj_cpf && s.cnpj_cpf.includes(q))
    );
  }, [suppliers, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Fornecedores & Fabricantes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestão de indústrias de plásticos, refratários, vidros e utilidades domésticas.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleOpenNew}
          className="shadow-emerald-600/30"
        >
          Novo Fornecedor
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((s) => {
          const linkedCount = products.filter((p) => p.supplier_id === s.id).length;

          return (
            <Card key={s.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {s.trade_name || s.company_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.company_name}</p>
                    {s.cnpj_cpf && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        CNPJ: {formatCpfCnpj(s.cnpj_cpf)}
                      </p>
                    )}
                  </div>
                  <Badge variant="info" size="sm">
                    {linkedCount} produtos
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatPhone(s.phone)}</span>
                    </div>
                  )}
                  {s.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <a
                        href={getWhatsAppLink(s.whatsapp, 'Olá, gostaria de fazer um pedido de reposição.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        {formatPhone(s.whatsapp)} (WhatsApp Pedidos)
                      </a>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.email}</span>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border dark:border-slate-800">
                    {s.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: FORNECEDOR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        subtitle="Cadastre indústrias e distribuidores parceiros"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Razão Social *"
            placeholder="Ex: Sanremo Plásticos e Utilidades S.A."
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Fantasia"
              placeholder="Ex: Sanremo Plásticos"
              value={formData.trade_name}
              onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
            />
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj_cpf}
              onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone Comercial"
              placeholder="(11) 3000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="WhatsApp Pedidos / Representante"
              placeholder="(11) 98765-4321"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>

          <Input
            label="E-mail de Pedidos"
            type="email"
            placeholder="pedidos@fornecedor.com.br"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Observações / Linhas de Produtos"
            placeholder="Ex: Fornece potes herméticos e garrafas térmicas com pedido mínimo de R$ 500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Salvar Fornecedor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
