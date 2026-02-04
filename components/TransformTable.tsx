
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  AlertCircle, 
  Search,
  GripVertical,
  Settings,
  Edit3,
  X,
  Type as TypeIcon
} from 'lucide-react';
import { ColumnType, TransformationRule } from '../types';
import { MOCK_FIELDS, TYPE_OPTIONS } from '../constants';

const TransformTable: React.FC = () => {
  const [rules, setRules] = useState<TransformationRule[]>([
    { id: '1', sourceField: 'is_resend', targetName: 'is_resend', targetType: ColumnType.STRING, format: 'BOOL_%Y' },
    { id: '2', sourceField: 'create_type', targetName: 'create_type_new', targetType: ColumnType.STRING },
    { id: '3', sourceField: 'status', targetName: 'status', targetType: ColumnType.INTEGER },
    { id: '4', sourceField: 'warehouse_id', targetName: 'wh_id', targetType: ColumnType.STRING },
  ]);

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
      {/* Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">列表转换配置</span>
           <button 
            onClick={addRule}
            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Plus size={12} className="text-indigo-600" />
            新增
          </button>
        </div>
        <div className="relative group">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
          <input 
            type="text" 
            placeholder="搜索字段..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* List Body */}
      <div className="flex-1 overflow-y-auto">
        {filteredRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <AlertCircle size={24} className="mb-2 opacity-20" />
            <p className="text-[11px]">无匹配结果</p>
          </div>
        ) : (
          filteredRules.map((rule, index) => {
            const isRenaming = renamingIds.has(rule.id);
            const typeConfig = TYPE_OPTIONS.find(o => o.value === rule.targetType);

            return (
              <div 
                key={rule.id} 
                className="flex flex-col px-3 py-2 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group relative"
              >
                {/* Header Row: Source Selection + Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <GripVertical size={11} className="text-slate-300 shrink-0 cursor-grab group-hover:text-slate-400" />
                    <select 
                      value={rule.sourceField}
                      onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                      className="text-[11px] font-bold text-slate-700 bg-transparent outline-none truncate w-full hover:bg-white px-1 rounded transition-colors cursor-pointer h-6"
                    >
                      {MOCK_FIELDS.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleRename(rule.id)} 
                      className={`p-1 rounded ${isRenaming ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}
                    >
                      <Edit3 size={11} />
                    </button>
                    <button onClick={() => copyRule(rule)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded"><Copy size={11} /></button>
                    <button onClick={() => removeRule(rule.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded"><Trash2 size={11} /></button>
                  </div>
                </div>

                {/* Optional Rename Row */}
                {isRenaming && (
                  <div className="mt-1.5 mb-1 animate-in slide-in-from-top-1 duration-200">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-indigo-400 uppercase">Target</div>
                      <input 
                        type="text"
                        value={rule.targetName}
                        onChange={(e) => updateRule(rule.id, { targetName: e.target.value })}
                        className="w-full text-[11px] font-bold text-indigo-700 bg-indigo-50/30 border border-indigo-100 rounded-md pl-14 pr-7 py-1 outline-none focus:border-indigo-400"
                        placeholder="重命名目标..."
                        autoFocus
                      />
                      <button 
                        onClick={() => toggleRename(rule.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Configuration Row: Type (30%) & Format (70%) */}
                <div className="mt-1.5 flex gap-2 items-center">
                  <div className="w-[30%] shrink-0">
                    <select 
                      value={rule.targetType}
                      onChange={(e) => updateRule(rule.id, { targetType: e.target.value as ColumnType })}
                      className="w-full text-[10px] font-bold text-slate-600 border border-slate-200 rounded px-1 py-0.5 bg-white outline-none focus:border-indigo-400"
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={`flex-1 relative ${!typeConfig?.hasFormat ? 'opacity-30' : ''}`}>
                    <Settings size={10} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text"
                      value={rule.format || ''}
                      disabled={!typeConfig?.hasFormat}
                      onChange={(e) => updateRule(rule.id, { format: e.target.value })}
                      className="w-full text-[10px] font-mono text-slate-500 bg-slate-50/50 border border-slate-200 rounded pl-5 pr-2 py-0.5 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                      placeholder={typeConfig?.hasFormat ? "格式描述" : "无额外参数"}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex justify-between items-center shrink-0">
        <span className="flex items-center gap-1 uppercase tracking-tighter">
           <TypeIcon size={10} /> 字段转换模式
        </span>
        <button className="text-indigo-600 font-bold hover:underline">批量设置</button>
      </div>
    </div>
  );
};

export default TransformTable;
