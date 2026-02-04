
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

type FilterNode = Condition | Group;

const RowFilter: React.FC = () => {
  const [activeStyle, setActiveStyle] = useState<UIStyle>('spine');
  
  const [root, setRoot] = useState<FilterNode>({
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
      }
    ]
  });

  const totalConditionCount = useMemo(() => {
    const countItems = (node: FilterNode): number => {
      if (node.type === 'item') return 1;
      return node.children.reduce((acc, child) => acc + countItems(child), 0);
    };
    return countItems(root);
  }, [root]);

  const createNewCondition = (): Condition => ({
    id: 'c_' + Math.random().toString(36).substr(2, 9),
    type: 'item',
    field: 'new_field',
    operator: '等于',
    value: '',
    isFx: false
  });

  const createNewGroup = (children: FilterNode[] = []): Group => ({
    id: 'g_' + Math.random().toString(36).substr(2, 9),
    type: 'group',
    conjunction: 'AND',
    children
  });

  const toggleConjunction = (groupId: string) => {
    const update = (node: FilterNode): FilterNode => {
      if (node.type === 'group') {
        if (node.id === groupId) return { ...node, conjunction: node.conjunction === 'AND' ? 'OR' : 'AND' };
        return { ...node, children: node.children.map(update) };
      }
      return node;
    };
    setRoot(update(root));
  };

  const flatten = (node: FilterNode): FilterNode | null => {
    if (node.type === 'item') return node;

    const processedChildren = node.children
      .map(flatten)
      .filter((c): c is FilterNode => c !== null);
    
    if (processedChildren.length === 0) return null;
    if (processedChildren.length === 1) return processedChildren[0];

    return { ...node, children: processedChildren };
  };

  const handleAction = (targetId: string, action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => {
    const performUpdate = (node: FilterNode): FilterNode | null => {
      if (node.type === 'item') {
        if (node.id === targetId && action === 'delete') return null;
        return node;
      }

      const idx = node.children.findIndex(c => c.id === targetId);
      if (idx !== -1) {
        const newChildren = [...node.children];
        const target = node.children[idx];

        if (action === 'add_in') {
          newChildren.splice(idx + 1, 0, createNewCondition());
          return { ...node, children: newChildren };
        }
        if (action === 'delete') {
          newChildren.splice(idx, 1);
          return newChildren.length === 0 ? null : { ...node, children: newChildren };
        }
        if (action === 'to_sub') {
          const sub = createNewGroup([target, createNewCondition()]);
          newChildren[idx] = sub;
          return { ...node, children: newChildren };
        }
      }

      let changed = false;
      const nextChildren = node.children.map(child => {
        const updatedChild = performUpdate(child);
        if (updatedChild !== child) {
          changed = true;
          return updatedChild;
        }
        return child;
      }).filter((c): c is FilterNode => c !== null);

      if (action === 'add_out') {
        const childIdx = node.children.findIndex(child => 
          child.type === 'group' && child.children.some(c => c.id === targetId)
        );
        if (childIdx !== -1) {
          const resultChildren = [...nextChildren];
          resultChildren.splice(childIdx + 1, 0, createNewCondition());
          return { ...node, children: resultChildren };
        }
      }

      if (changed) {
        return nextChildren.length === 0 ? null : { ...node, children: nextChildren };
      }

      return node;
    };

    const updatedRoot = performUpdate(root);
    if (!updatedRoot) {
      setRoot(createNewGroup([createNewCondition()]));
    } else {
      const flattenedRoot = flatten(updatedRoot);
      setRoot(flattenedRoot || createNewGroup([createNewCondition()]));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden text-slate-900">
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3 rounded-full bg-indigo-500"></div>
          <h2 className="text-[11px] font-bold text-slate-700">条件过滤 (动态溶解)</h2>
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

      <div className="flex-1 overflow-auto p-6 bg-white transition-colors">
        <div className="max-w-[600px]">
          {root.type === 'item' ? (
            <div className="ml-4">
              <ConditionItem 
                condition={root} 
                isOnly={true} 
                depth={0} 
                onAction={(action) => handleAction(root.id, action)} 
              />
            </div>
          ) : (
            <GroupNode 
              group={root} 
              depth={0} 
              style={activeStyle}
              onToggle={toggleConjunction} 
              onAction={handleAction}
              totalConditions={totalConditionCount}
            />
          )}
        </div>
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-slate-400 font-medium">
          已配置条件: {totalConditionCount}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setRoot(createNewGroup([createNewCondition()]))}
            className="px-4 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            清空
          </button>
          <button className="px-5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 transition-all">
            同步配置
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
  const buttonColorClass = isAnd ? 'bg-orange-500 border-orange-600' : 'bg-teal-500 border-teal-600';

  const indentClass = depth > 0 ? 'mt-4 ml-8' : 'ml-4';
  const railOffset = '-left-8';

  return (
    <div className={`relative ${indentClass}`}>
      <div className="relative">
        <div className={`absolute ${railOffset} top-0 bottom-0 flex items-center justify-center w-6`}>
          <div className={`w-[2px] ${railColorClass} absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30`}></div>
          <button 
            onClick={() => onToggle(group.id)}
            className={`z-30 inline-flex items-center justify-center min-w-[20px] px-1.5 h-[18px] rounded-[3px] text-[10px] font-black shadow-sm text-white transition-all hover:scale-110 active:scale-95 select-none border ${buttonColorClass}`}
          >
            {isAnd ? '且' : '或'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {group.children.map((child) => (
            <div key={child.id} className="relative">
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
  const disableAddOut = isOnly || depth === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMenuClick = (action: 'add_in' | 'add_out' | 'to_sub' | 'delete') => {
    onAction(action);
    setMenuOpen(false);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-sm hover:border-indigo-100/80 transition-all flex flex-col group/card">
      {/* 第一行: 字段选择 + 操作符 (腾出空间) */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex-1 min-w-0 h-7 flex items-center px-2 bg-slate-50 border border-slate-100 rounded text-[11px] font-bold text-slate-600 truncate cursor-pointer hover:border-indigo-200 transition-all group/field">
          <span className="truncate">{condition.field}</span>
          <ChevronDown size={10} className="ml-auto text-slate-300 group-hover/field:text-indigo-400" />
        </div>

        <div className="shrink-0 min-w-[70px] h-7 flex items-center justify-between px-2 border border-indigo-50 rounded text-[11px] font-bold text-indigo-500 bg-indigo-50/20 hover:border-indigo-300 transition-all cursor-pointer group/op">
          <span className="truncate">{condition.operator}</span>
          <ChevronDown size={10} className="text-indigo-300 ml-1 shrink-0 group-hover/op:text-indigo-500" />
        </div>
      </div>

      {/* 第二行: 值输入框 + 更多操作按钮 (移至此处) */}
      <div className="px-3 pb-3 flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none z-10">
            {condition.isFx ? <FunctionSquare size={12} className="text-indigo-400" /> : <Type size={12} className="text-slate-300" />}
            <div className="w-[1px] h-3 bg-slate-200" />
          </div>
          <input 
            type="text" 
            placeholder="输入匹配值..."
            defaultValue={condition.value}
            className="w-full text-[11px] pl-10 pr-3 py-1.5 rounded border border-slate-100 bg-slate-50/30 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-medium text-slate-600"
          />
        </div>

        {/* More Menu Button - Moved to Row 2 end */}
        <div className="shrink-0 relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${menuOpen ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50 border border-transparent'}`}
          >
            <MoreVertical size={14} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-100 rounded-lg shadow-xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <MenuOption icon={<PlusCircle size={12}/>} label="添加组内条件" onClick={() => handleMenuClick('add_in')} />
              <MenuOption icon={<ArrowRightCircle size={12}/>} label="添加组外条件" onClick={() => handleMenuClick('add_out')} disabled={disableAddOut} />
              <MenuOption icon={<Layers size={12}/>} label="转换为子组" onClick={() => handleMenuClick('to_sub')} />
              <div className="my-1 border-t border-slate-50" />
              <MenuOption icon={<Trash2 size={12}/>} label="删除" onClick={() => handleMenuClick('delete')} variant="danger" disabled={isOnly} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuOption: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; variant?: 'default' | 'danger' }> = ({ icon, label, onClick, disabled, variant = 'default' }) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-left transition-colors ${
      disabled 
      ? 'text-slate-200 cursor-not-allowed' 
      : variant === 'danger' 
        ? 'text-red-400 hover:bg-red-50 hover:text-red-600' 
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    {icon}
    <span>{label}</span>
    {disabled && <Ban size={10} className="ml-auto opacity-50" />}
  </button>
);

export default RowFilter;
