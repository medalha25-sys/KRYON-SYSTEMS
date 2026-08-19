'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit3, Trash2, Check, Package } from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useToast } from '../../../contexts/ToastContext';
import { db } from '../../../lib/db';
import { Category, Product } from '../../../lib/db/types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';

export default function CategoriesPage() {
  const { store } = useStore();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#16a34a');

  const loadData = () => {
    setCategories(db.getCategories(store.id));
    setProducts(db.getProducts(store.id));
  };

  useEffect(() => {
    loadData();
  }, [store.id]);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#16a34a');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#16a34a');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      error('Campo obrigatório', 'Informe o nome da categoria.');
      return;
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      if (editingCategory) {
        db.updateCategory(editingCategory.id, {
          name,
          slug,
          description,
          color,
        });
        success('Categoria atualizada com sucesso!');
      } else {
        db.addCategory({
          store_id: store.id,
          name,
          slug,
          description,
          color,
          active: true,
        });
        success('Categoria criada com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Erro ao salvar categoria', err.message);
    }
  };

  const handleDelete = (cat: Category) => {
    const linked = products.filter((p) => p.category_id === cat.id).length;
    if (linked > 0) {
      error('Ação bloqueada', `Esta categoria possui ${linked} produto(s) vinculado(s).`);
      return;
    }

    if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
      db.deleteCategory(cat.id);
      success('Categoria removida com sucesso!');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Categorias de Utilidades
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize os departamentos da sua loja: Potes, Vasilhas, Panelas, Copos, Limpeza e Organização.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleOpenNew}
          className="shadow-emerald-600/30"
        >
          Nova Categoria
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category_id === cat.id).length;

          return (
            <Card key={cat.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color || '#16a34a' }}
                    />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{cat.name}</h3>
                  </div>
                  <Badge variant="default" size="sm">
                    {productCount} produtos
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Categoria */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        subtitle="Defina o nome e cor de identificação da categoria"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome da Categoria *"
            placeholder="Ex: Potes e Vasilhas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Descrição Breve"
            placeholder="Ex: Potes herméticos, potes de vidro, vasilhas plásticas"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cor de Identificação
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <span className="text-xs font-mono font-semibold text-slate-700 uppercase">{color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Check className="w-4 h-4" />}>
              Salvar Categoria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
