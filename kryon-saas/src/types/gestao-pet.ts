export interface PetOwner {
  id: string
  tenant_id: string
  product_slug: string
  name: string
  phone: string
  email?: string
  created_at?: string
}

export interface Pet {
  id: string
  tenant_id: string
  product_slug: string
  owner_id: string
  name: string
  species?: string
  breed?: string
  birth_date?: string
  notes?: string
  created_at?: string
  // Joined fields
  pet_owners?: PetOwner
}

export interface PetAppointment {
    id: string
    tenant_id: string
    product_slug: string
    pet_id: string
    service: string
    appointment_date: string
    status: 'scheduled' | 'completed' | 'canceled'
    created_at?: string
    // Joined fields
    pets?: Pet
}
