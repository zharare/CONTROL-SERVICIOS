import { supabase } from '@/app/lib/supabase/client';
import type { Service, ServiceInsert } from '@/app/types/service';

const TABLE = 'services';

export async function fetchServices() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Service[];
}

export async function createService(payload: ServiceInsert) {
  const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
  if (error) throw error;
  return data as Service;
}

export async function updateService(id: string, payload: ServiceInsert) {
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Service;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
