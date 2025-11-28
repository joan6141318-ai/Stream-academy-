import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Layers, Image, Type, Save, Layout, ChevronRight, Edit3, Upload, ArrowLeft } from 'lucide-react';
import { TRAINING_MODULES } from '../constants';

// Datos iniciales de Banners (mismos que en Profile.tsx para consistencia)
const INITIAL_BANNERS = [
    {
      id: 'banner-5',
      title: "JUEGA DIVIÉRTETE Y APRENDE",
      subtitle: "Juega y diviértete mientras mejoras tus habilidades.",
      imageUrl: "https://picsum.photos/1080/430?random=banner5",
      tag: "GAMING"
    },
    {
      id: 'banner-1',
      title: "TORNEO PK INTER-AGENCIAS",
      subtitle: "Participa este fin de semana y gana bonos dobles.",
      imageUrl: "https://picsum.photos/1080/430?random=banner1",
      tag: "NUEVO"
    },
    {
      id: 'banner-2',
      title: "BONO CRECIENTE ACTIVADO",
      subtitle: "Completa 40 horas y recibe +$50 USD extra.",
      imageUrl: "https://picsum.photos/1080/430?random=banner2",
      tag: "RECOMPENSA"
    },
    {
      id: 'banner-3',
      title: "TALLER DE ILUMINACIÓN",
      subtitle: "Mejora la calidad de tu stream hoy mismo.",
      imageUrl: "https://picsum.photos/1080/430?random=banner3",
      tag: "MASTERCLASS"
    },
    {
      id: 'banner-4',
      title: "TOP 10 EMISORES DEL MES",
      subtitle: "Consulta la tabla de posiciones actualizada.",
      imageUrl: "https://picsum.photos/1080/430?random=banner4",
      tag: "RANKING"
    }
];

