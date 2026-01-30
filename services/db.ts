import { WSJFItem } from '../types';

const STORAGE_KEY = 'wsjf_items_db';

// Helper to extract earliest deadline from an item
const getItemDeadline = (item: WSJFItem): number | null => {
  const dates: number[] = [];
  
  // Parse 'Avoid Cost' deadline
  if (item.data.timeCostOccur) {
    const d = new Date(item.data.timeCostOccur).getTime();
    if (!isNaN(d)) dates.push(d);
  }
  
  // Parse 'Protect Revenue' deadline
  if (item.data.timeToLossOccur) {
    const d = new Date(item.data.timeToLossOccur).getTime();
    if (!isNaN(d)) dates.push(d);
  }
  
  if (dates.length === 0) return null;
  // Return the earliest deadline found
  return Math.min(...dates);
};

// Simulating an async database for better architectural practice
export const db = {
  async getAll(): Promise<WSJFItem[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      
      // Migration logic: Normalize old items to new structure
      const items = parsed.map((item: any) => {
        // Handle migration from single category to array
        const categories = item.categories ?? (item.category ? [item.category] : []);
        
        // Handle migration of effort from specific fields to shared field
        const effort = item.effort ?? (
          item.data?.estimationAvoidValue || 
          item.data?.estimationValue || 
          item.data?.estimationProtectValue || 
          item.data?.estimationIncreaseValue || 
          0
        );

        return {
          ...item,
          categories,
          effort: Number(effort),
        };
      }) as WSJFItem[];

      // SMART SORTING LOGIC
      // 1. "Urgent" items (deadline within 30 days, not passed significantly) go first.
      // 2. Sorted by deadline ascending (soonest first).
      // 3. Then non-urgent items sorted by WSJF Score descending.
      
      return items.sort((a, b) => {
        const now = Date.now();
        const deadlineA = getItemDeadline(a);
        const deadlineB = getItemDeadline(b);

        // Define "Urgent" as: has deadline AND deadline is effectively in the future (or slightly passed) 
        // AND deadline is within next 30 days.
        const isUrgent = (d: number | null) => {
          if (d === null) return false;
          // Include items that are overdue by up to 7 days in "urgent" to keep them visible, 
          // and items due in next 30 days.
          const diff = d - now;
          const daysDiff = diff / (1000 * 60 * 60 * 24);
          return daysDiff > -7 && daysDiff < 30;
        };

        const urgentA = isUrgent(deadlineA);
        const urgentB = isUrgent(deadlineB);

        // If one is urgent and other is not, priority to urgent
        if (urgentA && !urgentB) return -1;
        if (!urgentA && urgentB) return 1;

        // If both are urgent, sort by earliest deadline
        if (urgentA && urgentB) {
          return (deadlineA as number) - (deadlineB as number);
        }

        // If neither is urgent (or both are "far future"), sort by WSJF Score (Highest First)
        if (b.wsjfScore !== a.wsjfScore) {
            return b.wsjfScore - a.wsjfScore;
        }
        // Fallback to creation date
        return b.createdAt - a.createdAt;
      });
    } catch (e) {
      console.error("Failed to parse DB", e);
      return [];
    }
  },

  async add(item: Omit<WSJFItem, 'id' | 'createdAt'>): Promise<WSJFItem> {
    const items = await this.getAll();
    const newItem: WSJFItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    items.push(newItem); // Add to end, sorting handles order on next fetch
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  async update(id: string, updates: Partial<WSJFItem>): Promise<void> {
    // We get all, find index, update, then save. 
    // Note: getAll sorts them, but we need to find the specific ID in the raw storage or just map over getAll result.
    // For simplicity with this mock DB, we can just read raw, map, save.
    // But since getAll performs migration, it's safer to use getAll() result then overwrite storage.
    const items = await this.getAll();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;
    
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};