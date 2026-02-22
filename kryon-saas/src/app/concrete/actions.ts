'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { translateSupabaseError } from '@/utils/error_handling'

export async function createConcreteQuote(data: {
    client_id: string,
    product_id: string,
    length: number,
    width: number,
    height: number,
    unit_price: number,
    km: number,
    km_rate: number,
    signature_base64?: string,
    status?: 'pendente' | 'negociacao' | 'fechado' | 'perdido',
    loss_reason?: string,
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) return { error: 'Org not found' }

    // 1. Fetch product to get cost_m3
    const { data: product } = await supabase
        .from('erp_products')
        .select('cost_m3')
        .eq('id', data.product_id)
        .single()

    const cost_m3 = product?.cost_m3 || 0

    // 2. Perform Calculations (Business Rules)
    const volume_m3 = data.length * data.width * data.height
    const freight_value = data.km * data.km_rate
    const total = (volume_m3 * data.unit_price) + freight_value
    const estimated_profit = volume_m3 * (data.unit_price - cost_m3)

    // 3. Validation
    if (data.status === 'perdido' && !data.loss_reason) {
        return { error: 'O motivo da perda é obrigatório quando o status é "Perdido"' }
    }

    const { error } = await supabase.from('erp_quotes').insert({
        organization_id: profile.organization_id,
        ...data,
        volume_m3,
        freight_value,
        total,
        estimated_profit,
        status: data.status || 'pendente'
    })

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete')
    return { success: true }
}

export async function updateQuoteStatus(quoteId: string, status: 'pendente' | 'fechado' | 'perdido' | 'negociacao', lossReason?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_quotes')
        .update({ 
            status, 
            loss_reason: lossReason || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)

    if (error) return { error: translateSupabaseError(error) }

    // Note: Auto-delivery creation is handled by DB TRIGGER 'trg_auto_create_delivery'
    
    revalidatePath('/concrete')
    return { success: true }
}

export async function getClients() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data: clients } = await supabase.from('erp_clients').select('*').eq('organization_id', profile.organization_id).order('name')
    return clients || []
}

export async function createClientAction(data: {
    name: string,
    type: 'interno' | 'externo',
    phone?: string,
    email?: string,
    address?: string,
    cidade?: string,
    estado?: string,
    observacoes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_clients').insert({ 
        organization_id: profile.organization_id, 
        ...data 
    })
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/clientes')
    return { success: true }
}

export async function updateClientAction(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('erp_clients').update(data).eq('id', id)
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/clientes')
    return { success: true }
}

export async function deleteClientAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('erp_clients').delete().eq('id', id)
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/clientes')
    return { success: true }
}

export async function getProducts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data: products } = await supabase.from('erp_products').select('*').eq('organization_id', profile.organization_id).order('name')
    return products || []
}

export async function createProductAction(data: {
    name: string,
    categoria: 'concreto' | 'manilha' | 'pre-moldado',
    price_m3: number,
    cost_m3: number,
    unidade: string,
    descricao?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_products').insert({ 
        organization_id: profile.organization_id, 
        ...data 
    })
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/produtos')
    return { success: true }
}

export async function updateProductAction(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('erp_products').update(data).eq('id', id)
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/produtos')
    return { success: true }
}

export async function deleteProductAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('erp_products').delete().eq('id', id)
    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/produtos')
    return { success: true }
}

