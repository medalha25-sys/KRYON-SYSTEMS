'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit3, Trash2, ShieldAlert, Check, User, Mail, Shield, Phone } from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Profile, UserRole } from '../../../lib/db/types';
import { formatDateTime, formatPhone } from '../../../lib/formatters';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

export default function UsersPage() {
  const { store } = useStore();
  const { user: currentUser, refreshUsers } = useAuth();
  const { success, error } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>('caixa');
  const [active, setActive] = useState(true);

  const loadData = () => {
    setProfiles(db.getProfiles(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenNew = () => {
    setEditingProfile(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('123');
    setRole('caixa');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Profile) => {
    setEditingProfile(p);
    setFullName(p.full_name);
    setEmail(p.email);
    setPhone(p.phone || '');
    setPassword(p.password || '123');
    setRole(p.role);
    setActive(p.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      error('Preencha os campos', 'Nome e e-mail são obrigatórios.');
      return;
    }
    if (!password.trim()) {
      error('Preencha a senha', 'A senha de acesso é obrigatória.');
      return;
    }

    try {
      if (editingProfile) {
        db.updateProfile(editingProfile.id, {
          full_name: fullName,
          email,
          phone,
          password,
          role,
          active,
        });
        success('Funcionário atualizado com sucesso!');
      } else {
        db.createProfile({
          store_id: store.id,
          full_name: fullName,
          email,
          phone,
          password,
          role,
          active,
        });
        success('Funcionário cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadData();
      refreshUsers();
    } catch (err: any) {
      error('Erro ao salvar funcionário', err.message);
    }
  };

  const handleDelete = (p: Profile) => {
    if (p.id === currentUser?.id) {
      error('Ação bloqueada', 'Você não pode excluir o seu próprio usuário logado.');
      return;
    }

    if (confirm(`Deseja realmente excluir o funcionário "${p.full_name}"?`)) {
      db.deleteProfile(p.id);
      success('Funcionário excluído!');
      loadData();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Equipe & Funcionários da Loja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Opções de cargo: Operador de caixa, Vendedor, Gerente e ADM.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleOpenNew}
          className="shadow-emerald-600/30"
        >
          Cadastrar Funcionário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const isMe = p.id === currentUser?.id;

          return (
            <Card key={p.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow-md shadow-emerald-600/20">
                    {p.full_name.charAt(0)}
                  </div>
                  <Badge variant={getRoleBadgeVariant(p.role)} size="sm">
                    {getRoleLabel(p.role)}
                  </Badge>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {p.full_name} {isMe && <span className="text-emerald-600 dark:text-emerald-400 font-medium">(Você)</span>}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.email}</p>
                  {p.phone && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{formatPhone(p.phone)}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <strong>Cargo:</strong> {getRoleLabel(p.role)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Cadastrado em {formatDateTime(p.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                  Editar
                </Button>
                {!isMe && (
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Excluir Funcionário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL: USUÁRIO / FUNCIONÁRIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProfile ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
        subtitle="Defina os dados, contato e o cargo na loja"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Vanessa Guimarães"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail de Acesso *"
              type="email"
              placeholder="funcionario@donalar.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Senha de Acesso *"
            type="text"
            placeholder="Ex: 123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Senha individual que o usuário precisará digitar para fazer login"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Opção de Cargo *
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
                  onClick={() => setRole(opt.id as UserRole)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === opt.id
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
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Funcionário Ativo no Sistema
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
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
