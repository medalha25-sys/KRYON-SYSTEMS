import { createClient } from '@/utils/supabase/server'
import { getProductRecipe, getRawMaterials } from '../../../actions'
import RecipeEditorClient from './RecipeEditorClient'
import { notFound } from 'next/navigation'

export default async function RecipePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    
    const { data: product } = await supabase
        .from('erp_products')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!product) notFound()

    const rawMaterials = await getRawMaterials()
    const initialIngredients = await getProductRecipe(params.id)

    return (
        <RecipeEditorClient 
            product={product} 
            rawMaterials={rawMaterials} 
            initialIngredients={initialIngredients} 
        />
    )
}
