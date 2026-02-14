export type AgendaStatus = 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  specialty?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  professional_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  status: AgendaStatus;
  notes?: string;
  
  // Joined data for display
  clients?: Client;
  agenda_services?: Service;
  agenda_professionals?: Professional;
}

export interface WorkSchedule {
  id: string;
  professional_id: string;
  weekday: number;
  start_time: string; // HH:mm:ss
  end_time: string;   // HH:mm:ss
  break_start?: string; // HH:mm:ss
  break_end?: string;   // HH:mm:ss
}
