import { create } from 'zustand';
import { dbService, Customer, SheetType, WorkItem } from '@/lib/db';

interface AppState {
  isInitialized: boolean;
  customers: Customer[];
  sheetTypes: SheetType[];
  workItems: WorkItem[];
  currentCustomer: Customer | null;
  
  initDb: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  addCustomer: (name: string) => Promise<void>;
  
  loadSheetTypes: () => Promise<void>;
  addSheetType: (name: string) => Promise<void>;
  deleteSheetType: (id: string) => Promise<void>;
  
  loadWorkItems: (customerId?: string) => Promise<void>;
  addWorkItem: (item: Omit<WorkItem, 'id'>) => Promise<void>;
  deleteWorkItem: (id: string) => Promise<void>;
  
  setCurrentCustomer: (customer: Customer | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  isInitialized: false,
  customers: [],
  sheetTypes: [],
  workItems: [],
  currentCustomer: null,

  initDb: async () => {
    await dbService.init();
    set({ isInitialized: true });
    await get().loadCustomers();
    await get().loadSheetTypes();
  },

  loadCustomers: async () => {
    const customers = await dbService.getCustomers();
    set({ customers });
  },

  addCustomer: async (name: string) => {
    await dbService.addCustomer(name);
    await get().loadCustomers();
  },

  loadSheetTypes: async () => {
    const sheetTypes = await dbService.getSheetTypes();
    set({ sheetTypes });
  },

  addSheetType: async (name: string) => {
    await dbService.addSheetType(name);
    await get().loadSheetTypes();
  },

  deleteSheetType: async (id: string) => {
    await dbService.deleteSheetType(id);
    await get().loadSheetTypes();
  },

  loadWorkItems: async (customerId?: string) => {
    const workItems = await dbService.getWorkItems(customerId);
    set({ workItems });
  },

  addWorkItem: async (item: Omit<WorkItem, 'id'>) => {
    await dbService.addWorkItem(item);
    await get().loadWorkItems(item.customerId);
  },
  
  deleteWorkItem: async (id: string) => {
    const currentList = get().workItems;
    const item = currentList.find(i => i.id === id);
    await dbService.deleteWorkItem(id);
    if (item) {
      await get().loadWorkItems(item.customerId);
    }
  },

  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
}));
