export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'canceled' | 'delivered';

export interface CarWashService {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price_small: number;
  price_medium: number;
  price_large: number;
  duration_minutes?: number;
  active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  tenant_id: string;
  owner_name: string;
  owner_phone: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  notes?: string;
  created_at: string;
}

export interface CarWashOrder {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  service_id: string;
  status: OrderStatus;
  total_price: number;
  discount: number;
  final_price: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  
  // Joined fields
  vehicles?: Vehicle;
  lava_rapido_services?: CarWashService;
}
