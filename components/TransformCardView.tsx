
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  AlertCircle, 
  Search,
  GripVertical,
  Settings,
  ChevronRight,
  Hash,
  FileText,
  Calendar,
  ToggleLeft,
  Type
} from 'lucide-react';
import { ColumnType, TransformationRule } from '../types';
import { MOCK_FIELDS, TYPE_OPTIONS } from '../constants';

const getTypeIcon = (type: ColumnType) => {
  switch (type) {
    case ColumnType.STRING: return <FileText size={12} className="text-blue-500" />;
    case ColumnType.INTEGER: return <Hash size={12} className="text-green-500" />;
    case ColumnType.DECIMAL: return <Hash size={12} className="text-emerald-500" />;
    case ColumnType.DATETIME: return <Calendar size={12} className="text-purple-500" />;
    case ColumnType.BOOLEAN: return <ToggleLeft size={12} className="text-orange-500" />;
    default: return <Type size={12} className="text-slate-500" />;
  }
};

const TransformCardView: React.FC = () => {
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
      <div className="p-3 bg-white border-b border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase">卡片转换视图</h2>
          <button onClick={addRule} className="text-indigo-600 font-bold text-[10px] flex items-center gap-1 hover:underline">
            <Plus size={12} /> 新增配置
          </button>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="过滤配置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-[11px] border border-slate-200 rounded outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
        {filteredRules.map(rule => (
          <div key={rule.id} className="bg-white border border-slate-200 rounded-md shadow-sm group hover:border-indigo-300 transition-all overflow-hidden relative">
            <div className={`h-0.5 w-full ${TYPE_OPTIONS.find(o => o.value === rule.targetType)?.hasFormat ? 'bg-indigo-400' : 'bg-slate-200'}`} />
            
            <div className="p-2 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <GripVertical size={10} className="text-slate-200 shrink-0" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SRC:</span>
                <select 
                  value={rule.sourceField}
                  onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                  className="text-[10px] font-bold text-slate-600 bg-transparent outline-none truncate"
                >
                  {MOCK_FIELDS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => copyRule(rule)} className="p-0.5 text-slate-400 hover:text-indigo-600"><Copy size={12} /></button>
                <button onClick={() => removeRule(rule.id)} className="p-0.5 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>

            <div className="p-2 space-y-2">
              <div className="flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded border border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Target</div>
                  <input 
                    type="text"
                    value={rule.targetName}
                    onChange={(e) => updateRule(rule.id, { targetName: e.target.value })}
                    className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none"
                  />
                </div>
                <ChevronRight size={10} className="text-slate-300 shrink-0" />
                <div className="shrink-0 text-right">
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Type</div>
                  <select 
                    value={rule.targetType}
                    onChange={(e) => updateRule(rule.id, { targetType: e.target.value as ColumnType })}
                    className="text-[10px] font-bold text-indigo-600 bg-transparent outline-none text-right"
                  >
                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              {TYPE_OPTIONS.find(o => o.value === rule.targetType)?.hasFormat && (
                <div className="px-1.5 py-1 bg-indigo-50/30 border border-indigo-50 rounded">
                  <div className="text-[8px] font-bold text-indigo-400 uppercase mb-0.5">Format Description</div>
                  <input 
                    type="text"
                    value={rule.format || ''}
                    onChange={(e) => updateRule(rule.id, { format: e.target.value })}
                    className="w-full text-[10px] font-mono bg-transparent outline-none text-indigo-700"
                    placeholder="配置转换详情..."
                  />
                </div>
              )}
            </div>

            <div className="px-2 py-1 bg-slate-50/50 border-t border-slate-50 flex items-center gap-1">
               {getTypeIcon(rule.targetType)}
               <span className="text-[9px] font-medium text-slate-500">{TYPE_OPTIONS.find(o => o.value === rule.targetType)?.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransformCardView;
