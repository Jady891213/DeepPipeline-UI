
import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Search,
  GripVertical,
  Settings,
  Type as TypeIcon,
  ArrowRight
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
      {/* Enhanced Toolbar */}
      <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-700">字段转换配置</span>
          <div className="relative w-64">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索字段名称..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={addRule}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 rounded text-[11px] font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus size={12} />
          添加转换
        </button>
      </div>

      {/* Table-style Layout */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="w-8"></th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">源字段</th>
              <th className="w-6 text-slate-300"></th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">目标名称</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">转换类型</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">格式参数</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRules.map((rule) => {
              const typeConfig = TYPE_OPTIONS.find(o => o.value === rule.targetType);
              return (
                <tr key={rule.id} className="group hover:bg-indigo-50/20 transition-colors">
                  <td className="pl-2 text-center">
                    <GripVertical size={11} className="text-slate-300 cursor-grab group-hover:text-slate-400" />
                  </td>
                  <td className="px-3 py-2">
                    <select 
                      value={rule.sourceField}
                      onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                      className="w-full text-[11px] font-bold text-slate-700 bg-transparent outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-400 transition-colors cursor-pointer"
                    >
                      {MOCK_FIELDS.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <ArrowRight size={10} className="text-slate-300" />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text"
                      value={rule.targetName}
                      onChange={(e) => updateRule(rule.id, { targetName: e.target.value })}
                      className="w-full text-[11px] font-bold text-indigo-700 bg-transparent outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-400 transition-colors"
                      placeholder="目标字段名"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select 
                      value={rule.targetType}
                      onChange={(e) => updateRule(rule.id, { targetType: e.target.value as ColumnType })}
                      className="w-full text-[10px] font-bold text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 bg-white outline-none focus:border-indigo-400"
                    >
                      {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`relative ${!typeConfig?.hasFormat ? 'opacity-30' : ''}`}>
                      <Settings size={10} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="text"
                        value={rule.format || ''}
                        disabled={!typeConfig?.hasFormat}
                        onChange={(e) => updateRule(rule.id, { format: e.target.value })}
                        className="w-full text-[10px] font-mono text-slate-500 bg-slate-50/50 border border-slate-200 rounded pl-5 pr-2 py-0.5 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                        placeholder={typeConfig?.hasFormat ? "输入格式..." : "-"}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyRule(rule)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-transparent hover:border-slate-100"><Copy size={11} /></button>
                      <button onClick={() => removeRule(rule.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded border border-transparent hover:border-slate-100"><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredRules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
             <TypeIcon size={24} className="mb-2 opacity-10" />
             <p className="text-[11px]">未搜索到相关字段配置</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span>总计: <strong>{rules.length}</strong> 个转换规则</span>
          <span className="w-[1px] h-3 bg-slate-300"></span>
          <span>当前显示: <strong>{filteredRules.length}</strong></span>
        </div>
        <button className="text-indigo-600 font-bold hover:underline">导出配置 (JSON)</button>
      </div>
    </div>
  );
};

export default TransformTable;