export async function popularBancoInicialAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
    
    if (!profile) return { error: 'Profile not found' }
    const orgId = profile.organization_id

    let productsAdded = 0
    let clientsAdded = 0

    // 1. Check & Seed Products
    const { count: pCount } = await supabase
        .from('erp_products')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)

    if (!pCount || pCount === 0) {
        const seedProducts = [
            { name: "Manilha 40cm", categoria: "manilha", price_m3: 120, cost_m3: 84, organization_id: orgId, unidade: "un" },
            { name: "Manilha 60cm", categoria: "manilha", price_m3: 180, cost_m3: 126, organization_id: orgId, unidade: "un" },
            { name: "Concreto Usinado", categoria: "concreto", price_m3: 450, cost_m3: 315, organization_id: orgId, unidade: "m³" },
            { name: "Bloco Pré-Moldado", categoria: "pre-moldado", price_m3: 35, cost_m3: 24, organization_id: orgId, unidade: "un" },
            { name: "Meio-fio Pré-Moldado", categoria: "pre-moldado", price_m3: 42, cost_m3: 29, organization_id: orgId, unidade: "un" }
        ]
        await supabase.from('erp_products').insert(seedProducts)
        productsAdded = seedProducts.length
    }

    // 2. Check & Seed Clients
    const { count: cCount } = await supabase
        .from('erp_clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)

    if (!cCount || cCount === 0) {
        const seedClients = [
            { name: "Construtora Silva LTDA", phone: "11999999999", cidade: "São Paulo", estado: "SP", type: "externo", organization_id: orgId },
            { name: "Obras Almeida", phone: "11988888888", cidade: "Guarulhos", estado: "SP", type: "externo", organization_id: orgId },
            { name: "Prefeitura Municipal", phone: "1133333333", cidade: "Campinas", estado: "SP", type: "externo", organization_id: orgId },
            { name: "Engenharia Rocha", phone: "11977777777", cidade: "Osasco", estado: "SP", type: "externo", organization_id: orgId },
            { name: "Construmax Serviços", phone: "11966666666", cidade: "Santo André", estado: "SP", type: "externo", organization_id: orgId }
        ]
        await supabase.from('erp_clients').insert(seedClients)
        clientsAdded = seedClients.length
    }

    revalidatePath('/concrete')
    return { 
        success: true, 
        message: `Base populada: ${productsAdded} produtos e ${clientsAdded} clientes adicionados.` 
    }
}

export async function getQuotes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data: quotes } = await supabase
        .from('erp_quotes')
        .select('*, erp_clients(name), erp_products(name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
    
    return quotes || []
}



export async function getInventory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data: inventory } = await supabase
        .from('erp_inventory')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('item_name')
    
    return inventory || []
}

export async function getDashboardMetrics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.organization_id) {
        return {
            total_m3_externo: 0,
            total_m3_interno: 0,
            receita_total: 0,
            orcamentos_fechados: 0,
            orcamentos_perdidos: 0,
            lucro_total: 0,
            total_orcamentos: 0,
            orcamentos_aprovados: 0
        }
    }
    const orgId = profile.organization_id

    // Legacy metrics (erp_quotes)
    const { data: quotes } = await supabase
        .from('erp_quotes')
        .select('total, volume_m3, status, erp_clients(type)')
        .eq('organization_id', orgId)

    // New metrics (erp_budgets)
    const { data: budgets } = await supabase
        .from('erp_budgets')
        .select('valor_total, lucro_total, status')
        .eq('organization_id', orgId)

    const legacyMetrics = {
        total_m3_externo: quotes?.filter(q => (q.erp_clients as any)?.type === 'externo').reduce((acc, curr) => acc + curr.volume_m3, 0) || 0,
        total_m3_interno: quotes?.filter(q => (q.erp_clients as any)?.type === 'interno').reduce((acc, curr) => acc + curr.volume_m3, 0) || 0,
        receita_total: quotes?.filter(q => q.status === 'fechado').reduce((acc, curr) => acc + (curr.total as unknown as number), 0) || 0,
        orcamentos_fechados: quotes?.filter(q => q.status === 'fechado').length || 0,
        orcamentos_perdidos: quotes?.filter(q => q.status === 'perdido').length || 0,
    }

    const budgetMetrics = {
        faturamento_novo: budgets?.filter(b => b.status === 'aprovado').reduce((acc, curr) => acc + Number(curr.valor_total), 0) || 0,
        lucro_novo: budgets?.filter(b => b.status === 'aprovado').reduce((acc, curr) => acc + Number(curr.lucro_total), 0) || 0,
        total_orcamentos: budgets?.length || 0,
        orcamentos_aprovados: budgets?.filter(b => b.status === 'aprovado').length || 0
    }

    // Orders metrics
    const { data: orders } = await supabase
        .from('erp_orders')
        .select('status')
        .eq('organization_id', orgId)

    // Production metrics
    const { data: prodOrders } = await supabase
        .from('erp_production_orders')
        .select('status')
        .eq('organization_id', orgId)

    // Delivery metrics
    const { data: deliveries } = await supabase
        .from('erp_deliveries')
        .select('status')
        .eq('organization_id', orgId)

    // Low stock metrics
    const { data: lowStockItems } = await supabase
        .from('erp_raw_materials')
        .select('id')
        .eq('organization_id', orgId)
        .filter('estoque_atual', 'lte', 'estoque_minimo')

    const orderMetrics = {
        total_pedidos: orders?.length || 0,
        pedidos_pendentes: orders?.filter(o => o.status === 'pendente').length || 0,
        pedidos_entregues: orders?.filter(o => o.status === 'entregue').length || 0,
        producao_pendente: prodOrders?.filter(p => p.status === 'aguardando').length || 0,
        producao_em_andamento: prodOrders?.filter(p => p.status === 'produzindo').length || 0,
        entregas_em_transporte: deliveries?.filter(d => d.status === 'em_transporte').length || 0,
        entregas_concluidas: deliveries?.filter(d => d.status === 'entregue').length || 0,
        itens_estoque_baixo: lowStockItems?.length || 0
    }

    // Financial metrics (erp_accounts_receivable)
    const { data: ar } = await supabase
        .from('erp_accounts_receivable')
        .select('valor, status')
        .eq('organization_id', orgId)

    // Fiscal metrics
    const { data: invoices } = await supabase
        .from('erp_invoices')
        .select('id')
        .eq('organization_id', orgId)
        .eq('status', 'emitida')

    const fiscalMetrics = {
        total_notas_emitidas: invoices?.length || 0
    }

    const financeMetrics = {
        total_a_receber: ar?.filter(a => a.status === 'pendente').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0,
        total_recebido: ar?.filter(a => a.status === 'pago').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0,
        total_vencido: ar?.filter(a => a.status === 'vencido').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
    }

    return {
        ...legacyMetrics,
        receita_total: legacyMetrics.receita_total + budgetMetrics.faturamento_novo,
        lucro_total: budgetMetrics.lucro_novo,
        total_orcamentos: budgetMetrics.total_orcamentos,
        orcamentos_aprovados: budgetMetrics.orcamentos_aprovados,
        ...orderMetrics,
        ...fiscalMetrics,
        ...financeMetrics
    }
}

// LOGISTICS & INVENTORY ACTIONS

export async function updateDeliveryStatusAction(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_deliveries')
        .update({ 
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/entregas')

    // Trigger Financial Receivable if status is 'entregue'
    if (status === 'entregue') {
        const financeRes = await createReceivableFromDelivery(id)
        if (financeRes.error) {
            console.error('Erro ao gerar financeiro:', financeRes.error)
            // We don't rollback delivery status, but log it
        }
    }

    return { success: true }
}

export async function createReceivableFromDelivery(deliveryId: string) {
    const supabase = await createClient()
    
    // 1. Get delivery details with order and client
    const { data: delivery } = await supabase
        .from('erp_deliveries')
        .select(`
            *,
            erp_orders (
                id,
                organization_id,
                cliente_id,
                valor_total
            )
        `)
        .eq('id', deliveryId)
        .single()

    if (!delivery || !delivery.erp_orders) return { error: 'Delivery or Order not found' }

    const order = delivery.erp_orders as any

    // 2. Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // 3. Create AR entry
    const { error } = await supabase.from('erp_accounts_receivable').insert({
        organization_id: order.organization_id,
        cliente_id: order.cliente_id,
        pedido_id: order.id,
        entrega_id: deliveryId,
        valor: order.valor_total,
        data_emissao: new Date().toISOString(),
        data_vencimento: dueDate.toISOString(),
        status: 'pendente'
    })

    if (error) return { error: translateSupabaseError(error) }
    
    revalidatePath('/concrete/financeiro/contas-receber')
    return { success: true }
}

export async function getAccountsReceivable(statusFilter?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    let query = supabase
        .from('erp_accounts_receivable')
        .select('*, erp_clients(name)')
        .eq('organization_id', profile.organization_id)
        .order('data_vencimento', { ascending: true })

    if (statusFilter && statusFilter !== 'todos') {
        query = query.eq('status', statusFilter)
    }

    const { data } = await query
    return data || []
}

export async function markAsPaidAction(id: string, forma_pagamento: string = 'Dinheiro') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_accounts_receivable')
        .update({ 
            status: 'pago',
            data_pagamento: new Date().toISOString(),
            forma_pagamento,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/financeiro/contas-receber')
    return { success: true }
}

export async function createInventoryAction(data: {
    item_name: string,
    quantity: number,
    unit: string,
    min_stock: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_inventory').insert({
        organization_id: profile.organization_id,
        ...data
    })

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/estoque')
    return { success: true }
}

export async function updateInventoryAction(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_inventory')
        .update(data)
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/estoque')
    return { success: true }
}

export async function deleteInventoryAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('erp_inventory').delete().eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/estoque')
    return { success: true }
}

// NEW BUDGETS MODULE ACTIONS

export async function createFullBudgetAction(data: {
    cliente_id: string,
    items: {
        produto_id: string,
        quantidade_m3: number,
        preco_unitario: number,
        custo_unitario: number
    }[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    // Calculate totals
    let valor_total = 0
    let custo_total = 0
    let lucro_total = 0

    const budgetItems = data.items.map(item => {
        const subtotal = item.quantidade_m3 * item.preco_unitario
        const custo_subtotal = item.quantidade_m3 * item.custo_unitario
        const lucro_item = subtotal - custo_subtotal
        
        valor_total += subtotal
        custo_total += custo_subtotal
        lucro_total += lucro_item

        return {
            ...item,
            subtotal,
            custo_subtotal,
            lucro_item
        }
    })

    // Insert Budget
    const { data: budget, error: budgetError } = await supabase
        .from('erp_budgets')
        .insert({
            organization_id: profile.organization_id,
            cliente_id: data.cliente_id,
            valor_total,
            custo_total,
            lucro_total,
            created_by: user.id,
            status: 'rascunho'
        })
        .select()
        .single()

    if (budgetError) return { error: translateSupabaseError(budgetError) }

    // Insert Items
    const { error: itemsError } = await supabase
        .from('erp_budget_items')
        .insert(budgetItems.map(item => ({
            orcamento_id: budget.id,
            ...item
        })))

    if (itemsError) return { error: translateSupabaseError(itemsError) }

    revalidatePath('/concrete/orcamentos')
    return { success: true, budgetId: budget.id }
}

export async function getFullBudgets(status?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    let query = supabase
        .from('erp_budgets')
        .select('*, erp_clients(name)')
        .eq('organization_id', profile.organization_id)
        .order('numero_orcamento', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return []

    return data || []
}

export async function getFullBudgetById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('erp_budgets')
        .select('*, erp_clients(*), erp_budget_items(*, erp_products(*))')
        .eq('id', id)
        .single()

    if (error) return null

    return data
}

export async function updateFullBudgetStatus(id: string, status: 'rascunho' | 'enviado' | 'aprovado' | 'cancelado') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_budgets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/orcamentos')
    revalidatePath(`/concrete/orcamentos/${id}`)
    return { success: true }
}

export async function convertBudgetToOrderAction(budgetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Fetch Budget and its Items
    const budget = await getFullBudgetById(budgetId)
    if (!budget) return { error: 'Budget not found' }
    if (budget.status !== 'aprovado') return { error: 'Apenas orçamentos aprovados podem ser convertidos.' }

    // 2. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('erp_orders')
        .insert({
            organization_id: budget.organization_id,
            orcamento_id: budget.id,
            cliente_id: budget.cliente_id,
            valor_total: budget.valor_total,
            status: 'pendente'
        })
        .select()
        .single()

    if (orderError) return { error: translateSupabaseError(orderError) }

    // 3. Insert Order Items
    const orderItems = budget.erp_budget_items.map((item: any) => ({
        pedido_id: order.id,
        produto_id: item.produto_id,
        quantidade_m3: item.quantidade_m3,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal
    }))

    const { error: itemsError } = await supabase
        .from('erp_order_items')
        .insert(orderItems)

    if (itemsError) return { error: translateSupabaseError(itemsError) }

    revalidatePath('/concrete/pedidos')
    revalidatePath('/concrete/orcamentos')
    
    return { success: true, orderId: order.id }
}

export async function getFullOrders(status?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    let query = supabase
        .from('erp_orders')
        .select('*, erp_clients(name)')
        .eq('organization_id', profile.organization_id)
        .order('numero_pedido', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return []

    return data || []
}

export async function getFullOrderById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('erp_orders')
        .select('*, erp_clients(*), erp_order_items(*, erp_products(*))')
        .eq('id', id)
        .single()

    if (error) return null

    return data
}

export async function updateFullOrderStatus(id: string, status: 'pendente' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    // If status is 'em_producao', create production orders for each item
    if (status === 'em_producao') {
        const { data: orderItems } = await supabase
            .from('erp_order_items')
            .select('*')
            .eq('pedido_id', id)
        
        const { data: order } = await supabase
            .from('erp_orders')
            .select('organization_id')
            .eq('id', id)
            .single()

        if (orderItems && orderItems.length > 0 && order) {
            const productionOrders = orderItems.map(item => ({
                organization_id: order.organization_id,
                pedido_id: id,
                produto_id: item.produto_id,
                quantidade_m3: item.quantidade_m3,
                status: 'aguardando'
            }))

            await supabase.from('erp_production_orders').insert(productionOrders)
        }
    }

    revalidatePath('/concrete/pedidos')
    revalidatePath(`/concrete/pedidos/${id}`)
    revalidatePath('/concrete/producao')
    return { success: true }
}

export async function getProductionOrders(status?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    let query = supabase
        .from('erp_production_orders')
        .select('*, erp_products(name, categoria), erp_orders(numero_pedido)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return []

    return data || []
}

export async function updateProductionOrderStatus(id: string, status: 'aguardando' | 'produzindo' | 'finalizado') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_production_orders')
        .update({ status })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    // If status is 'finalizado', deduct stock based on recipe
    if (status === 'finalizado') {
        const deductionResult = await deductStockFromProduction(id)
        if (deductionResult.error) {
            // Rollback status update if stock deduction fails (optional business decision)
            await supabase.from('erp_production_orders').update({ status: 'produzindo' }).eq('id', id)
            return { error: deductionResult.error }
        }
    }

    revalidatePath('/concrete/producao')
    return { success: true }
}

export async function deductStockFromProduction(orderId: string) {
    const supabase = await createClient()
    
    // 1. Get production order details
    const { data: order } = await supabase
        .from('erp_production_orders')
        .select('*, erp_products(id, organization_id)')
        .eq('id', orderId)
        .single()

    if (!order) return { error: 'Production order not found' }

    // 2. Get product recipe
    const { data: recipe } = await supabase
        .from('erp_production_recipes')
        .select('*, erp_raw_materials(*)')
        .eq('produto_id', order.produto_id)

    if (!recipe || recipe.length === 0) {
        return { error: 'Receita (Traço) não definida para este produto.' }
    }

    // 3. Calculate required amounts and check stock
    for (const item of recipe) {
        const required = Number(item.quantidade_por_m3) * Number(order.quantidade_m3)
        if (Number(item.erp_raw_materials.estoque_atual) < required) {
            return { error: `Estoque insuficiente de ${item.erp_raw_materials.nome}. Necessário: ${required.toFixed(2)}, Disponível: ${Number(item.erp_raw_materials.estoque_atual).toFixed(2)}` }
        }
    }

    // 4. Record movements and update stock
    for (const item of recipe) {
        const required = Number(item.quantidade_por_m3) * Number(order.quantidade_m3)
        
        // Record movement
        await supabase.from('erp_inventory_movements').insert({
            organization_id: order.erp_products.organization_id,
            materia_prima_id: item.materia_prima_id,
            tipo: 'saida',
            quantidade: required,
            referencia_id: orderId,
            descricao: `Baixa automática - OP #${orderId.slice(0,8)}`
        })

        // Update current stock
        await supabase.rpc('decrement_inventory', {
            row_id: item.materia_prima_id,
            amount: required
        })
    }

    return { success: true }
}

// --- INVENTORY ACTIONS ---

export async function getRawMaterials() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('erp_raw_materials')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('nome')

    return data || []
}

export async function createRawMaterialAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_raw_materials').insert({
        ...formData,
        organization_id: profile.organization_id
    })

    if (error) return { error: translateSupabaseError(error) }
    revalidatePath('/concrete/estoque')
    return { success: true }
}

export async function addStockAction(materia_prima_id: string, quantidade: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    // Record movement
    await supabase.from('erp_inventory_movements').insert({
        organization_id: profile.organization_id,
        materia_prima_id,
        tipo: 'entrada',
        quantidade,
        descricao: 'Entrada manual de estoque'
    })

    // Update stock
    const { error } = await supabase.rpc('increment_inventory', {
        row_id: materia_prima_id,
        amount: quantidade
    })

    if (error) return { error: translateSupabaseError(error) }
    revalidatePath('/concrete/estoque')
    return { success: true }
}

export async function getInventoryMovements() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('erp_inventory_movements')
        .select('*, erp_raw_materials(nome, unidade)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

    return data || []
}

export async function getProductRecipe(produtoId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('erp_production_recipes')
        .select('*, erp_raw_materials(nome, unidade)')
        .eq('produto_id', produtoId)
    return data || []
}

export async function updateRecipeAction(produtoId: string, ingredients: { materia_prima_id: string, quantidade_por_m3: number }[]) {
    const supabase = await createClient()
    
    // Clear existing recipe
    await supabase.from('erp_production_recipes').delete().eq('produto_id', produtoId)
    
    // Insert new one
    if (ingredients.length > 0) {
        const { error } = await supabase.from('erp_production_recipes').insert(
            ingredients.map(i => ({ ...i, produto_id: produtoId }))
        )
        if (error) return { error: translateSupabaseError(error) }
    }

    revalidatePath(`/concrete/produtos/${produtoId}/receita`)
    return { success: true }
}

// --- LOGISTICS ACTIONS ---

export async function getTrucks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('erp_trucks')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('placa')

    return data || []
}

export async function createTruckAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_trucks').insert({
        ...formData,
        organization_id: profile.organization_id
    })

    if (error) return { error: translateSupabaseError(error) }
    revalidatePath('/concrete/caminhoes')
    return { success: true }
}

export async function getDrivers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('erp_drivers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('nome')

    return data || []
}

export async function createDriverAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    const { error } = await supabase.from('erp_drivers').insert({
        ...formData,
        organization_id: profile.organization_id
    })

    if (error) return { error: translateSupabaseError(error) }
    revalidatePath('/concrete/motoristas')
    return { success: true }
}

export async function getDeliveries(status?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    let query = supabase
        .from('erp_deliveries')
        .select('*, erp_trucks(placa, modelo), erp_drivers(nome), erp_production_orders(*, erp_products(name))')
        .eq('organization_id', profile.organization_id)
        .order('data_saida', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data } = await query
    return data || []
}

export async function createDeliveryAction(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return { error: 'Org not found' }

    // First, verify if the production order is 'finalizado'
    const { data: prodOrder } = await supabase
        .from('erp_production_orders')
        .select('status')
        .eq('id', formData.ordem_producao_id)
        .single()

    if (!prodOrder || prodOrder.status !== 'finalizado') {
        return { error: 'Apenas ordens de produção finalizadas podem ser despachadas.' }
    }

    const { error } = await supabase.from('erp_deliveries').insert({
        ...formData,
        organization_id: profile.organization_id,
        status: 'agendada'
    })

    if (error) return { error: translateSupabaseError(error) }
    
    revalidatePath('/concrete/entregas')
    revalidatePath('/concrete/producao')
    return { success: true }
}

export async function updateDeliveryStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const updateData: any = { status }
    if (status === 'entregue') {
        updateData.data_entrega = new Date().toISOString()
    }

    const { error } = await supabase
        .from('erp_deliveries')
        .update(updateData)
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }
    
    revalidatePath('/concrete/entregas')
    revalidatePath('/concrete')
    return { success: true }
}

export async function getExecutiveMetrics(period: '7d' | '30d' | '90d' | 'year' = '30d') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return null
    const orgId = profile.organization_id

    // Setup date filter
    const now = new Date()
    let startDate = new Date()
    if (period === '7d') startDate.setDate(now.getDate() - 7)
    else if (period === '30d') startDate.setDate(now.getDate() - 30)
    else if (period === '90d') startDate.setDate(now.getDate() - 90)
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1)

    const startDateStr = startDate.toISOString()

    // 1. Financial Metrics
    // We join erp_order_items with erp_products to get cost data for profit calculation
    const { data: orders } = await supabase
        .from('erp_orders')
        .select(`
            *,
            erp_order_items (
                *,
                erp_products (
                    name,
                    cost_m3
                )
            )
        `)
        .eq('organization_id', orgId)
        .gte('created_at', startDateStr)

    const deliveredOrders = orders?.filter(o => o.status === 'entregue') || []
    const faturamento_total = deliveredOrders.reduce((acc, curr) => acc + Number(curr.valor_total), 0)
    
    let lucro_total = 0
    deliveredOrders.forEach(order => {
        order.erp_order_items?.forEach((item: any) => {
            const cost = Number(item.erp_products?.cost_m3 || 0) * Number(item.quantidade_m3)
            const revenue = Number(item.subtotal)
            lucro_total += (revenue - cost)
        })
    })

    const margem_percentual = faturamento_total > 0 ? (lucro_total / faturamento_total) * 100 : 0

    // 2. AR Metrics
    const { data: ar } = await supabase
        .from('erp_accounts_receivable')
        .select('*')
        .eq('organization_id', orgId)

    const total_a_receber = ar?.filter(a => a.status === 'pendente').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
    const total_recebido = ar?.filter(a => a.status === 'pago').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
    const total_vencido = ar?.filter(a => a.status === 'vencido').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0

    // 3. Operational Metrics
    const { data: prodOrders } = await supabase
        .from('erp_production_orders')
        .select('quantidade_m3, status, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', startDateStr)

    const volume_produzido_m3 = prodOrders?.filter(p => p.status === 'finalizado').reduce((acc, curr) => acc + Number(curr.quantidade_m3), 0) || 0
    
    const { data: deliveries } = await supabase
        .from('erp_deliveries')
        .select('status')
        .eq('organization_id', orgId)
        .gte('created_at', startDateStr)

    const total_entregas = deliveries?.filter(d => d.status === 'entregue').length || 0
    const pedidos_em_aberto = orders?.filter(o => o.status !== 'entregue' && o.status !== 'cancelado').length || 0

    // 4. Inventory
    const { data: lowStock } = await supabase
        .from('erp_raw_materials')
        .select('nome, estoque_atual, estoque_minimo, unidade')
        .eq('organization_id', orgId)

    const materias_primas_criticas = lowStock?.filter(m => Number(m.estoque_atual) <= Number(m.estoque_minimo)) || []

    // 5. Product Ranking & Margins
    const productStats: Record<string, { volume: number, profit: number, revenue: number, name: string }> = {}
    orders?.forEach(order => {
        order.erp_order_items?.forEach((item: any) => {
            const name = item.erp_products?.name || 'Desconhecido'
            if (!productStats[name]) productStats[name] = { volume: 0, profit: 0, revenue: 0, name }
            productStats[name].volume += Number(item.quantidade_m3)
            productStats[name].revenue += Number(item.subtotal)
            const cost = Number(item.erp_products?.cost_m3 || 0) * Number(item.quantidade_m3)
            productStats[name].profit += (Number(item.subtotal) - cost)
        })
    })

    const ranking_produtos = Object.values(productStats)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)

    const produto_maior_margem = Object.values(productStats)
        .sort((a, b) => (b.profit / (b.revenue || 1)) - (a.profit / (a.revenue || 1)))[0] || null

    // 6. Chart Data
    const chartMap: Record<string, any> = {}
    
    // Fill with empty dates first to ensure continuity? 
    // For simplicity, we'll just gather existing data points
    
    orders?.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString()
        if (!chartMap[date]) chartMap[date] = { date, faturamento: 0, lucro: 0, volume: 0 }
        if (o.status === 'entregue') {
            chartMap[date].faturamento += Number(o.valor_total)
            o.erp_order_items?.forEach((item: any) => {
                const cost = Number(item.erp_products?.cost_m3 || 0) * Number(item.quantidade_m3)
                chartMap[date].lucro += (Number(item.subtotal) - cost)
            })
        }
    })

    prodOrders?.forEach(p => {
        const date = new Date(p.created_at).toLocaleDateString()
        if (!chartMap[date]) chartMap[date] = { date, faturamento: 0, lucro: 0, volume: 0 }
        if (p.status === 'finalizado') {
            chartMap[date].volume += Number(p.quantidade_m3)
        }
    })

    const chartData = Object.values(chartMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
        financeiro: {
            faturamento_total,
            lucro_total,
            margem_percentual,
            total_a_receber,
            total_recebido,
            total_vencido
        },
        operacional: {
            volume_produzido_m3,
            total_entregas,
            pedidos_em_aberto
        },
        estoque: {
            materias_primas_criticas
        },
        produtos: {
            ranking_produtos,
            produto_maior_margem
        },
        chartData
    }
}

export async function getDriverDeliveries() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Find the driver associated with this user
    const { data: driver } = await supabase
        .from('erp_drivers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!driver) return []

    // 2. Get today's deliveries for this driver
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
        .from('erp_deliveries')
        .select('*, erp_trucks(placa, modelo), erp_production_orders(*, erp_products(name), erp_orders(cliente_id, erp_clients(name))))')
        .eq('motorista_id', driver.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })

    return data || []
}

export async function updateDeliveryMobileAction(id: string, status: string, data?: { 
    comprovante_url?: string, 
    geolocalizacao?: any 
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
    }

    if (status === 'em_transporte') {
        updateData.data_saida = new Date().toISOString()
    }

    if (status === 'entregue') {
        updateData.data_entrega = new Date().toISOString()
        updateData.data_chegada = new Date().toISOString()
        if (data?.comprovante_url) updateData.comprovante_url = data.comprovante_url
        if (data?.geolocalizacao) updateData.geolocalizacao_confirmacao = data.geolocalizacao
    }

    const { error } = await supabase
        .from('erp_deliveries')
        .update(updateData)
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    // If status is 'entregue', it will trigger the AR creation
    if (status === 'entregue') {
        await createReceivableFromDelivery(id)
    }

    revalidatePath(`/motorista/${id}`)
    revalidatePath('/motorista')
    revalidatePath('/concrete/entregas')
    
    return { success: true }
}

