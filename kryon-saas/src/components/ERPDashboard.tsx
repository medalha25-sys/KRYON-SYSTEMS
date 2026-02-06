'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StockItem, ServiceOrder } from '@/types/erp';
import { createClient } from '@/utils/supabase/client';

const ERPDashboard: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();

        if (!profile?.shop_id) return;

        const shopId = profile.shop_id;

        // Fetch low stock items
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId)
          .lt('quantity', 10)
          .order('quantity', { ascending: true })
          .limit(5);

        if (products) {
          setLowStockItems(products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Geral',
            remaining: p.quantity,
            image: p.image_url || 'https://picsum.photos/seed/product/50/50'
          })));
        }

        // Fetch recent service orders
        const { data: orders } = await supabase
          .from('service_orders')
          .select('*')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (orders) {
          setRecentOrders(orders.map(o => ({
            id: o.id,
            client: o.client_name,
            device: `${o.device_brand} ${o.device_model}`,
            status: o.status as any
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-8 lg:px-12 flex flex-col gap-8 max-w-[1280px] mx-auto pb-10">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#111418] dark:text-white tracking-tight">Visão Geral</h2>
          <p className="text-[#617589] dark:text-gray-400 mt-1">Bem-vindo de volta! Aqui está o resumo da sua loja hoje.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#617589] dark:text-gray-400 bg-white dark:bg-[#1e2730] px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
          <span className="material-symbols-outlined notranslate text-base">calendar_today</span>
          <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-bold text-[#111418] dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined notranslate text-primary">bolt</span>
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            href="/dashboard/vendas"
            className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-2 p-5 bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-lg shadow-blue-200 hover:translate-y-[-2px] transition-all"
          >
            <span className="material-symbols-outlined notranslate text-4xl">point_of_sale</span>
            <span className="font-bold">Abrir PDV</span>
          </Link>

          {[
            { label: 'Nova Venda', icon: 'add_shopping_cart', color: 'blue', href: '/dashboard/vendas' },
            { label: 'Nova O.S.', icon: 'build_circle', color: 'orange', href: '/dashboard/servicos' },
            { label: 'Novo Cliente', icon: 'person_add', color: 'green', href: '/dashboard/usuarios' },
            { label: 'Novo Produto', icon: 'inventory', color: 'purple', href: '/dashboard/estoque' },
          ].map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-[#1e2730] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:border-primary/50 dark:hover:border-primary/50 hover:bg-blue-50 dark:hover:bg-[#111922] transition-all group"
            >
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:bg-white dark:group-hover:bg-[#1e2730] transition-colors">
                <span className="material-symbols-outlined notranslate text-primary">{action.icon}</span>
              </div>
              <span className="font-semibold text-sm text-[#111418] dark:text-gray-200 text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alert */}
        <div className="bg-white dark:bg-[#1e2730] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-bold text-[#111418] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined notranslate text-orange-500">warning</span>
              Estoque Baixo
            </h3>
            <Link
              href="/dashboard/estoque"
              className="text-xs text-primary font-medium hover:underline"
            >
              Ver estoque
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 min-h-[200px]">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando dados...</div>
            ) : lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-[#111418] dark:text-white">{item.name}</p>
                      <p className="text-xs text-[#617589] dark:text-gray-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 ${item.remaining < 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} text-xs font-bold rounded`}>
                      Restam {item.remaining}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 italic">Nenhum alerta de estoque baixo.</div>
            )}
          </div>
        </div>

        {/* Service Orders */}
        <div className="bg-white dark:bg-[#1e2730] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-bold text-[#111418] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined notranslate text-primary">build</span>
              Últimas O.S.
            </h3>
            <Link
              href="/dashboard/servicos"
              className="text-xs text-primary font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="w-full overflow-x-auto min-h-[200px]">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando ordens...</div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[#617589] dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Dispositivo</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-[#111418] dark:text-white">{order.client}</td>
                      <td className="px-4 py-3 text-[#617589] dark:text-gray-400">{order.device}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.status === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'waiting' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {order.status === 'analysis' ? 'Em Análise' :
                            order.status === 'waiting' ? 'Aguardando Peça' :
                              order.status === 'ready' ? 'Pronto' : 'Atrasado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400 italic">Nenhuma ordem de serviço registrada.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPDashboard;
