import { create } from 'zustand';

type FilterState = {
  query: string;
  instructor: string;
  comercial: string;
  facturado: 'all' | 'yes' | 'no';
  pagado: 'all' | 'yes' | 'no';
  month: string;
  week: string;
};

type DashboardStore = {
  filters: FilterState;
  selectedIds: string[];
  editingId: string | null;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  toggleSelection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setEditingId: (id: string | null) => void;
};

const initialFilters: FilterState = {
  query: '',
  instructor: 'all',
  comercial: 'all',
  facturado: 'all',
  pagado: 'all',
  month: 'all',
  week: 'all'
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: initialFilters,
  selectedIds: [],
  editingId: null,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),
  clearFilters: () => set({ filters: initialFilters }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id]
    })),
  setSelection: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setEditingId: (id) => set({ editingId: id })
}));
