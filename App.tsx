
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Settings2, 
  Database, 
  Plus, 
  HelpCircle,
  Zap,
  LayoutGrid,
  List,
  Filter,
  Network,
  GripVertical
} from 'lucide-react';
import TransformTable from './components/TransformTable';
import TransformCardView from './components/TransformCardView';
import RowFilter from './components/RowFilter';
import RowFilterTree from './components/RowFilterTree';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState('row_filter');
  const [containerWidth, setContainerWidth] = useState(350);
  const isResizing = useRef(false);

  const steps = [
    { id: 'row_filter', label: '行过滤-分组', icon: <Filter size={16} className="text-blue-500" /> },
    { id: 'row_filter_tree', label: '行过滤-树形', icon: <Network size={16} className="text-emerald-500" /> },
    { id: 'ds_transform1', label: '列类型转换-列表', icon: <List size={16} className="text-indigo-500" /> },
    { id: 'ds_transform_card', label: '列类型转换-卡片', icon: <LayoutGrid size={16} className="text-indigo-500" /> },
  ];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX - 256; // 256 is sidebar width
    if (newWidth > 300 && newWidth < 1200) {
      setContainerWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const renderContent = () => {
    switch (activeStep) {
      case 'row_filter':
        return <RowFilter />;
      case 'row_filter_tree':
        return <RowFilterTree />;
      case 'ds_transform1':
        return <TransformTable />;
      case 'ds_transform_card':
        return <TransformCardView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-[13px] select-none">
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">DM</div>
          <span className="font-semibold text-slate-700">数据集成工作台</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <HelpCircle size={18} className="cursor-pointer hover:text-slate-800" />
          <Settings2 size={18} className="cursor-pointer hover:text-slate-800" />
        </div>
      </header>

      <div className="flex flex-1 pt-12 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-600 uppercase">数据流配置</h3>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-l-4 ${
                  activeStep === step.id 
                  ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
                }`}
              >
                {step.icon}
                <span className="truncate">{step.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Resizable Main Content Area */}
        <main className="flex-1 relative overflow-auto bg-slate-50/50 p-4">
          <div 
            className="relative flex flex-col transition-shadow group"
            style={{ width: `${containerWidth}px` }}
          >
            {/* The actual content box - no forced background, let component cards decide */}
            <div className="flex-1 rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden">
              {renderContent()}
            </div>

            {/* Drag Handle */}
            <div 
              onMouseDown={handleMouseDown}
              className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center group/handle z-20"
            >
              <div className="w-1 h-12 bg-slate-300 rounded-full group-hover/handle:bg-indigo-400 group-hover/handle:w-1.5 transition-all opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
