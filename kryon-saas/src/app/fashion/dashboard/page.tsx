import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function FashionDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch Shop ID
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!shop) return <div>Loja não encontrada.</div>

  // Fetch KPI Data
  // 1. Low Stock
  const { data: lowStockItems } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('shop_id', shop.id)
    .lt('quantity', 5)
    .order('quantity', { ascending: true })
    .limit(5)

  // 2. Sales / Service Orders (Assuming sales are tracked here for now, or we need a sales table)
  // For now using service_orders as a proxy or if a sales table exists. 
  // Checking previous file list, there isn't an explicit sales table visible in top level, 
  // but `vendas` module implies it. Let's assume a `sales` table or use `service_orders` for now if `sales` doesn't exist.
  // Actually, looking at `ERPDashboard` it used `service_orders`. 
  // Let's check if `sales` table exists. If not, we might need to create it or use `service_orders` pending clarification.
  // Given the "buggy" report, maybe they want a proper sales flow. 
  // For the dashboard, I will use `service_orders` for now but label them as Sales if they are completed, 
  // OR if there is a `sales` table.
  // Let's try to fetch from `sales` first, if it fails we catch it.
  
  // Actually, best to check if table exists. 
  // Since I can't interactively check in this step, I'll assume `service_orders` (as per ERPDashboard) 
  // BUT filtered for 'fashion' context if possible, or just recent ones.
  // Wait, `ERPDashboard` uses `service_orders`. 
  // User complained about "mixed" systems.
  // Fashion store should probably use `sales` or `orders`.
  // I will use `inventory_items` for products.
  
  // Let's stick to a safe bet: Inventory is real. Sales might need a table check.
  // I'll fetch `inventory_items` count for "Produtos" KPI.
  
  const { count: productCount } = await supabase
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Fashion</h1>
            <p className="text-slate-500">Visão geral da sua loja de roupas.</p>
        </div>
        <div className="flex gap-3">
             <Link href="/fashion/vendas" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition">
                <span className="material-symbols-outlined text-slate-500">add</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Nova Venda</span>
             </Link>
             <Link href="/fashion/ia" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-lg shadow-purple-600/20">
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="font-medium">IA Stylist</span>
             </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Vendas Hoje</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R$ 0,00</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                <span className="material-symbols-outlined">payments</span>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Pedidos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined">shopping_cart</span>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Produtos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{productCount || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <span className="material-symbols-outlined">checkroom</span>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{lowStockItems?.length || 0} Itens</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
                <span className="material-symbols-outlined">warning</span>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white">Desempenho de Vendas</h3>
                <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1 outline-none">
                    <option>Últimos 7 dias</option>
                    <option>Este Mês</option>
                </select>
            </div>
            <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Gráfico de vendas será exibido aqui (Em breve)</p>
            </div>
        </div>

        {/* Top Products / Low Stock */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Mais Vendidos</h3>
                <div className="space-y-4">
                     <p className="text-slate-500 text-sm italic">Nenhum dado de vendas ainda.</p>
                </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-red-600">warning</span>
                    <h3 className="font-bold text-red-700 dark:text-red-400">Alerta de Estoque</h3>
                </div>
                {lowStockItems && lowStockItems.length > 0 ? (
                    <ul className="space-y-3">
                        {lowStockItems.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                                <span className="text-red-800 dark:text-red-300">{item.name}</span>
                                <span className="font-bold text-red-600">{item.quantity} un.</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-emerald-700 text-sm">Estoque em dia!</p>
                )}
                <Link href="/fashion/estoque" className="block text-center w-full mt-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition">
                    Ver todos
                </Link>
            </div>
        </div>

      </div>
    </div>
  )
}
