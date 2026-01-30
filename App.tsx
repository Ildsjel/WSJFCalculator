import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { WSJFItem, WSJFFormData } from './types';
import { WSJFForm } from './components/WSJFForm';
import { WSJFList } from './components/WSJFList';
import { Button } from './components/ui/Button';
import { Plus, LayoutList, Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [items, setItems] = useState<WSJFItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<WSJFItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const data = await db.getAll();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateNew = () => {
    setEditingItem(null);
    setView('create');
  };

  const handleEdit = (item: WSJFItem) => {
    setEditingItem(item);
    setView('create');
  };

  const handleSave = async (formData: WSJFFormData, score: number) => {
    // Flatten formData into the specific structure for storage
    const { name, description, categories, effort, ...rest } = formData;
    
    if (editingItem) {
      await db.update(editingItem.id, {
        name,
        description,
        categories,
        effort,
        wsjfScore: score,
        data: rest as Record<string, number | string>
      });
      setEditingItem(null);
    } else {
      await db.add({
        name,
        description,
        categories,
        effort,
        wsjfScore: score,
        data: rest as Record<string, number | string> // Store specific data broadly
      });
    }
    
    await fetchItems();
    setView('list');
  };

  const handleCancel = () => {
    setEditingItem(null);
    setView('list');
  };

  const handleDelete = async (id: string) => {
    // Direct delete for better UX and to avoid browser blocking issues with confirm()
    await db.delete(id);
    await fetchItems();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              WSJF Master
            </h1>
          </div>
          
          <div className="flex gap-2">
             {view === 'create' && (
                <Button variant="ghost" onClick={handleCancel}>
                   <LayoutList className="w-4 h-4 mr-2" />
                   View List
                </Button>
             )}
             {view === 'list' && (
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Item
                </Button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'list' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Prioritization Backlog</h2>
                  <p className="text-slate-500 mt-1">Manage and rank your initiatives based on Weighted Shortest Job First.</p>
                </div>
                <div className="hidden sm:block text-sm text-slate-400">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'} Found
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <WSJFList items={items} onDelete={handleDelete} onEdit={handleEdit} />
              )}
           </div>
        )}

        {view === 'create' && (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
               <div className="mb-6">
                  <button 
                    onClick={handleCancel}
                    className="text-sm text-slate-500 hover:text-indigo-600 mb-2 inline-flex items-center"
                  >
                    ← Back to list
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
                  <p className="text-slate-500">
                    {editingItem 
                      ? 'Update details below to recalculate the WSJF score.'
                      : 'Fill in the details below to calculate the WSJF score.'}
                  </p>
               </div>
               <WSJFForm 
                 onSave={handleSave} 
                 onCancel={handleCancel} 
                 initialData={editingItem}
               />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;