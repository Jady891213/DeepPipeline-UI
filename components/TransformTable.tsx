
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  AlertCircle, 
  Search,
  GripVertical,
  Settings,
  ArrowRight,
  Info
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

  const [searchQuery, setSearchQuery] = useState('');

  const addRule = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    setRules(prev => [...prev, { 
      id: newId, 
      sourceField: MOCK_FIELDS[0].name, 
      targetName: MOCK_FIELDS[0].name + '_transformed', 
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
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
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
          filteredRules.map((rule, index) => (
            <div 
              key={rule.id} 
              className="flex items-start gap-1 px-2 py-3 border-b border-slate-100 hover:bg-indigo-50/10 transition-colors group"
            >
              <div className="flex flex-col items-center gap-1 mt-1 shrink-0 w-6">
                <GripVertical size={12} className="text-slate-300 cursor-grab group-hover:text-slate-400" />
                <span className="text-[9px] text-slate-300 font-mono">{index + 1}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded px-1.5 py-0.5">
                    <select 
                      value={rule.sourceField}
                      onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                      className="w-full text-[11px] bg-transparent border-none outline-none font-medium text-slate-700 h-5"
                    >
                      {MOCK_FIELDS.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <ArrowRight size={10} className="text-slate-300 shrink-0" />
                  <div className="flex-1 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
                    <input 
                      type="text"
                      value={rule.targetName}
                      onChange={(e) => updateRule(rule.id, { targetName: e.target.value })}
                      className="w-full text-[11px] bg-transparent border-none outline-none font-bold text-slate-900 h-5"
                      placeholder="目标名"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <select 
                    value={rule.targetType}
                    onChange={(e) => updateRule(rule.id, { targetType: e.target.value as ColumnType })}
                    className="w-[80px] text-[10px] font-bold text-indigo-600 border border-indigo-100 rounded px-1 bg-indigo-50/30 outline-none h-5"
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {TYPE_OPTIONS.find(o => o.value === rule.targetType)?.hasFormat ? (
                    <div className="flex-1 flex items-center gap-1 border border-dashed border-slate-200 rounded px-1.5 bg-slate-50">
                      <Settings size={10} className="text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={rule.format || ''}
                        onChange={(e) => updateRule(rule.id, { format: e.target.value })}
                        className="w-full text-[10px] font-mono bg-transparent border-none outline-none h-5 text-slate-600"
                        placeholder="格式描述"
                      />
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">无需格式</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                <button onClick={() => copyRule(rule)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Copy size={12} /></button>
                <button onClick={() => removeRule(rule.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex justify-between items-center shrink-0">
        <span>SCHEMA 有效</span>
        <button className="text-indigo-600 font-bold">批量设置</button>
      </div>
    </div>
  );
};

export default TransformTable;
