import { create } from 'zustand';
import { dbService, Customer, SheetType, WorkItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  isInitialized: boolean;
  isLoadingData: boolean;
  customers: Customer[];
  sheetTypes: SheetType[];
  workItems: WorkItem[];
  currentCustomer: Customer | null;
  
  initDb: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  addCustomer: (name: string) => Promise<Customer>;
  
  loadSheetTypes: () => Promise<void>;
  addSheetType: (name: string) => Promise<SheetType>;
  deleteSheetType: (id: string) => Promise<void>;
  
  loadWorkItems: (customerId?: string) => Promise<void>;
  addWorkItem: (item: Omit<WorkItem, 'id'>) => Promise<WorkItem>;
  deleteWorkItem: (id: string) => Promise<void>;
  
  setCurrentCustomer: (customer: Customer | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  isInitialized: false,
  isLoadingData: false,
  customers: [],
  sheetTypes: [],
  workItems: [],
  currentCustomer: null,

  // ۱. راه‌اندازی بدون بلاک کردن رندر: دیتابیس آماده شده و دیتا به‌صورت موازی در پس‌زمینه خوانده می‌شود
  initDb: async () => {
    try {
      await dbService.init();
      set({ isInitialized: true, isLoadingData: true });

      // بارگذاری موازی داده‌های اولیه
      const [customers, sheetTypes] = await Promise.all([
        dbService.getCustomers(),
        dbService.getSheetTypes()
      ]);
      set({ customers, sheetTypes, isLoadingData: false });
    } catch (err) {
      console.error("DB Initialization error:", err);
      set({ isInitialized: true, isLoadingData: false });
    }
  },

  loadCustomers: async () => {
    const customers = await dbService.getCustomers();
    set({ customers });
  },

  // ۴. آپدیت خوش‌بینانه مشتری: اعمال فوری در UI بدون معطلی دیسک
  addCustomer: async (name: string) => {
    const optimisticCustomer: Customer = {
      id: uuidv4(),
      name: name.trim()
    };

    // بروزرسانی آنی استیت
    set((state) => ({
      customers: [optimisticCustomer, ...state.customers]
    }));

    // ذخیره‌سازی غیرهمگام در پس‌زمینه
    dbService.addCustomer(optimisticCustomer.name, optimisticCustomer.id).catch((err) => {
      console.error("Error saving customer in background:", err);
      // بازگردانی در صورت خطا (Rollback)
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== optimisticCustomer.id)
      }));
    });

    return optimisticCustomer;
  },

  loadSheetTypes: async () => {
    const sheetTypes = await dbService.getSheetTypes();
    set({ sheetTypes });
  },

  // ۴. آپدیت خوش‌بینانه نوع ورق
  addSheetType: async (name: string) => {
    const optimisticSheet: SheetType = {
      id: uuidv4(),
      name: name.trim()
    };

    set((state) => ({
      sheetTypes: [...state.sheetTypes, optimisticSheet]
    }));

    dbService.addSheetType(optimisticSheet.name, optimisticSheet.id).catch((err) => {
      console.error("Error saving sheet type in background:", err);
      set((state) => ({
        sheetTypes: state.sheetTypes.filter((s) => s.id !== optimisticSheet.id)
      }));
    });

    return optimisticSheet;
  },

  // ۴. حذف خوش‌بینانه نوع ورق
  deleteSheetType: async (id: string) => {
    const previous = get().sheetTypes;
    set((state) => ({
      sheetTypes: state.sheetTypes.filter((s) => s.id !== id)
    }));

    dbService.deleteSheetType(id).catch((err) => {
      console.error("Error deleting sheet type in background:", err);
      set({ sheetTypes: previous });
    });
  },

  loadWorkItems: async (customerId?: string) => {
    const workItems = await dbService.getWorkItems(customerId);
    set({ workItems });
  },

  // ۴. آپدیت خوش‌بینانه سفارش
  addWorkItem: async (itemData: Omit<WorkItem, 'id'>) => {
    const optimisticItem: WorkItem = {
      ...itemData,
      id: uuidv4()
    };

    set((state) => ({
      workItems: [optimisticItem, ...state.workItems]
    }));

    dbService.addWorkItem(optimisticItem).catch((err) => {
      console.error("Error saving work item in background:", err);
      set((state) => ({
        workItems: state.workItems.filter((i) => i.id !== optimisticItem.id)
      }));
    });

    return optimisticItem;
  },
  
  // ۴. حذف خوش‌بینانه سفارش
  deleteWorkItem: async (id: string) => {
    const previous = get().workItems;
    set((state) => ({
      workItems: state.workItems.filter((i) => i.id !== id)
    }));

    dbService.deleteWorkItem(id).catch((err) => {
      console.error("Error deleting work item in background:", err);
      set({ workItems: previous });
    });
  },

  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
}));
