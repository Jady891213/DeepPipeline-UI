
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Type, 
  LayoutList,
  Network,
  FunctionSquare,
  MoreVertical,
  Layers,
  ArrowRightCircle,
  PlusCircle,
  Ban
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

  // Calculate total conditions accurately
  const totalConditionCount = useMemo(() => {
    const countItems = (g: Group): number => {
      let count = 0;
      for (const child of g.children) {
        if (child.type === 'item') count++;
        else count += countItems(child);
      }
      return count;
    };
    return countItems(rootGroup);
  }, [rootGroup]);

  const createNewCondition = (): Condition => ({
    id: 'c_' + Math.random().toString(36).substr(2, 9),
    type: 'item',
    field: 'new_field',
    operator: '等于',
    value: '',
    isFx: false
  });

  const createNewGroup = (children: (Condition | Group)[] = []): Group => ({
    id: 'g_' + Math.random().toString(36).substr(2, 9),
    type: 'group',
    conjunction: 'AND',
    children
  });

  const toggleConjunction = (groupId: string) => {
    const update = (g: Group): Group => {
      if (g.id === groupId) return { ...g, conjunction: g.conjunction === 'AND' ? 'OR' : 'AND' };
      return { ...g, children: g.children.map(c => c.type === 'group' ? update(c) : c) };
    };
    setRootGroup(update(rootGroup));
  };

  /**
   * Recursively flattens any group that has only 1 child.
   */
  const flatten = (node: Group | Condition, isRoot = false): Group | Condition => {
    if (node.type === 'item') return node;

    const newChildren = node.children.map(c => flatten(c, false));
    
    // If not root and only one child remains, promote child
    if (!isRoot && newChildren.length === 1) {
      return newChildren[0];
    }

    return { ...node, children: newChildren };
  };

  const handleAction = (targetId: string, action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => {
    const performUpdate = (g: Group): Group | null => {
      const idx = g.children.findIndex(c => c.id === targetId);
      
      if (idx !== -1) {
        const newChildren = [...g.children];
        const target = g.children[idx];

        if (action === 'add_in') {
          newChildren.splice(idx + 1, 0, createNewCondition());
          return { ...g, children: newChildren };
        }
        if (action === 'delete') {
          newChildren.splice(idx, 1);
          return { ...g, children: newChildren };
        }
        if (action === 'to_sub') {
          const sub = createNewGroup([target, createNewCondition()]);
          newChildren[idx] = sub;
          return { ...g, children: newChildren };
        }
        // add_out logic is handled when we are at the parent level
      }

      // Check for add_out or drill down
      for (let i = 0; i < g.children.length; i++) {
        const child = g.children[i];
        if (child.type === 'group') {
          // Special check for add_out
          const hasTarget = child.children.some(c => c.id === targetId);
          if (hasTarget && action === 'add_out') {
            const newChildren = [...g.children];
            newChildren.splice(i + 1, 0, createNewCondition());
            return { ...g, children: newChildren };
          }

          const updatedChild = performUpdate(child);
          if (updatedChild !== child) {
            const newChildren = [...g.children];
            if (updatedChild === null) newChildren.splice(i, 1);
            else newChildren[i] = updatedChild;
            return { ...g, children: newChildren };
          }
        }
      }
      return g;
    };

    const newRoot = performUpdate(rootGroup);
    if (newRoot) {
      setRootGroup(flatten(newRoot, true) as Group);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden text-slate-900">
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3 rounded-full bg-indigo-500"></div>
          <h2 className="text-[11px] font-bold text-slate-700">行过滤配置 (分组模式)</h2>
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

      <div className={`flex-1 overflow-auto p-6 transition-colors ${activeStyle === 'spine' ? 'bg-white' : 'bg-slate-50/20'}`}>
        <div className="max-w-[600px]">
          <GroupNode 
            group={rootGroup} 
            depth={0} 
            style={activeStyle}
            onToggle={toggleConjunction} 
            onAction={handleAction}
            totalConditions={totalConditionCount}
          />
        </div>
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-slate-400 font-medium tracking-tight">
          活跃条件数: {totalConditionCount}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setRootGroup(createNewGroup([createNewCondition()]))}
            className="px-4 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            重置
          </button>
          <button className="px-5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 transition-all">
            应用配置
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupNode: React.FC<{ 
  group: Group; 
  depth: number; 
  style: UIStyle; 
  onToggle: (id: string) => void;
  onAction: (id: string, action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => void;
  totalConditions: number;
}> = ({ group, depth, style, onToggle, onAction, totalConditions }) => {
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
        <div className={`absolute ${railOffset} top-0 bottom-0 flex items-center justify-center w-6`}>
          <div className={`w-[2px] ${railColorClass} absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30`}></div>
          <button 
            onClick={() => onToggle(group.id)}
            className={`z-30 inline-flex items-center justify-center min-w-[20px] px-1.5 h-[18px] rounded-[3px] text-[10px] font-black shadow-sm transition-all hover:scale-110 active:scale-95 select-none ${buttonColorClass}`}
          >
            {isAnd ? '且' : '或'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {group.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="flex-1">
                {child.type === 'item' ? (
                  <ConditionItem 
                    condition={child} 
                    isOnly={totalConditions <= 1} 
                    depth={depth}
                    onAction={(action) => onAction(child.id, action)} 
                  />
                ) : (
                  <GroupNode 
                    group={child} 
                    depth={depth + 1} 
                    style={style}
                    onToggle={onToggle} 
                    onAction={onAction}
                    totalConditions={totalConditions}
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

const ConditionItem: React.FC<{ 
  condition: Condition; 
  isOnly: boolean; 
  depth: number;
  onAction: (action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => void 
}> = ({ condition, isOnly, depth, onAction }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Disable add_out if at top level (depth 0) OR if it's the only condition
  const disableAddOut = isOnly || depth === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMenuClick = (action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => {
    onAction(action);
    setMenuOpen(false);
  };

  return (
    <div className="bg-transparent border border-transparent rounded transition-all flex flex-col relative group/card hover:bg-slate-50/50 hover:border-indigo-100/50">
      
      {/* More Button */}
      <div className="absolute top-2 right-2 z-40" ref={menuRef}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`p-1 transition-colors ${menuOpen ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-600'}`}
        >
          <MoreVertical size={14} />
        </button>
        
        {/* Dropdown Menu - Includes the requested 4 operations */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-100 rounded-lg shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <button 
              onClick={() => handleMenuClick('add_in')}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group/btn"
            >
              <PlusCircle size={12} className="shrink-0 text-slate-400 group-hover/btn:text-indigo-500" />
              <span>添加组内条件</span>
            </button>
            
            <button 
              disabled={disableAddOut}
              onClick={() => handleMenuClick('add_out')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-left transition-colors group/btn ${disableAddOut ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
            >
              <ArrowRightCircle size={12} className={`shrink-0 ${disableAddOut ? 'text-slate-200' : 'text-slate-400 group-hover/btn:text-indigo-500'}`} />
              <span>添加组外条件</span>
              {disableAddOut && <Ban size={10} className="ml-auto text-slate-200" />}
            </button>
            
            <button 
              onClick={() => handleMenuClick('to_sub')}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group/btn"
            >
              <Layers size={12} className="shrink-0 text-slate-400 group-hover/btn:text-indigo-500" />
              <span>转换为子组并添加条件</span>
            </button>
            
            <div className="my-1 border-t border-slate-50" />
            
            <button 
              disabled={isOnly}
              onClick={() => handleMenuClick('delete')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-left transition-colors ${isOnly ? 'text-slate-200 cursor-not-allowed bg-slate-50/30' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
            >
              <Trash2 size={12} className="shrink-0" />
              <span>删除</span>
              {isOnly && <Ban size={10} className="ml-auto text-slate-200" />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex-1 min-w-0 h-7 flex items-center px-2 bg-slate-100/40 border border-slate-200/50 rounded text-[11px] font-bold text-slate-600 truncate cursor-pointer hover:border-indigo-300 hover:bg-white transition-all group/field">
          <span className="truncate">{condition.field}</span>
          <ChevronDown size={10} className="ml-auto text-slate-300 group-hover/field:text-indigo-500" />
        </div>

        <div className="shrink-0 min-w-[72px] h-7 flex items-center justify-between px-2 border border-slate-200/50 rounded text-[11px] font-bold text-indigo-500 bg-white hover:border-indigo-300 transition-all cursor-pointer group/op">
          <span className="truncate mr-1">{condition.operator}</span>
          <ChevronDown size={10} className="text-indigo-300 group-hover/op:text-indigo-500 shrink-0" />
        </div>
        <div className="w-6 shrink-0" />
      </div>

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
