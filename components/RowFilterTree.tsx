
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Type, 
  FunctionSquare, 
  PlusCircle,
  Copy,
  GripVertical,
  FolderTree,
  Filter,
  MoreHorizontal
} from 'lucide-react';

type Conjunction = 'AND' | 'OR';

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
  isExpanded?: boolean;
  children: (Condition | Group)[];
}

const RowFilterTree: React.FC = () => {
  const [rootGroup, setRootGroup] = useState<Group>({
    id: 'root',
    type: 'group',
    conjunction: 'AND',
    isExpanded: true,
    children: [
      {
        id: 'g1',
        type: 'group',
        conjunction: 'OR',
        isExpanded: true,
        children: [
          { id: 'c1', type: 'item', field: 'platform_code', operator: 'IN', value: "['amazon','ebay']", isFx: true },
          { id: 'c2', type: 'item', field: 'warehouse_region', operator: 'EQ', value: 'US-West', isFx: false },
        ]
      },
      {
        id: 'g2',
        type: 'group',
        conjunction: 'AND',
        isExpanded: true,
        children: [
          { id: 'c3', type: 'item', field: 'total_price', operator: 'GT', value: '100.00', isFx: false },
          {
            id: 'g2-1',
            type: 'group',
            conjunction: 'OR',
            isExpanded: true,
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

  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    const update = (g: Group): Group => {
      if (g.id === groupId) return { ...g, ...updates };
      return { ...g, children: g.children.map(c => c.type === 'group' ? update(c) : c) };
    };
    setRootGroup(update(rootGroup));
  };

  const toggleExpand = (groupId: string, currentState: boolean) => {
    updateGroup(groupId, { isExpanded: !currentState });
  };

  const toggleConjunction = (groupId: string, current: Conjunction) => {
    updateGroup(groupId, { conjunction: current === 'AND' ? 'OR' : 'AND' });
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-emerald-500 rounded text-white">
            <FolderTree size={14} />
          </div>
          <div>
            <h2 className="text-[12px] font-bold text-slate-800">树形结构过滤</h2>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Nested Tree View Mode</p>
          </div>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
          <Plus size={12} />
          添加顶层条件
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-white">
        <div className="max-w-[700px] mx-auto">
          <TreeNode 
            node={rootGroup} 
            depth={0} 
            isLast={true}
            onToggleExpand={toggleExpand}
            onToggleConjunction={toggleConjunction}
          />
        </div>
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Filter size={10} />
          层级深度: 3
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">重置</button>
          <button className="px-5 py-1.5 text-[11px] font-bold bg-emerald-600 text-white rounded-md shadow-md hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest">保存树形配置</button>
        </div>
      </div>
    </div>
  );
};

interface TreeNodeProps {
  node: Group | Condition;
  depth: number;
  isLast: boolean;
  onToggleExpand: (id: string, current: boolean) => void;
  onToggleConjunction: (id: string, current: Conjunction) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, isLast, onToggleExpand, onToggleConjunction }) => {
  if (node.type === 'item') {
    return <ConditionCard condition={node} depth={depth} isLast={isLast} />;
  }

  const isAnd = node.conjunction === 'AND';
  const colorClass = isAnd ? 'text-orange-600' : 'text-teal-600';
  const bgColorClass = isAnd ? 'bg-orange-50/50 border-orange-100' : 'bg-teal-50/50 border-teal-100';

  return (
    <div className="relative">
      {/* Group Header */}
      <div className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors hover:bg-slate-50 mb-1 ${depth === 0 ? 'bg-slate-50 border border-slate-100' : ''}`}>
        <button 
          onClick={() => onToggleExpand(node.id, node.isExpanded ?? false)}
          className="text-slate-400 hover:text-slate-600 transition-transform"
          style={{ transform: node.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <ChevronRight size={14} />
        </button>
        
        <button 
          onClick={() => onToggleConjunction(node.id, node.conjunction)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-black border select-none transition-all hover:scale-105 active:scale-95 ${isAnd ? 'bg-orange-500 text-white border-orange-600' : 'bg-teal-500 text-white border-teal-600'}`}
        >
          {isAnd ? '且' : '或'}
        </button>

        <span className="text-[11px] font-bold text-slate-600">
          逻辑组 <span className="text-[10px] font-medium text-slate-400">({node.children.length})</span>
        </span>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
           <button className="p-1 text-slate-400 hover:text-indigo-600"><Plus size={12} /></button>
           <button className="p-1 text-slate-400 hover:text-slate-600"><MoreHorizontal size={12} /></button>
        </div>
      </div>

      {/* Children Container with Indentation and Guide Lines */}
      {node.isExpanded && (
        <div className="ml-[13px] border-l border-slate-200 pl-4 py-1 flex flex-col gap-3 transition-all animate-in fade-in duration-300">
          {node.children.map((child, idx) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              isLast={idx === node.children.length - 1}
              onToggleExpand={onToggleExpand}
              onToggleConjunction={onToggleConjunction}
            />
          ))}
          
          {/* Inline Add Button for the group */}
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 hover:text-indigo-600 transition-colors py-1">
            <PlusCircle size={12} />
            <span>添加子条件</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ConditionCard: React.FC<{ condition: Condition; depth: number; isLast: boolean }> = ({ condition, depth, isLast }) => {
  return (
    <div className="relative group/card">
      {/* Horizontal Connector Line for the tree view */}
      <div className="absolute -left-4 top-5 w-4 h-[1px] bg-slate-200"></div>
      
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden relative group-hover/card:border-indigo-200">
        
        {/* Row 1: Field & Actions */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-50 bg-slate-50/20">
          <GripVertical size={12} className="text-slate-300 shrink-0 cursor-grab group-hover/card:text-slate-400" />
          
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-700 truncate hover:text-indigo-600 transition-colors cursor-pointer">
              {condition.field}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
             <div className="text-[9px] font-black text-indigo-500 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50 uppercase cursor-pointer hover:bg-indigo-100 transition-all">
               {condition.operator}
             </div>
             
             <div className="flex gap-0 opacity-0 group-hover/card:opacity-100 transition-all ml-1">
              <button className="p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"><Copy size={11} /></button>
              <button className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-colors"><Trash2 size={11} /></button>
            </div>
          </div>
        </div>

        {/* Row 2: Value */}
        <div className="px-2.5 py-1.5 flex items-center gap-2">
          <div className="relative flex-1 group/input">
            <div className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 ${condition.isFx ? 'text-indigo-500' : 'text-slate-300'}`}>
              {condition.isFx ? <FunctionSquare size={10} strokeWidth={2.5} /> : <Type size={10} strokeWidth={2.5} />}
            </div>
            <input 
              type="text" 
              value={condition.value}
              readOnly
              className={`w-full text-[10px] pl-6 pr-2 py-1 rounded border outline-none transition-all ${
                condition.isFx 
                ? 'bg-indigo-50/20 border-indigo-50 font-mono text-indigo-700' 
                : 'bg-slate-50/30 border-slate-100 font-semibold text-slate-600'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowFilterTree;
