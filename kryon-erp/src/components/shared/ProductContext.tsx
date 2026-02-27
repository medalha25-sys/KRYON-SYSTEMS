'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ProductContextType {
  slug: string
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ slug, children }: { slug: string, children: ReactNode }) {
  return (
    <ProductContext.Provider value={{ slug }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}
