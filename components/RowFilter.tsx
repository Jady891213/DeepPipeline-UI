
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Type, 
  Copy,
  LayoutList,
  Network,
  FunctionSquare,
  MoreVertical,
  PlusSquare,
  Layers,
  ArrowRightCircle,
  PlusCircle
} from 'lucide-react';

type Conjunction = 'AND' | 'OR';
type UIStyle = 'spine' | 'tree';

interface Condition {
  id: string;
  type: 'item';
  field: string;
  operator: string;
  value: string;
  isFx: boolean;
}

interface Group {
  id: string;
  type: 'group';
  conjunction: Conjunction;
  children: (Condition | Group)[];
}

const RowFilter: React.FC = () => {
  const [activeStyle, setActiveStyle] = useState<UIStyle>('spine');
  
  const [rootGroup, setRootGroup] = useState<Group>({
    id: 'root',
    type: 'group',
    conjunction: 'AND',
    children: [
      {
        id: 'g1',
        type: 'group',
        conjunction: 'OR',
        children: [
          { id: 'c1', type: 'item', field: 'platform_code', operator: '不在...列表中', value: "['amazon','ebay']", isFx: true },
          { id: 'c2', type: 'item', field: 'warehouse_region', operator: '等于', value: 'US-West', isFx: false },
        ]
      },
      {
        id: 'g2',
        type: 'group',
        conjunction: 'AND',
        children: [
          { id: 'c3', type: 'item', field: 'total_price', operator: '大于', value: '100.00', isFx: false },
          {
            id: 'g2-1',
            type: 'group',
            conjunction: 'OR',
            children: [
              { id: 'c4', type: 'item', field: 'shipping_tag', operator: '等于', value: 'Express', isFx: false },
              { id: 'c5', type: 'item', field: 'is_premium', operator: '等于', value: 'true', isFx: true }
            ]
          }
        ]
      },
      { id: 'c6', type: 'item', field: 'order_status', operator: '不在...列表中', value: "['CANCELLED']", isFx: false }
    ]
  });

  const toggleConjunction = (groupId: string) => {
    const update = (g: Group): Group => {
      if (g.id === groupId) return { ...g, conjunction: g.conjunction === 'AND' ? 'OR' : 'AND' };
      return { ...g, children: g.children.map(c => c.type === 'group' ? update(c) : c) };
    };
    setRootGroup(update(rootGroup));
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden text-slate-900">
      {/* Header - Compact */}
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3 rounded-full bg-indigo-500"></div>
          <h2 className="text-[11px] font-bold text-slate-700">
            行过滤配置 (分组模式)
          </h2>
        </div>
        
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button 
            onClick={() => setActiveStyle('spine')}
            className={`p-1 rounded text-[10px] transition-all ${activeStyle === 'spine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <LayoutList size={12} />
          </button>
          <button 
            onClick={() => setActiveStyle('tree')}
            className={`p-1 rounded text-[10px] transition-all ${activeStyle === 'tree' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Network size={12} />
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className={`flex-1 overflow-auto p-6 transition-colors ${activeStyle === 'spine' ? 'bg-white' : 'bg-slate-50/20'}`}>
        <div className="max-w-[600px]">
          <GroupNode 
            group={rootGroup} 
            depth={0} 
            style={activeStyle}
            onToggle={toggleConjunction} 
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-slate-400 font-medium">逻辑嵌套深度: 3 层</span>
        <div className="flex gap-2">
          <button className="px-4 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors">重置</button>
          <button className="px-5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 transition-all">应用配置</button>
        </div>
      </div>
    </div>
  );
};

const GroupNode: React.FC<{ group: Group; depth: number; style: UIStyle; onToggle: (id: string) => void }> = ({ group, depth, style, onToggle }) => {
  const isAnd = group.conjunction === 'AND';
  const railColorClass = isAnd ? 'bg-orange-400' : 'bg-teal-400';
  const buttonColorClass = isAnd 
    ? 'bg-orange-500 text-white border-orange-600' 
    : 'bg-teal-500 text-white border-teal-600';

  const indentClass = depth > 0 ? 'mt-4 ml-8' : 'ml-4';
  const railOffset = '-left-8';

  return (
    <div className={`relative ${indentClass}`}>
      <div className="relative">
        {/* Connector Rail & Switcher - Rail made thicker (w-[2px]) */}
        <div className={`absolute ${railOffset} top-0 bottom-0 flex items-center justify-center w-6`}>
          <div className={`w-[2px] ${railColorClass} absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30`}></div>
          <button 
            onClick={() => onToggle(group.id)}
            className={`z-30 inline-flex items-center justify-center min-w-[20px] px-1 h-[18px] rounded-[3px] text-[10px] font-black shadow-sm transition-all hover:scale-110 active:scale-95 select-none ${buttonColorClass}`}
          >
            {isAnd ? '且' : '或'}
          </button>
        </div>

        {/* Children List */}
        <div className="flex flex-col gap-3">
          {group.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="flex-1">
                {child.type === 'item' ? (
                  <ConditionItem condition={child} />
                ) : (
                  <GroupNode 
                    group={child} 
                    depth={depth + 1} 
                    style={style}
                    onToggle={onToggle} 
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConditionItem: React.FC<{ condition: Condition }> = ({ condition }) => {
  return (
    <div className="bg-transparent border border-transparent rounded transition-all flex flex-col relative group/card hover:bg-slate-50/50">
      
      {/* Action Dropdown Trigger - Icon Always Visible */}
      <div className="absolute top-2 right-2 z-40 group/actions">
        <div className="p-1 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer">
          <MoreVertical size={14} />
        </div>
        
        {/* Menu Items: 添加组内条件, 添加组外条件, 转换为子组并添加条件, 删除 */}
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-100 rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-hover/actions:opacity-100 group-hover/actions:pointer-events-auto transition-all scale-95 group-hover/actions:scale-100 origin-top-right z-50 overflow-hidden">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left">
            <PlusCircle size={12} className="shrink-0 text-slate-400" />
            <span>添加组内条件</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left">
            <ArrowRightCircle size={12} className="shrink-0 text-slate-400" />
            <span>添加组外条件</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left">
            <Layers size={12} className="shrink-0 text-slate-400" />
            <span>转换为子组并添加条件</span>
          </button>
          <div className="my-1 border-t border-slate-50" />
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-left">
            <Trash2 size={12} className="shrink-0" />
            <span>删除</span>
          </button>
        </div>
      </div>

      {/* Row 1: Field Selection & Operator */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {/* Field Selection */}
        <div className="flex-1 min-w-0 h-7 flex items-center px-2 bg-slate-100/40 border border-slate-200/50 rounded text-[11px] font-bold text-slate-600 truncate cursor-pointer hover:border-indigo-300 hover:bg-white transition-all group/field">
          <span className="truncate">{condition.field}</span>
          <ChevronDown size={10} className="ml-auto text-slate-300 group-hover/field:text-indigo-500" />
        </div>

        {/* Operator Select - Narrowed to 60% (~72px) */}
        <div className="shrink-0 min-w-[72px] h-7 flex items-center justify-between px-2 border border-slate-200/50 rounded text-[11px] font-bold text-indigo-500 bg-white hover:border-indigo-300 transition-all cursor-pointer group/op">
          <span className="truncate mr-1">{condition.operator}</span>
          <ChevronDown size={10} className="text-indigo-300 group-hover/op:text-indigo-500 shrink-0" />
        </div>
        
        {/* Placeholder for menu icon */}
        <div className="w-6 shrink-0" />
      </div>

      {/* Row 2: Value Input */}
      <div className="px-3 pb-3">
        <div className="relative flex items-center">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none z-10">
            {condition.isFx ? (
              <FunctionSquare size={12} className="text-indigo-400 bg-indigo-50/50 rounded-[2px]" strokeWidth={2.5} />
            ) : (
              <Type size={12} className="text-slate-300" strokeWidth={2.5} />
            )}
            <div className="w-[1px] h-3 bg-slate-200" />
          </div>
          <input 
            type="text" 
            placeholder="输入匹配值..."
            defaultValue={condition.value}
            className="w-full text-[11px] pl-10 pr-3 py-1.5 rounded border border-slate-200/50 bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 text-slate-600 font-medium"
          />
        </div>
      </div>
    </div>
  );
};

export default RowFilter;
