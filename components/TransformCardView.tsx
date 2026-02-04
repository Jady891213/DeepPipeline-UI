
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Search,
  GripVertical,
  Settings,
  Edit3,
  X,
  Type
} from 'lucide-react';
import { ColumnType, TransformationRule } from '../types';
import { MOCK_FIELDS, TYPE_OPTIONS } from '../constants';

const TransformCardView: React.FC = () => {
  const [rules, setRules] = useState<TransformationRule[]>([
    { id: '1', sourceField: 'is_resend', targetName: 'is_resend', targetType: ColumnType.STRING, format: 'BOOL_%Y' },
    { id: '2', sourceField: 'create_type', targetName: 'create_type_new', targetType: ColumnType.STRING },
    { id: '3', sourceField: 'status', targetName: 'status', targetType: ColumnType.INTEGER },
    { id: '4', sourceField: 'warehouse_id', targetName: 'wh_id', targetType: ColumnType.STRING },
  ]);

  // Track which cards have the "Rename" field expanded
  const [renamingIds, setRenamingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRename = useCallback((id: string) => {
    setRenamingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addRule = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    const field = MOCK_FIELDS[0];
    setRules(prev => [...prev, { 
      id: newId, 
      sourceField: field.name, 
      targetName: field.name, 
      targetType: ColumnType.STRING 
    }]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const copyRule = useCallback((rule: TransformationRule) => {
    const newRule = { ...rule, id: Math.random().toString(36).substr(2, 9), targetName: `${rule.targetName}_copy` };
    setRules(prev => [...prev, newRule]);
  }, []);

  const updateRule = useCallback((id: string, updates: Partial<TransformationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const filteredRules = rules.filter(r => 
    r.sourceField.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.targetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Toolbar */}
      <div className="p-3 bg-white border-b border-slate-100 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">卡片转换视图</h2>
          <button onClick={addRule} className="text-indigo-600 font-bold text-[10px] flex items-center gap-1 hover:text-indigo-700 transition-colors">
            <Plus size={12} strokeWidth={3} /> 新增配置
          </button>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="过滤字段..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-[11px] border border-slate-200 rounded outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Card List Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-slate-50/20">
        {filteredRules.map(rule => {
          const isRenaming = renamingIds.has(rule.id);
          const typeConfig = TYPE_OPTIONS.find(o => o.value === rule.targetType);

          return (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
              
              {/* Header: Source Field & Actions */}
              <div className="px-2 py-1.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <GripVertical size={11} className="text-slate-300 shrink-0 cursor-grab group-hover:text-slate-400" />
                  <select 
                    value={rule.sourceField}
                    onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                    className="text-[11px] font-bold text-slate-700 bg-transparent outline-none truncate w-full hover:bg-white px-1 rounded transition-colors cursor-pointer"
                  >
                    {MOCK_FIELDS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-0.5 ml-2">
                  <button 
                    onClick={() => toggleRename(rule.id)} 
                    title="重命名目标字段"
                    className={`p-1 rounded transition-colors ${isRenaming ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50'}`}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => copyRule(rule)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded transition-colors"><Copy size={12} /></button>
                  <button onClick={() => removeRule(rule.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>

              {/* Body: Conditional Rename + Type/Format Config */}
              <div className="p-2 space-y-2">
                
                {/* Conditional Row: Target Name (Rename) */}
                {isRenaming && (
                  <div className="flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between px-0.5">
                       <span className="text-[9px] font-bold text-indigo-400 uppercase">目标字段名</span>
                       <button onClick={() => toggleRename(rule.id)} className="text-slate-300 hover:text-slate-500"><X size={10} /></button>
                    </div>
                    <div className="relative">
                      <Type size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text"
                        value={rule.targetName}
                        onChange={(e) => updateRule(rule.id, { targetName: e.target.value })}
                        className="w-full text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border border-indigo-100 rounded-md pl-6 pr-2 py-1 outline-none focus:border-indigo-400"
                        placeholder="输入新字段名..."
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Configuration Row: Type (30%) & Format (70%) */}
                <div className="flex gap-1.5 items-end">
                  {/* Type Selection (30%) */}
                  <div className="w-[35%] flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase px-0.5">目标类型</span>
                    <select 
                      value={rule.targetType}
                      onChange={(e) => updateRule(rule.id, { targetType: e.target.value as ColumnType })}
                      className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded px-1.5 py-1 bg-white outline-none focus:border-indigo-400 transition-colors"
                    >
                      {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  {/* Format/Extra Params (70%) */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase px-0.5">
                      {typeConfig?.hasFormat ? '转换格式' : '额外参数'}
                    </span>
                    <div className={`relative flex-1 ${!typeConfig?.hasFormat ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <Settings size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text"
                        value={rule.format || ''}
                        disabled={!typeConfig?.hasFormat}
                        onChange={(e) => updateRule(rule.id, { format: e.target.value })}
                        className="w-full text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded pl-6 pr-2 py-1 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                        placeholder={typeConfig?.hasFormat ? "例: YYYY-MM-DD" : "无附加参数"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransformCardView;
