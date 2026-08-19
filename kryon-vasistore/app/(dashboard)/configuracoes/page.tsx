'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Store as StoreIcon, Printer, Database, 
  Save, RefreshCw, Download, Check, ShieldCheck, 
  Users, UserPlus, Edit3, Trash2, Shield, Phone, Mail,
  Sun, Moon, Laptop, Palette, Smartphone, QrCode
} from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePwa } from '../../../contexts/PwaContext';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { db } from '../../../lib/db';
import { Profile, UserRole } from '../../../lib/db/types';
import { formatDateTime, formatPhone } from '../../../lib/formatters';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';

export default function SettingsPage() {
  const { store, updateStoreSettings } = useStore();
  const { user: currentUser, refreshUsers } = useAuth();
  const { success, error, info } = useToast();
  const { theme, setTheme } = useTheme();
  const { isInstallable, isInstalled, isStandalone, openInstallFlow } = usePwa();

  // Dados da loja
  const [name, setName] = useState(store.name);
  const [tradeName, setTradeName] = useState(store.trade_name || '');
  const [cnpj, setCnpj] = useState(store.cnpj_cpf || '');
  const [phone, setPhone] = useState(store.phone || '');
  const [whatsapp, setWhatsapp] = useState(store.whatsapp || '');
  const [email, setEmail] = useState(store.email || '');
  const [pixKey, setPixKey] = useState(store.pix_key || '08395029667');
  const [address, setAddress] = useState(store.address || '');
  const [city, setCity] = useState(store.city || 'São Paulo');
  const [state, setState] = useState(store.state || 'SP');
  const [zipCode, setZipCode] = useState(store.zip_code || '');
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '');
  const [receiptMessage, setReceiptMessage] = useState(store.receipt_message || '');

  // Gestão de Funcionários
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);

  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePassword, setEmployeePassword] = useState('123');
  const [employeeRole, setEmployeeRole] = useState<UserRole>('caixa');
  const [employeeActive, setEmployeeActive] = useState(true);

  const loadEmployees = () => {
    const list = db.getProfiles(store.id);
    setEmployees(list);
  };

  useEffect(() => {
    loadEmployees();
  }, [store.id]);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      name,
      trade_name: tradeName,
      cnpj_cpf: cnpj,
      phone,
      whatsapp,
      email,
      pix_key: pixKey,
      address,
      city,
      state,
      zip_code: zipCode,
      logo_url: logoUrl,
      receipt_message: receiptMessage,
    });
    success('Configurações da loja salvas com sucesso!');
  };

  // Funcionários CRUD
  const handleOpenNewEmployee = () => {
    setEditingEmployee(null);
    setEmployeeName('');
    setEmployeeEmail('');
    setEmployeePhone('');
    setEmployeePassword('123');
    setEmployeeRole('caixa');
    setEmployeeActive(true);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Profile) => {
    setEditingEmployee(emp);
    setEmployeeName(emp.full_name);
    setEmployeeEmail(emp.email);
    setEmployeePhone(emp.phone || '');
    setEmployeePassword(emp.password || '123');
    setEmployeeRole(emp.role);
    setEmployeeActive(emp.active);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !employeeEmail.trim()) {
      error('Preencha os campos', 'Nome e e-mail são obrigatórios para o cadastro.');
      return;
    }
    if (!employeePassword.trim()) {
      error('Preencha a senha', 'A senha é obrigatória para o funcionário acessar o sistema.');
      return;
    }

    try {
      if (editingEmployee) {
        db.updateProfile(editingEmployee.id, {
          full_name: employeeName,
          email: employeeEmail,
          phone: employeePhone,
          password: employeePassword,
          role: employeeRole,
          active: employeeActive,
        });
        success('Funcionário atualizado com sucesso!');
      } else {
        db.createProfile({
          store_id: store.id,
          full_name: employeeName,
          email: employeeEmail,
          phone: employeePhone,
          password: employeePassword,
          role: employeeRole,
          active: employeeActive,
        });
        success('Funcionário cadastrado com sucesso!');
      }

      setIsEmployeeModalOpen(false);
      loadEmployees();
      refreshUsers();
    } catch (err: any) {
      error('Erro ao salvar funcionário', err.message);
    }
  };

  const handleDeleteEmployee = (emp: Profile) => {
    if (emp.id === currentUser?.id) {
      error('Ação bloqueada', 'Você não pode excluir o seu próprio usuário logado.');
      return;
    }

    if (confirm(`Deseja realmente remover o funcionário "${emp.full_name}"?`)) {
      db.deleteProfile(emp.id);
      success('Funcionário removido com sucesso!');
      loadEmployees();
      refreshUsers();
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'caixa':
        return 'Operador de caixa';
      case 'vendedor':
        return 'Vendedor';
      case 'gerente':
        return 'Gerente';
      case 'admin':
        return 'ADM';
      default:
        return r;
    }
  };

  const getRoleBadgeVariant = (r: UserRole): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' => {
    switch (r) {
      case 'admin':
        return 'purple';
      case 'gerente':
        return 'info';
      case 'vendedor':
        return 'success';
      case 'caixa':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      store: db.getStore(store.id),
      employees: db.getProfiles(store.id),
      products: db.getProducts(store.id),
      categories: db.getCategories(store.id),
      customers: db.getCustomers(store.id),
      suppliers: db.getSuppliers(store.id),
      sales: db.getSales(store.id),
      stockMovements: db.getStockMovements(store.id),
      cashRegisters: db.getCashRegisters(store.id),
      expenses: db.getExpenses(store.id),
      receivables: db.getAccountsReceivable(store.id),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_utillar_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup completo baixado em formato JSON!');
  };

  const handleClearAllData = () => {
    if (confirm('Atenção: Deseja realmente limpar todas as vendas, movimentações de estoque, histórico de caixa, clientes, despesas e dados de teste? Esta ação deixará o sistema 100% limpo e zerado para operação real.')) {
      db.clearAllTestData(store.id);
      success('Todos os dados foram limpos com sucesso! O sistema está pronto para uso real.');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Configurações da Loja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalize dados comerciais, cadastro de funcionários (Caixa, Vendedor, Gerente, ADM) e impressão.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: CADASTRO DE FUNCIONÁRIOS */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader
          title="Gestão de Funcionários & Equipe"
          subtitle="Cadastre e gerencie os acessos dos funcionários: Operador de caixa, Vendedor, Gerente e ADM"
          action={
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenNewEmployee}
              className="shadow-emerald-600/30"
            >
              + Cadastrar Funcionário
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Funcionário</th>
                <th className="px-4 py-3">E-mail de Acesso</th>
                <th className="px-4 py-3">Telefone / WhatsApp</th>
                <th className="px-4 py-3 text-center">Cargo / Opção</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 dark:text-slate-500">
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isCurrent = emp.id === currentUser?.id;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                            {emp.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {emp.full_name} {isCurrent && <span className="text-emerald-600 dark:text-emerald-400 font-medium">(Você)</span>}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Desde {formatDateTime(emp.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{emp.email}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {emp.phone ? formatPhone(emp.phone) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={getRoleBadgeVariant(emp.role)} size="sm">
                          {getRoleLabel(emp.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={emp.active ? 'success' : 'default'} size="sm">
                          {emp.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Editar Funcionário"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(emp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Remover Funcionário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* ========================================================================= */}
      {/* SEÇÃO 2: DADOS DA LOJA */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveStore} className="space-y-6">
        <Card>
          <CardHeader
            title="Dados Cadastrais da Empresa"
            subtitle="Informações exibidas no cabeçalho dos cupons e relatórios"
          />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Razão Social / Nome Oficial *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Nome Fantasia"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="CNPJ ou CPF"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
              <Input
                label="Telefone Comercial"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="WhatsApp para Atendimento"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <Input
                label="E-mail de Contato"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <Input
                  label="URL do Logotipo da Loja"
                  placeholder="/logo.png ou https://..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 font-semibold">Pré-visualização:</span>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-[160px]">
                      <img src={logoUrl} alt="Logo Preview" className="h-8 w-auto object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/70">
              <Input
                label="Chave PIX da Loja (Para QR Code e Pagamentos no PDV) *"
                placeholder="Ex: 08395029667 ou seu CNPJ/Email/Telefone"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                leftIcon={<QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                required
              />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1.5 font-medium">
                Esta chave será utilizada para gerar instantaneamente o QR Code e o código Pix Copia e Cola na tela de recebimento do PDV.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Endereço Completo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Input
                label="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="UF"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* SEÇÃO 3: APARÊNCIA & TEMA ESCURO */}
        <Card>
          <CardHeader
            title="Aparência do Sistema & Tema Visual"
            subtitle="Alterne entre o tema claro para ambientes iluminados e o tema escuro para conforto visual"
          />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Tema Claro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Interface limpa e tradicional</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 flex-shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Tema Escuro</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ideal para menor cansaço visual</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'system'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex-shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Automático</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Segue o tema do seu dispositivo</p>
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* SEÇÃO 4: IMPRESSÃO & CUPOM */}
        <Card>
          <CardHeader
            title="Configurações de Impressão de Cupom"
            subtitle="Personalize as mensagens impressas na bobina térmica de 80mm"
          />
          <div className="space-y-4">
            <Input
              label="Mensagem de Agradecimento no Rodapé do Cupom"
              placeholder="Obrigado pela preferência! Volte sempre."
              value={receiptMessage}
              onChange={(e) => setReceiptMessage(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Moeda Padrão:</p>
                <p>Real Brasileiro (BRL - R$)</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Fuso Horário:</p>
                <p>America/Sao_Paulo (GMT-3)</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Formato de Bobina:</p>
                <p>Térmica 80mm e 58mm (ESC/POS)</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Save className="w-5 h-5" />}
            className="shadow-emerald-600/30"
          >
            Salvar Dados da Loja
          </Button>
        </div>
      </form>

      {/* SEÇÃO 4: APLICATIVO PWA & DISPOSITIVOS */}
      <Card>
        <CardHeader
          title="Aplicativo PWA (Progressive Web App)"
          subtitle="Acesso em tela cheia, instalação no celular/desktop e suporte offline"
        />
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isStandalone || isInstalled ? 'Aplicativo Instalado no Dispositivo' : 'Aplicativo PWA Pronto para Instalação'}</span>
                  <Badge variant={isStandalone || isInstalled ? 'success' : 'info'}>
                    {isStandalone || isInstalled ? 'Ativo (Standalone)' : 'PWA Ready'}
                  </Badge>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isStandalone || isInstalled
                    ? 'O sistema está rodando como um aplicativo nativo independente com cache rápido e alta performance.'
                    : 'Instale o VasiStore no seu celular (Android/iOS) ou computador (Windows/Mac) para abrir em tela cheia.'}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {isStandalone || isInstalled ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-4 h-4" />
                  <span>Instalado</span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => openInstallFlow()}
                  className="shadow-emerald-600/30"
                >
                  Instalar Aplicativo
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">🚀 Carregamento Instantâneo</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Service Worker pré-armazena os dados essenciais para resposta rápida.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">📱 Ícone na Tela Inicial</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ícone exclusivo com abertura sem barras de navegação do navegador.</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">⚡ Suporte Offline / Local</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Operações de frente de caixa com resiliência a oscilações de internet.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* SEÇÃO 5: BANCO DE DADOS & BACKUP */}
      <Card>
        <CardHeader
          title="Infraestrutura de Banco de Dados & Backup"
          subtitle="Status de persistência PostgreSQL e Supabase"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Híbrido Local Ativo'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isSupabaseConfigured
                    ? 'Sincronização em nuvem via PostgreSQL/Supabase com Row Level Security (RLS).'
                    : 'Armazenamento reativo de alta velocidade com dados completos de utilidades pré-carregados.'}
                </p>
              </div>
            </div>
            <Badge variant={isSupabaseConfigured ? 'success' : 'info'}>
              {isSupabaseConfigured ? 'Online Cloud' : 'Local Storage Ready'}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadBackup}
            >
              Exportar Backup JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
              onClick={handleClearAllData}
            >
              Limpar Todos os Dados de Teste (Zerar Sistema)
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR / EDITAR FUNCIONÁRIO */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={editingEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
        subtitle="Defina os dados, contato e nível de permissão do colaborador"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <Input
            label="Nome Completo do Funcionário *"
            placeholder="Ex: Vanessa Guimarães"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail de Acesso *"
              type="email"
              placeholder="funcionario@donalar.com.br"
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
              required
            />
            <Input
              label="WhatsApp / Telefone"
              placeholder="(11) 98765-4321"
              value={employeePhone}
              onChange={(e) => setEmployeePhone(e.target.value)}
            />
          </div>

          <Input
            label="Senha de Acesso *"
            type="text"
            placeholder="Ex: 123"
            value={employeePassword}
            onChange={(e) => setEmployeePassword(e.target.value)}
            helperText="Senha que o colaborador usará na tela de login"
            required
          />

          {/* Opções de Cargo exatas solicitadas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cargo / Nível de Acesso *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'caixa',
                  title: 'Operador de caixa',
                  desc: 'Acesso rápido ao PDV, abertura e fechamento de caixa',
                  icon: '🛒',
                },
                {
                  id: 'vendedor',
                  title: 'Vendedor',
                  desc: 'Acesso ao PDV, cadastro de clientes e consulta de vendas',
                  icon: '💼',
                },
                {
                  id: 'gerente',
                  title: 'Gerente',
                  desc: 'Acesso a estoque, produtos, fornecedores, caixa e relatórios',
                  icon: '👔',
                },
                {
                  id: 'admin',
                  title: 'ADM',
                  desc: 'Acesso total, configurações, exclusões e equipe',
                  icon: '👑',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEmployeeRole(opt.id as UserRole)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    employeeRole === opt.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.icon}</span>
                    <p className="font-bold text-xs">{opt.title}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={employeeActive}
              onChange={(e) => setEmployeeActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Funcionário Ativo no Sistema
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEmployeeModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Salvar Funcionário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
