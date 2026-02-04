
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  GripVertical,
  Settings,
  ArrowRight,
  Database,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ColumnType, TransformationRule } from '../types';
import { MOCK_FIELDS, TYPE_OPTIONS } from '../constants';

const TransformTable: React.FC = () => {
  const [rules, setRules] = useState<TransformationRule[]>([
    { id: '1', sourceField: 'id', targetName: 'order_id', targetType: ColumnType.INTEGER },
    { id: '2', sourceField: 'is_resend', targetName: 'is_resend_flag', targetType: ColumnType.STRING, format: 'BOOL_01' },
    { id: '3', sourceField: 'price', targetName: 'unit_price', targetType: ColumnType.DECIMAL },
    { id: '4', sourceField: 'updated_at', targetName: 'sync_time', targetType: ColumnType.DATETIME, format: 'YYYY-MM-DD HH:mm:ss' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

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

  const updateRule = useCallback((id: string, updates: Partial<TransformationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const filteredRules = rules.filter(r => 
    r.sourceField.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.targetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-900">
      {/* 极简顶栏 */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Database size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-800">字段转换映射</h2>
            <p className="text-[10px] text-slate-400 font-medium">Field Mapping & Transformation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索字段..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9 pr-3 py-1.5 text-[11px] bg-slate-50 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>
          <button 
            onClick={addRule}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-lg text-[11px] font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={14} />
            添加映射
          </button>
        </div>
      </div>

      {/* 映射列表 */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        <div className="max-w-4xl mx-auto py-4 px-6">
          <div className="space-y-1">
            {filteredRules.map((rule) => (
              <MappingRow 
                key={rule.id}
                rule={rule}
                onUpdate={(updates) => updateRule(rule.id, updates)}
                onDelete={() => removeRule(rule.id)}
              />
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
              <Sparkles size={32} className="text-slate-200 mb-3" />
              <p className="text-[12px] text-slate-400 font-medium">暂无映射规则，点击右上角添加</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部状态 */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Active Rules</span>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{rules.length}</span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">取消</button>
          <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">批量预览</button>
        </div>
      </div>
    </div>
  );
};

const MappingRow: React.FC<{
  rule: TransformationRule;
  onUpdate: (updates: Partial<TransformationRule>) => void;
  onDelete: () => void;
}> = ({ rule, onUpdate, onDelete }) => {
  const [showFormat, setShowFormat] = useState(!!rule.format);
  const typeConfig = TYPE_OPTIONS.find(o => o.value === rule.targetType);

  return (
    <div className="group flex items-center gap-3 p-2 bg-white border border-slate-200/60 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2 duration-200">
      <div className="shrink-0 flex items-center gap-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={14} className="text-slate-300" />
      </div>

      {/* 源字段 */}
      <div className="flex-1 min-w-0">
        <div className="relative group/field">
          <select 
            value={rule.sourceField}
            onChange={(e) => onUpdate({ sourceField: e.target.value })}
            className="w-full h-8 px-2 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg appearance-none cursor-pointer hover:bg-white hover:border-indigo-100 transition-all outline-none"
          >
            {MOCK_FIELDS.map(f => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <ChevronRight size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover/field:text-indigo-400" />
        </div>
      </div>

      <div className="shrink-0 text-slate-300">
        <ArrowRight size={14} />
      </div>

      {/* 目标名称 */}
      <div className="flex-1 min-w-0">
        <input 
          type="text"
          value={rule.targetName}
          onChange={(e) => onUpdate({ targetName: e.target.value })}
          placeholder="目标名称..."
          className="w-full h-8 px-2.5 text-[11px] font-bold text-indigo-600 bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300"
        />
      </div>

      {/* 目标类型 */}
      <div className="w-[110px] shrink-0">
        <div className="relative group/type">
          <select 
            value={rule.targetType}
            onChange={(e) => onUpdate({ targetType: e.target.value as ColumnType })}
            className="w-full h-8 px-2 text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-100 rounded-lg appearance-none cursor-pointer hover:bg-white hover:border-indigo-100 transition-all outline-none uppercase"
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronRight size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none group-hover/type:text-indigo-400" />
        </div>
      </div>

      {/* 格式参数 (按需显示) */}
      <div className={`transition-all duration-300 overflow-hidden flex items-center gap-2 ${showFormat || typeConfig?.hasFormat ? 'w-40' : 'w-8'}`}>
        {typeConfig?.hasFormat ? (
          <div className="relative flex-1 group/format">
            <Settings size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/format:text-indigo-400" />
            <input 
              type="text"
              value={rule.format || ''}
              onChange={(e) => onUpdate({ format: e.target.value })}
              placeholder="格式..."
              className="w-full h-8 pl-6 pr-2 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-indigo-200 focus:bg-white transition-all"
            />
          </div>
        ) : (
          <button 
            onClick={() => setShowFormat(!showFormat)}
            title="高级设置"
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Settings size={14} />
          </button>
        )}
      </div>

      <div className="shrink-0 flex items-center">
        <button 
          onClick={onDelete}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TransformTable;
