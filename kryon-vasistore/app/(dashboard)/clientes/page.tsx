'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, Search, Edit3, Trash2, Phone, 
  MessageCircle, DollarSign, ShoppingBag, Eye, 
  Check, ExternalLink, MapPin, Mail
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Customer, Sale, AccountReceivable } from '../../../lib/db/types';
import { formatCurrency, formatCpfCnpj, formatPhone, formatDateTime, getWhatsAppLink } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function CustomersPage() {
  const { store } = useStore();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cpf_cnpj: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    number: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '',
    notes: '',
    credit_limit: '500',
  });

  const loadData = () => {
    setCustomers(db.getCustomers(store.id));
    setSales(db.getSales(store.id));
    setReceivables(db.getAccountsReceivable(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenNew = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      cpf_cnpj: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      number: '',
      neighborhood: '',
      city: store.city || 'São Paulo',
      state: store.state || 'SP',
      zip_code: '',
      notes: '',
      credit_limit: '500',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      cpf_cnpj: c.cpf_cnpj || '',
      phone: c.phone || '',
      whatsapp: c.whatsapp || '',
      email: c.email || '',
      address: c.address || '',
      number: c.number || '',
      neighborhood: c.neighborhood || '',
      city: c.city || 'São Paulo',
      state: c.state || 'SP',
      zip_code: c.zip_code || '',
      notes: c.notes || '',
      credit_limit: (c.credit_limit || 500).toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      error('Campo obrigatório', 'Informe o nome do cliente.');
      return;
    }

    try {
      if (editingCustomer) {
        db.updateCustomer(editingCustomer.id, {
          name: formData.name,
          cpf_cnpj: formData.cpf_cnpj,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          notes: formData.notes,
          credit_limit: parseFloat(formData.credit_limit) || 500,
        });
        success('Cliente atualizado com sucesso!');
      } else {
        db.addCustomer({
          store_id: store.id,
          name: formData.name,
          cpf_cnpj: formData.cpf_cnpj,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          notes: formData.notes,
          credit_limit: parseFloat(formData.credit_limit) || 500,
          active: true,
        });
        success('Cliente cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao salvar cliente', err.message);
    }
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Deseja realmente excluir o cliente "${c.name}"?`)) {
      db.deleteCustomer(c.id);
      success('Cliente removido!');
      loadData();
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Histórico do cliente selecionado
  const customerSales = useMemo(() => {
    if (!selectedCustomerHistory) return [];
    return sales.filter((s) => s.customer_id === selectedCustomerHistory.id);
  }, [sales, selectedCustomerHistory]);

  const customerDebts = useMemo(() => {
    if (!selectedCustomerHistory) return [];
    return receivables.filter(
      (r) => r.customer_id === selectedCustomerHistory.id && (r.status === 'pending' || r.status === 'overdue')
    );
  }, [receivables, selectedCustomerHistory]);

  return (
    <div className="space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Cadastro & Fidelização de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestão de crediário/fiado, histórico de compras, limite de crédito e contato direto por WhatsApp.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleOpenNew}
          className="shadow-emerald-600/30"
        >
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <Input
          placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* Customers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Contato</th>
                <th className="px-4 py-3.5">Cidade / UF</th>
                <th className="px-4 py-3.5 text-center">Compras</th>
                <th className="px-4 py-3.5 text-right">Total Gasto</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {c.cpf_cnpj ? formatCpfCnpj(c.cpf_cnpj) : 'Sem documento'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 dark:text-slate-200">{formatPhone(c.whatsapp || c.phone)}</span>
                        {c.whatsapp && (
                          <a
                            href={getWhatsAppLink(
                              c.whatsapp,
                              `Olá ${c.name}, tudo bem? Aqui é da ${store.name}!`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {c.city || 'São Paulo'}/{c.state || 'SP'}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {c.total_purchases}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedCustomerHistory(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Ficha & Histórico"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Editar Cliente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir Cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: FORMULÁRIO DE CLIENTE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle="Preencha os dados de contato e endereço"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Maria Aparecida da Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CPF ou CNPJ"
              placeholder="000.000.000-00"
              value={formData.cpf_cnpj}
              onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
            />
            <Input
              label="WhatsApp / Celular *"
              placeholder="(11) 98765-4321"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Limite de Crédito / Fiado (R$)"
              type="number"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Endereço (Rua/Avenida)"
                placeholder="Rua das Flores"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Input
              label="Número"
              placeholder="120"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Bairro"
              placeholder="Centro"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            />
            <Input
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="UF"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <Input
            label="Observações / Preferências"
            placeholder="Ex: Compra potes de vidro, gosta de novidades para cozinha"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Salvar Cliente
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: FICHA DO CLIENTE & HISTÓRICO */}
      <Modal
        isOpen={!!selectedCustomerHistory}
        onClose={() => setSelectedCustomerHistory(null)}
        title={`Ficha de ${selectedCustomerHistory?.name}`}
        subtitle="Histórico de compras e saldo devedor"
        maxWidth="lg"
      >
        {selectedCustomerHistory && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Total Comprado</p>
                <p className="text-base font-black text-emerald-950">
                  {formatCurrency(selectedCustomerHistory.total_spent)}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                <p className="text-[10px] font-bold text-blue-800 uppercase">Compras Realizadas</p>
                <p className="text-base font-black text-blue-950">
                  {selectedCustomerHistory.total_purchases}
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Débito em Aberto</p>
                <p className="text-base font-black text-amber-950">
                  {formatCurrency(customerDebts.reduce((acc, d) => acc + (d.amount - d.amount_paid), 0))}
                </p>
              </div>
            </div>

            {/* Sales List */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Histórico de Vendas
              </h4>
              <div className="border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                    <tr>
                      <th className="px-3 py-2">Cupom</th>
                      <th className="px-3 py-2">Data</th>
                      <th className="px-3 py-2">Pagamento</th>
                      <th className="px-3 py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customerSales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-slate-400">
                          Nenhuma compra registrada.
                        </td>
                      </tr>
                    ) : (
                      customerSales.map((s) => (
                        <tr key={s.id}>
                          <td className="px-3 py-2 font-bold">{s.sale_number}</td>
                          <td className="px-3 py-2 text-slate-500">{formatDateTime(s.created_at)}</td>
                          <td className="px-3 py-2">{s.payment_method}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
                            {formatCurrency(s.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomerHistory(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
