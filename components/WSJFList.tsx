import React from 'react';
import { WSJFItem, WSJFCategory } from '../types';
import { Button } from './ui/Button';
import { Trash2, TrendingUp, TrendingDown, Shield, DollarSign, Calendar, Pencil, AlertCircle, Clock } from 'lucide-react';

interface WSJFListProps {
  items: WSJFItem[];
  onDelete: (id: string) => void;
  onEdit: (item: WSJFItem) => void;
}

const CategoryIcon: React.FC<{ category: WSJFCategory }> = ({ category }) => {
  switch (category) {
    case WSJFCategory.AVOID_COST: return <TrendingDown className="w-3 h-3 text-orange-600" />;
    case WSJFCategory.REDUCE_COST: return <DollarSign className="w-3 h-3 text-green-600" />;
    case WSJFCategory.PROTECT_REVENUE: return <Shield className="w-3 h-3 text-blue-600" />;
    case WSJFCategory.INCREASE_REVENUE: return <TrendingUp className="w-3 h-3 text-purple-600" />;
    default: return null;
  }
};

const CategoryBadge: React.FC<{ category: WSJFCategory }> = ({ category }) => {
  const styles = {
    [WSJFCategory.AVOID_COST]: "bg-orange-50 text-orange-700 border-orange-100",
    [WSJFCategory.REDUCE_COST]: "bg-green-50 text-green-700 border-green-100",
    [WSJFCategory.PROTECT_REVENUE]: "bg-blue-50 text-blue-700 border-blue-100",
    [WSJFCategory.INCREASE_REVENUE]: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${styles[category]}`}>
      <CategoryIcon category={category} />
      {category}
    </span>
  );
};

// Helper to get deadline info
const getDeadlineInfo = (item: WSJFItem) => {
  const dates: number[] = [];
  if (item.data.timeCostOccur) {
    const d = new Date(item.data.timeCostOccur).getTime();
    if (!isNaN(d)) dates.push(d);
  }
  if (item.data.timeToLossOccur) {
    const d = new Date(item.data.timeToLossOccur).getTime();
    if (!isNaN(d)) dates.push(d);
  }
  if (dates.length === 0) return null;
  
  const earliest = Math.min(...dates);
  const now = Date.now();
  const diffDays = Math.ceil((earliest - now) / (1000 * 60 * 60 * 24));
  
  return { date: earliest, daysLeft: diffDays };
};

export const WSJFList: React.FC<WSJFListProps> = ({ items, onDelete, onEdit }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No items yet</h3>
        <p className="text-slate-500 mt-1">Create a new WSJF item to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => {
        const deadline = getDeadlineInfo(item);
        const isUrgent = deadline && deadline.daysLeft <= 30 && deadline.daysLeft >= -7;
        const isOverdue = deadline && deadline.daysLeft < 0;

        return (
          <div 
            key={item.id} 
            className={`bg-white p-5 rounded-xl shadow-sm border transition-shadow group relative ${
              isUrgent 
                ? 'border-amber-300 ring-1 ring-amber-100 shadow-amber-50' 
                : 'border-slate-100 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1 min-w-0">
                
                {/* Header Row: Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {item.categories.length > 0 ? (
                    item.categories.map(cat => <CategoryBadge key={cat} category={cat} />)
                  ) : (
                    <span className="text-xs text-slate-400 italic">No categories</span>
                  )}
                  
                  {deadline && (
                     <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOverdue 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : isUrgent 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                     }`}>
                        <Clock className="w-3 h-3" />
                        {isOverdue 
                          ? `Overdue by ${Math.abs(deadline.daysLeft)} days` 
                          : deadline.daysLeft === 0 
                             ? 'Due Today'
                             : `Due in ${deadline.daysLeft} days`
                        }
                     </div>
                  )}

                  <span className="text-xs text-slate-300 hidden sm:inline">|</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-500">
                    Effort: <strong>{item.effort}w</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 truncate flex items-center gap-2">
                  {item.name}
                  {isUrgent && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </h3>
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{item.description}</p>
              </div>

              {/* Right Side: Score & Actions */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pl-0 sm:pl-4 sm:border-l border-slate-100 min-w-[120px]">
                <div className="text-right">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">WSJF Score</span>
                  <span className={`block text-3xl font-bold leading-none mt-1 ${isUrgent ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {item.wsjfScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-slate-500 hover:bg-slate-50 hover:text-indigo-600 p-2 h-auto cursor-pointer relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    title="Edit Item"
                    type="button"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-slate-400 hover:bg-red-50 hover:text-red-700 p-2 h-auto cursor-pointer relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    title="Delete Item"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};