const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [activeCategory, setActiveCategory] = useState<'banners' | 'modules' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local Data State (Simulando Base de Datos)
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [modules, setModules] = useState(TRAINING_MODULES);

  // --- HANDLERS ---

  const handleBack = () => {
    if (editingItem) {
        setEditingItem(null);
    } else if (activeCategory) {
        setActiveCategory(null);
    } else {
        navigate('/admin/selection');
    }
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                // Actualiza la vista previa con la imagen base64
                setEditingItem({
                    ...editingItem,
                    imageUrl: event.target.result as string
                });
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simular guardado en "Base de Datos"
    setTimeout(() => {
        if (activeCategory === 'banners') {
            setBanners(prev => prev.map(b => b.id === editingItem.id ? editingItem : b));
        } else if (activeCategory === 'modules') {
            setModules(prev => prev.map(m => m.id === editingItem.id ? editingItem : m));
        }
        
        setIsSaving(false);
        setEditingItem(null); // Regresar a la lista
        // Opcional: Podríamos mostrar un toast aquí
    }, 800);
  };

  // --- RENDER HELPERS ---

  const renderCategoryList = () => (
    <div className="grid grid-cols-1 gap-4 animate-fade-in">
        <button 
            onClick={() => setActiveCategory('banners')}
            className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                    <Image size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Banners de Inicio
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        {banners.length} elementos activos
                    </p>
                </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
        </button>

        <button 
            onClick={() => setActiveCategory('modules')}
            className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                    <Layers size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Módulos de Capacitación
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        {modules.length} módulos disponibles
                    </p>
                </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
        </button>

        {/* Placeholder Categories */}
        <div className="opacity-50 pointer-events-none">
            <div className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 dark:bg-white/10 p-3 rounded-lg text-gray-500">
                        <Type size={24} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                            Textos Legales
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderItemList = () => {
    const items = activeCategory === 'banners' ? banners : modules;
    
    return (
        <div className="animate-slide-up space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">
                    {activeCategory === 'banners' ? 'Editando Banners' : 'Editando Módulos'}
                </h2>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500 uppercase">
                    {items.length} Items
                </span>
            </div>

            {items.map((item: any) => (
                <button 
                    key={item.id}
                    onClick={() => setEditingItem(item)}
                    className="w-full bg-white dark:bg-brand-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center space-x-4 active:scale-[0.99] transition-all text-left group"
                >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-white/10 overflow-hidden flex-shrink-0 relative">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                             <Edit3 size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-brand-black dark:text-white uppercase truncate mb-1">
                            {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-2">
                            {item.subtitle || item.description || 'Sin descripción'}
                        </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                </button>
            ))}
        </div>
    );
  };

  const renderEditor = () => (
    <div className="animate-slide-up space-y-6">
         {/* Preview Visual */}
         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-lg border border-gray-100 dark:border-white/5">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Vista Previa</label>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group">
                <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover transition-opacity duration-300" />
                
                {/* Overlay on hover/action */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={openGallery}>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform hover:scale-110 transition-transform">
                        <Image size={24} />
                    </div>
                    <span className="absolute bottom-4 text-white text-[10px] font-black uppercase tracking-widest">Cambiar Imagen</span>
                </div>

                {/* Info Overlay (Simulated) */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg max-w-[80%]">
                         <h3 className="text-white font-black uppercase text-sm leading-none mb-1">{editingItem.title}</h3>
                         <p className="text-white/80 text-[10px] font-bold line-clamp-2">{editingItem.subtitle || editingItem.description}</p>
                    </div>
                </div>
            </div>
         </div>

         {/* Form Inputs */}
         <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-white/5 space-y-5">
            
            {/* Title */}
            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Título</label>
                <input 
                    type="text" 
                    value={editingItem.title} 
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white focus:border-brand-purple outline-none"
                />
            </div>
            
            {/* Subtitle / Description */}
            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">
                    {activeCategory === 'banners' ? 'Subtítulo' : 'Descripción'}
                </label>
                <textarea 
                    value={editingItem.subtitle || editingItem.description || ''} 
                    onChange={(e) => {
                        const key = activeCategory === 'banners' ? 'subtitle' : 'description';
                        setEditingItem({...editingItem, [key]: e.target.value});
                    }}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium dark:text-white focus:border-brand-purple outline-none resize-none"
                />
            </div>

            {/* Image URL & Gallery Button */}
            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Imagen</label>
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={editingItem.imageUrl} 
                            onChange={(e) => setEditingItem({...editingItem, imageUrl: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 pr-10 text-xs font-mono dark:text-white focus:border-brand-purple outline-none truncate"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <span className="text-[8px] font-bold uppercase">URL</span>
                        </div>
                    </div>
                    {/* GALLERY BUTTON */}
                    <button 
                        onClick={openGallery}
                        className="bg-brand-purple text-white px-4 rounded-lg hover:bg-purple-700 active:scale-95 transition-all shadow-md flex items-center justify-center"
                        title="Abrir Galería"
                    >
                        <Image size={20} />
                    </button>
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                <p className="text-[9px] text-gray-400 mt-2 ml-1">
                    * Puedes pegar una URL externa o usar el botón para subir desde tu dispositivo.
                </p>
            </div>

            {/* Save Button */}
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4"
            >
                {isSaving ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Save size={16} className="mr-2" />
                        Guardar Cambios
                    </>
                )}
            </button>
         </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Dynamic Header */}
      <Header 
        title={editingItem ? 'Editar Item' : (activeCategory === 'banners' ? 'Banners' : (activeCategory === 'modules' ? 'Módulos' : 'Modo Editor'))} 
        showBack 
        onBack={handleBack} 
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pb-24">
        
        {/* Intro only on Main Menu */}
        {!activeCategory && !editingItem && (
            <div className="mt-6 mb-8 px-2">
                <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full mb-3">
                    <Layout size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-wide">CMS Visual</span>
                </div>
                <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight mb-2">
                    Gestor de<br/>Contenido
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Edita la estructura visual de la aplicación en tiempo real.
                </p>
            </div>
        )}

        {/* --- NAVIGATION RENDER LOGIC --- */}
        {!activeCategory && !editingItem && renderCategoryList()}
        
        {activeCategory && !editingItem && renderItemList()}
        
        {editingItem && renderEditor()}

      </div>
    </div>
  );
};

export default EditorDashboard;