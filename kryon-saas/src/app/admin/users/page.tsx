'use client'

import { useState, useEffect } from 'react'
import { getUsers, toggleVipStatus, updateUserProduct, getProducts } from './actions'
import { ProductSwitchModal } from './ProductSwitchModal'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const [usersData, productsData] = await Promise.all([
          getUsers(),
          getProducts()
        ])
        setUsers(usersData)
        setProducts(productsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleProductSwitch(slug: string) {
    if (!selectedUser) return

    try {
      setLoading(true)
      await updateUserProduct(selectedUser.id, slug)
      
      // Update local state optimistic or refresh
      const data = await getUsers()
      setUsers(data)
      setIsModalOpen(false)
      setSelectedUser(null)
    } catch (err) {
      alert('Erro ao atualizar produto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openSwitchModal(user: any) {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  if (loading) return <div className="p-8 text-slate-500">Carregando usuários...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gerenciamento de Usuários</h1>
        <p className="text-slate-500">Lista de clientes cadastrados no sistema.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Loja / Empresa</th>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Cadastro</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email || 'E-mail não visível'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700 dark:text-slate-300">{user.shop_name}</p>
                    <p className="text-xs text-slate-400">{user.cnpj}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                      {user.product}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold capitalize ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 
                        user.status === 'trialing' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                     }`}>
                        {user.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.joined_at}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="text-slate-400 hover:text-blue-500 transition" title="Editar">
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                        onClick={async () => {
                            if (!confirm(`Deseja alterar o status VIP de ${user.name}?`)) return;
                            try {
                                setLoading(true)
                                await toggleVipStatus(user.id, user.status)
                                // Refresh list
                                const data = await getUsers()
                                setUsers(data)
                            } catch (err) {
                                alert('Erro ao atualizar status')
                                console.error(err)
                            } finally {
                                setLoading(false)
                            }
                        }}
                        className={`transition ${user.status === 'active' ? 'text-green-500 hover:text-green-700' : 'text-slate-300 hover:text-yellow-500'}`}
                        title={user.status === 'active' ? 'Remover VIP' : 'Tornar VIP'}
                    >
                        <span className="material-symbols-outlined">
                            {user.status === 'active' ? 'stars' : 'star_border'}
                        </span>
                    </button>
                    <button 
                        onClick={() => openSwitchModal(user)}
                        className="text-slate-400 hover:text-purple-500 transition"
                        title="Trocar Produto"
                    >
                        <span className="material-symbols-outlined">swap_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                        Nenhum usuário encontrado.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductSwitchModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false)
            setSelectedUser(null)
        }}
        onSelect={handleProductSwitch}
        currentProduct={selectedUser?.product}
        products={products}
        userName={selectedUser?.name || 'Usuário'}
      />
    </div>
  )
}
