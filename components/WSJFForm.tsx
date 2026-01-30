import React, { useState, useEffect } from 'react';
import { WSJFCategory, WSJFFormData, WSJFItem } from '../types';
import { calculateWSJF } from '../utils/calculations';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Save, RefreshCw, Check } from 'lucide-react';

interface WSJFFormProps {
  onSave: (data: WSJFFormData, score: number) => void;
  onCancel: () => void;
  initialData?: WSJFItem | null;
}

const INITIAL_DATA: WSJFFormData = {
  name: '',
  description: '',
  categories: [],
  effort: 1,
};

export const WSJFForm: React.FC<WSJFFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<WSJFFormData>(INITIAL_DATA);
  const [wsjfScore, setWsjfScore] = useState<number>(0);

  // Initialize form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        categories: initialData.categories || [],
        effort: initialData.effort || 1,
        ...initialData.data
      });
    }
  }, [initialData]);

  // Auto-calculate logic
  useEffect(() => {
    const score = calculateWSJF(formData);
    setWsjfScore(score);
  }, [formData]);

  const handleChange = (field: keyof WSJFFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof WSJFFormData, value: string) => {
    // Allow empty string for better UX while typing, convert to number for storage/calc
    const numVal = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numVal }));
  };

  const toggleCategory = (category: WSJFCategory) => {
    setFormData(prev => {
      const exists = prev.categories.includes(category);
      const newCategories = exists 
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return; 
    onSave(formData, wsjfScore);
  };

  const renderCategoryInputs = (category: WSJFCategory) => {
    switch (category) {
      case WSJFCategory.AVOID_COST:
        return (
          <div key={category} className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-2 mb-2">
                 <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Avoid Cost</div>
                 <h3 className="text-sm font-semibold text-slate-700">Inputs</h3>
             </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cost Avoided Total ($)"
                type="number"
                placeholder="e.g. 50000"
                value={formData.costAvoidedTotal || ''}
                onChange={(e) => handleNumberChange('costAvoidedTotal', e.target.value)}
              />
              <div className="hidden md:block"></div> {/* Spacer to align grid if needed, or remove */}
              <Input
                label="Risk Score % (Optional)"
                type="number"
                placeholder="e.g. 100"
                min="0"
                max="100"
                value={formData.risk !== undefined ? formData.risk : ''}
                onChange={(e) => handleNumberChange('risk', e.target.value)}
              />
              <Input
                label="Time Cost Occur (Deadline)"
                type="date"
                value={formData.timeCostOccur || ''}
                onChange={(e) => handleChange('timeCostOccur', e.target.value)}
                helperText="Smart sorting will prioritize items near this date."
              />
            </div>
          </div>
        );

      case WSJFCategory.REDUCE_COST:
        return (
          <div key={category} className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
                 <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Reduce Cost</div>
                 <h3 className="text-sm font-semibold text-slate-700">Inputs ($25/hr rate)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="People Now"
                type="number"
                value={formData.peopleNow || ''}
                onChange={(e) => handleNumberChange('peopleNow', e.target.value)}
              />
              <Input
                label="Hours Now"
                type="number"
                value={formData.hoursNow || ''}
                onChange={(e) => handleNumberChange('hoursNow', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="People Future"
                type="number"
                value={formData.peopleFuture || ''}
                onChange={(e) => handleNumberChange('peopleFuture', e.target.value)}
              />
              <Input
                label="Hours Future"
                type="number"
                value={formData.hoursFuture || ''}
                onChange={(e) => handleNumberChange('hoursFuture', e.target.value)}
              />
            </div>
          </div>
        );

      case WSJFCategory.PROTECT_REVENUE:
        return (
          <div key={category} className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
                 <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Protect Revenue</div>
                 <h3 className="text-sm font-semibold text-slate-700">Inputs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Total Revenue Protected ($)"
                type="number"
                value={formData.totalRevenueProtected || ''}
                onChange={(e) => handleNumberChange('totalRevenueProtected', e.target.value)}
              />
              <Input
                label="Market share at risk % (Optional)"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={formData.marketShare !== undefined ? formData.marketShare : ''}
                onChange={(e) => handleNumberChange('marketShare', e.target.value)}
              />
               <Input
                label="Time To Loss Occur (Deadline)"
                type="date"
                value={formData.timeToLossOccur || ''}
                onChange={(e) => handleChange('timeToLossOccur', e.target.value)}
                helperText="Smart sorting will prioritize items near this date."
              />
            </div>
          </div>
        );

      case WSJFCategory.INCREASE_REVENUE:
        return (
          <div key={category} className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-2 mb-2">
                 <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Increase Revenue</div>
                 <h3 className="text-sm font-semibold text-slate-700">Inputs</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Revenue Now ($)"
                type="number"
                value={formData.revenueNow || ''}
                onChange={(e) => handleNumberChange('revenueNow', e.target.value)}
              />
              <Input
                label="Sales Now (Qty)"
                type="number"
                value={formData.salesNow || ''}
                onChange={(e) => handleNumberChange('salesNow', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Revenue Future ($)"
                type="number"
                value={formData.revenueFuture || ''}
                onChange={(e) => handleNumberChange('revenueFuture', e.target.value)}
              />
              <Input
                label="Sales Future (Qty)"
                type="number"
                value={formData.salesFuture || ''}
                onChange={(e) => handleNumberChange('salesFuture', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit WSJF Calculation' : 'New WSJF Calculation'}</h2>
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Projected Score</span>
            <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-lg ${wsjfScore > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                {wsjfScore.toFixed(2)}
            </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Main Item Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="Item Name"
              required
              placeholder="e.g. Upgrade Database Cluster"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
             <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="h-[105px] px-3 py-2 bg-white text-slate-900 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Brief description of the initiative..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
                label="Effort (weeks)"
                type="number"
                placeholder="Total effort in weeks"
                required
                min="0.1"
                step="0.1"
                value={formData.effort || ''}
                onChange={(e) => handleNumberChange('effort', e.target.value)}
                helperText="Estimated duration to complete this item."
              />
             <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Value Categories (Select multiple)</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(WSJFCategory).map((cat) => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Sections */}
        {formData.categories.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
              <h3 className="text-md font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  Value Calculation Details
              </h3>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-6 text-sm text-blue-900">
                  Total Value = Sum of calculated values from selected categories.<br/>
                  <strong>WSJF Score = Total Value / Effort</strong>
              </div>

              <div className="space-y-6">
                {formData.categories.map((cat) => renderCategoryInputs(cat))}
              </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || formData.categories.length === 0}>
          <Save className="w-4 h-4 mr-2 inline-block" />
          {initialData ? 'Update Item' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
};