export async function emitirNFeAction(entregaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get delivery details
    const { data: delivery } = await supabase
        .from('erp_deliveries')
        .select(`
            *,
            erp_production_orders (
                *,
                erp_orders (
                    id,
                    organization_id,
                    cliente_id,
                    valor_total
                )
            )
        `)
        .eq('id', entregaId)
        .single()

    if (!delivery) return { error: 'Entrega não encontrada' }
    if (delivery.status !== 'entregue') return { error: 'NF-e só pode ser emitida para entregas concluídas' }

    const order = delivery.erp_production_orders.erp_orders as any
    const orgId = order.organization_id

    // 2. Check for existing invoice
    const { data: existing } = await supabase
        .from('erp_invoices')
        .select('id')
        .eq('entrega_id', entregaId)
        .eq('status', 'emitida')
        .maybeSingle()

    if (existing) return { error: 'Já existe uma NF-e emitida para esta entrega' }

    // 3. Calculate taxes (Simulated)
    const valor_total = Number(order.valor_total)
    const valor_icms = valor_total * 0.18
    const valor_pis = valor_total * 0.0165
    const valor_cofins = valor_total * 0.076
    const valor_iss = valor_total * 0.05

    // 4. Get next invoice number
    const { data: lastInvoice } = await supabase
        .from('erp_invoices')
        .select('numero_nota')
        .eq('organization_id', orgId)
        .order('numero_nota', { ascending: false })
        .limit(1)
        .maybeSingle()

    const proximo_numero = (lastInvoice?.numero_nota || 0) + 1

    // 5. Generate simulated XML
    const xml_gerado = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
    <NFe>
        <infNFe Id="NFe-Simulada-${proximo_numero}" versao="4.00">
            <ide>
                <nNF>${proximo_numero}</nNF>
                <serie>1</serie>
                <dhEmi>${new Date().toISOString()}</dhEmi>
            </ide>
            <dest>
                <id_cliente>${order.cliente_id}</id_cliente>
            </dest>
            <total>
                <vNF>${valor_total.toFixed(2)}</vNF>
                <vICMS>${valor_icms.toFixed(2)}</vICMS>
                <vPIS>${valor_pis.toFixed(2)}</vPIS>
                <vCOFINS>${valor_cofins.toFixed(2)}</vCOFINS>
            </total>
        </infNFe>
    </NFe>
</nfeProc>`

    // 6. Insert invoice
    const { error } = await supabase.from('erp_invoices').insert({
        organization_id: orgId,
        numero_nota: proximo_numero,
        pedido_id: order.id,
        entrega_id: entregaId,
        cliente_id: order.cliente_id,
        valor_total,
        valor_icms,
        valor_pis,
        valor_cofins,
        valor_iss,
        status: 'emitida',
        xml_gerado
    })

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/fiscal/nfe')
    revalidatePath('/concrete/entregas')
    return { success: true, numero: proximo_numero }
}

export async function cancelarNFeAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('erp_invoices')
        .update({ 
            status: 'cancelada',
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: translateSupabaseError(error) }

    revalidatePath('/concrete/fiscal/nfe')
    return { success: true }
}

export async function getInvoices() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('erp_invoices')
        .select('*, erp_clients(name), erp_orders(id)')
        .eq('organization_id', profile.organization_id)
        .order('numero_nota', { ascending: false })

    return data || []
}
