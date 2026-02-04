
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Type, 
  FunctionSquare, 
  MoreHorizontal,
  PlusCircle,
  Copy,
  Settings2,
  ChevronRight,
  GripVertical,
  LayoutList,
  Network
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
          { id: 'c1', type: 'item', field: 'platform_code', operator: 'IN', value: "['amazon','ebay']", isFx: true },
          { id: 'c2', type: 'item', field: 'warehouse_region', operator: 'EQ', value: 'US-West', isFx: false },
        ]
      },
      {
        id: 'g2',
        type: 'group',
        conjunction: 'AND',
        children: [
          { id: 'c3', type: 'item', field: 'total_price', operator: 'GT', value: '100.00', isFx: false },
          {
            id: 'g2-1',
            type: 'group',
            conjunction: 'OR',
            children: [
              { id: 'c4', type: 'item', field: 'shipping_tag', operator: 'EQ', value: 'Express', isFx: false },
              { id: 'c5', type: 'item', field: 'is_premium', operator: 'EQ', value: 'true', isFx: true }
            ]
          }
        ]
      },
      { id: 'c6', type: 'item', field: 'order_status', operator: 'NOT_IN', value: "['CANCELLED']", isFx: false }
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
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      {/* Header - Compact */}
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <h2 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <div className={`w-1 h-3 rounded-full ${activeStyle === 'spine' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
          高级过滤
        </h2>
        
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button 
            onClick={() => setActiveStyle('spine')}
            className={`p-1 rounded text-[10px] transition-all ${activeStyle === 'spine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            <LayoutList size={12} />
          </button>
          <button 
            onClick={() => setActiveStyle('tree')}
            className={`p-1 rounded text-[10px] transition-all ${activeStyle === 'tree' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Network size={12} />
          </button>
        </div>
      </div>

      {/* Main Builder Area - Reduced Padding */}
      <div className={`flex-1 overflow-auto p-2 transition-colors ${activeStyle === 'spine' ? 'bg-slate-50/10' : 'bg-white'}`}>
        <div className="w-full mx-auto">
          <GroupNode 
            group={rootGroup} 
            depth={0} 
            style={activeStyle}
            onToggle={toggleConjunction} 
          />
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="p-2 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">MAX_DEPTH: 3</span>
        <div className="flex gap-1.5">
          <button className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600">取消</button>
          <button className="px-3 py-1 text-[10px] font-bold bg-slate-900 text-white rounded shadow-sm hover:bg-black transition-all active:scale-95 uppercase tracking-wider">保存</button>
        </div>
      </div>
    </div>
  );
};

const GroupNode: React.FC<{ group: Group; depth: number; style: UIStyle; onToggle: (id: string) => void }> = ({ group, depth, style, onToggle }) => {
  const isAnd = group.conjunction === 'AND';
  
  const colors = isAnd 
    ? { 
        accent: 'bg-orange-500',
        pill: 'bg-orange-500 text-white border-orange-600'
      } 
    : { 
        accent: 'bg-teal-500',
        pill: 'bg-teal-500 text-white border-teal-600'
      };

  const railColor = 'bg-slate-200';
  // Narrowed indentation to save horizontal space (from 10 to 7)
  const indentClass = depth > 0 ? 'mt-3 ml-7' : 'ml-4';
  const railOffset = '-left-7';

  return (
    <div className={`relative ${indentClass}`}>
      <div className="relative">
        {/* Rail container */}
        <div className={`absolute ${railOffset} top-0 bottom-0 flex items-center justify-center w-5`}>
          <div className={`w-[1.5px] ${railColor} absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-50 shadow-sm`}></div>
          
          <button 
            onClick={() => onToggle(group.id)}
            className={`z-20 inline-flex items-center justify-center min-w-[20px] px-1 h-[16px] rounded text-[9px] font-black border shadow-sm transition-all hover:scale-110 active:scale-90 select-none ${colors.pill}`}
          >
            {isAnd ? '且' : '或'}
          </button>
        </div>

        {/* Children List - Tight Gap */}
        <div className="flex flex-col gap-2.5">
          {group.children.map((child) => (
            <div key={child.id} className="relative group/item flex items-start">
              <div className="flex-1 min-w-0">
                {child.type === 'item' ? (
                  <ConditionItem condition={child} style={style} accentColor={colors.accent} />
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

      {/* Action Button */}
      <div className="relative flex items-center gap-1 py-1 mt-2">
         <div className={`absolute ${railOffset} top-1/2 w-3 h-[1px] bg-slate-100 opacity-60`}></div>
         <button className="flex items-center gap-1 text-[9px] font-bold text-slate-300 hover:text-indigo-600 transition-colors ml-[-2px] bg-white px-1 py-0.5 rounded border border-transparent hover:border-slate-100">
           <PlusCircle size={10} />
           <span>添加</span>
         </button>
      </div>
    </div>
  );
};

const ConditionItem: React.FC<{ condition: Condition; style: UIStyle; accentColor: string }> = ({ condition, style, accentColor }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-md shadow-sm hover:border-slate-300 transition-all flex flex-col overflow-hidden group/card relative ${style === 'spine' ? 'hover:shadow-indigo-500/5' : 'hover:shadow-md'}`}>
      
      {/* Side Color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentColor} opacity-40 group-hover/card:opacity-100 transition-opacity`}></div>

      {/* Row 1: Field Selection & Op - Compressed */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-slate-50 bg-slate-50/20">
        <GripVertical size={10} className="text-slate-300 shrink-0 cursor-grab group-hover/card:text-slate-400" />
        
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-slate-700 truncate px-0.5 rounded hover:bg-white transition-colors cursor-pointer leading-tight">
            {condition.field}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
           <div className="text-[8px] font-black text-indigo-500 bg-indigo-50/50 px-1 py-0 rounded border border-indigo-100/50 uppercase cursor-pointer hover:bg-indigo-100 transition-all">
             {condition.operator}
           </div>
           
           <div className="flex gap-0 opacity-0 group-hover/card:opacity-100 transition-all">
            <button className="p-0.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded transition-colors"><Copy size={10} /></button>
            <button className="p-0.5 text-slate-300 hover:text-red-500 hover:bg-white rounded transition-colors"><Trash2 size={10} /></button>
          </div>
        </div>
      </div>

      {/* Row 2: Value Input - Compact */}
      <div className="px-2 py-1.5 flex items-center gap-1.5">
        <div className="relative flex-1 group/input min-w-0">
          <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 ${condition.isFx ? 'text-indigo-500' : 'text-slate-300'}`}>
            {condition.isFx ? <FunctionSquare size={10} strokeWidth={2.5} /> : <Type size={10} strokeWidth={2.5} />}
          </div>
          <input 
            type="text" 
            value={condition.value}
            readOnly
            className={`w-full text-[9px] pl-5 pr-2 py-1 rounded-md border outline-none transition-all truncate ${
              condition.isFx 
              ? 'bg-indigo-50/10 border-indigo-50 font-mono text-indigo-700' 
              : 'bg-slate-50/30 border-slate-100 font-semibold text-slate-600 focus:border-indigo-300 shadow-inner'
            }`}
          />
        </div>
        <button className="shrink-0 p-0.5 hover:bg-slate-50 rounded text-slate-200 hover:text-slate-400">
           <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default RowFilter;
