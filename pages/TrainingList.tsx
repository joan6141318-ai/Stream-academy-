import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useContent } from '../context/ContentContext';

const TrainingList: React.FC = () => {
  const navigate = useNavigate();
  const { modules, loading } = useContent();

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <Header title="Secciones" />
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
        <div className="space-y-1">
        {loading ? (
             [1,2,3].map(i => (
                 <div key={i} className="h-28 w-full bg-gray-50 dark:bg-white/5 animate-pulse border-b border-gray-100 dark:border-white/10"></div>
             ))
        ) : modules.map((module) => (
          <div 
            key={module.id}
            onClick={() => navigate(`/training/${module.id}`)}
            className="bg-white dark:bg-brand-dark-card overflow-hidden active:bg-gray-50 dark:active:bg-white/5 transition-colors cursor-pointer group flex flex-row h-28 w-full border-b border-gray-100 dark:border-white/10"
          >
            {/* Image Area - Left Side */}
            <div className="w-32 h-full relative flex-shrink-0">
              <img 
                src={module.imageUrl} 
                alt={module.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-active:bg-black/20 transition-colors">
                  {/* Overlay */}
              </div>
            </div>

            {/* Content Area - Right Side */}
            <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
              <h3 className="text-sm font-black text-brand-black dark:text-white uppercase leading-tight mb-1 truncate">{module.title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{module.description}</p>
              <div className="mt-2 flex items-center text-[10px] font-bold text-brand-purple uppercase tracking-wider">
                 <span>Ver módulo</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingList;