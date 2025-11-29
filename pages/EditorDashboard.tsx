import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Layers, Image, Type, Save, Layout, ChevronRight, Edit3, Lock, Palette, Type as TypeIcon, Link as LinkIcon, ExternalLink, ArrowUp, ArrowDown, Minus, Eye, X, Smartphone, BellRing, Trophy, TrendingUp, Video, Gamepad2, Star, ShieldCheck, HelpCircle, ChevronLeft } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import * as LucideIcons from 'lucide-react';

const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { banners, modules, updateBanner, updateModule } = useContent();
  
  // --- STATE MANAGEMENT ---
  const [activeCategory, setActiveCategory] = useState<'banners' | 'modules' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false); // Estado para Preview
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Estado local para el input de URL para evitar lag en el tipeo
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar input local cuando cambia el item editado
  useEffect(() => {
    if (editingItem) {
        // Detectar si es banner (image) o módulo (imageUrl)
        const currentImage = activeCategory === 'banners' ? editingItem.image : editingItem.imageUrl;
        setUrlInput(currentImage || '');
    }
  }, [editingItem, activeCategory]);

  // --- HANDLERS ---

  const handleBack = () => {
    if (editingItem) {
        setEditingItem(null);
        setUrlInput('');
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
                const result = event.target.result as string;
                setUrlInput(result); // Actualizar input visual
                
                // Actualizar estado previo para la vista
                if (activeCategory === 'banners') {
                    setEditingItem({ ...editingItem, image: result });
                } else {
                    setEditingItem({ ...editingItem, imageUrl: result });
                }
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrlInput(newUrl);
      
      // Actualización en tiempo real de la vista previa local
      if (activeCategory === 'banners') {
          setEditingItem({ ...editingItem, image: newUrl });
      } else {
          setEditingItem({ ...editingItem, imageUrl: newUrl });
      }
  };

  // Handler para posición de imagen
  const handleImagePosition = (pos: 'object-top' | 'object-center' | 'object-bottom') => {
      if (activeCategory === 'banners') {
          setEditingItem({ ...editingItem, imagePosition: pos });
      } else {
          setEditingItem({ 
              ...editingItem, 
              style: { ...editingItem.style, imagePosition: pos } 
          });
      }
  };

  // Helper para obtener posición actual
  const getCurrentImagePosition = () => {
      if (activeCategory === 'banners') {
          return editingItem.imagePosition || 'object-center';
      } else {
          return editingItem.style?.imagePosition || 'object-center';
      }
  };

  // 1. Trigger Save -> Opens PIN Modal
  const requestSave = () => {
      setShowPinModal(true);
      setPin('');
      setPinError(false);
  };

  // 2. Confirm Save with PIN
  const confirmSave = async () => {
      if (pin !== '3926') {
          setPinError(true);
          return;
      }

      setIsSaving(true);
      setShowPinModal(false);

      try {
          if (activeCategory === 'banners') {
              // Estructura exacta para Banners
              const dataToSave = {
                  title: editingItem.title,
                  subtitle: editingItem.subtitle,
                  image: urlInput, 
                  tag: editingItem.tag,
                  imagePosition: editingItem.imagePosition || 'object-center'
              };
              await updateBanner(String(editingItem.id), dataToSave);
          } else if (activeCategory === 'modules') {
              // Estructura exacta para Módulos
               const dataToSave = {
                  title: editingItem.title,
                  description: editingItem.description,
                  imageUrl: urlInput, 
                  textContent: editingItem.textContent,
                  style: editingItem.style // Esto incluye el imagePosition dentro de style
              };
              await updateModule(editingItem.id, dataToSave);
          }
          alert("¡Actualizado! Los cambios ya son visibles en la App.");
          setEditingItem(null);
      } catch (e) {
          console.error(e);
          alert("Error al guardar cambios. Verifica tu conexión.");
      } finally {
          setIsSaving(false);
      }
  };

  // Helper para resolver icono dinámico (para preview de módulo)
  const getIconComponent = (iconName: string) => {
      // @ts-ignore
      const Icon = LucideIcons[iconName];
      return Icon || LucideIcons.PlayCircle;
  };

    const getBannerIcon = (tag: string) => {
      if (tag.includes('GAMING')) return Gamepad2;
      if (tag.includes('NUEVO')) return BellRing;
      if (tag.includes('RECOMPENSA')) return TrendingUp;
      if (tag.includes('MASTERCLASS')) return Video;
      if (tag.includes('RANKING')) return Trophy;
      return Star;
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
                        {/* Banner uses 'image', Module uses 'imageUrl' */}
                        <img 
                            src={item.imageUrl || item.image} 
                            alt="" 
                            className={`w-full h-full object-cover ${activeCategory === 'banners' ? item.imagePosition : item.style?.imagePosition}`} 
                        />
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

  const renderEditor = () => {
    const currentPos = getCurrentImagePosition();

    return (
    <div className="animate-slide-up space-y-6">
         {/* Preview Visual */}
         <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-lg border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase text-gray-400 block">Vista Previa de Edición</label>
                <button 
                    onClick={() => setShowFullPreview(true)}
                    className="text-[9px] font-bold text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded hover:bg-purple-100 transition-colors flex items-center uppercase"
                >
                    <Eye size={12} className="mr-1" />
                    Vista previa página
                </button>
            </div>
            
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group border border-gray-200 dark:border-white/10">
                <img 
                    src={urlInput || 'https://via.placeholder.com/800x400?text=Sin+Imagen'} 
                    alt="Preview" 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${currentPos}`} 
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Error+de+Carga')}
                />
                
                {/* Overlay on hover/action */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={openGallery}>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform hover:scale-110 transition-transform">
                        <Image size={24} />
                    </div>
                    <span className="absolute bottom-4 text-white text-[10px] font-black uppercase tracking-widest">Subir Localmente</span>
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
            
            {/* --- SECCIÓN DE IMAGEN --- */}
            <div className="flex items-center justify-between text-brand-purple border-b border-gray-100 dark:border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                    <LinkIcon size={16} />
                    <h3 className="text-xs font-black uppercase">Enlace de Imagen (URL)</h3>
                </div>
                <ExternalLink size={12} className="opacity-50" />
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={handleUrlInputChange}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-300 focus:border-brand-purple outline-none shadow-inner"
                        placeholder="https://i.imgur.com/..."
                    />
                    <button
                        onClick={openGallery}
                        className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-3 rounded-lg text-gray-500 hover:text-brand-purple transition-colors flex-shrink-0 shadow-sm"
                        title="Subir archivo desde dispositivo"
                    >
                        <Image size={18} />
                    </button>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 leading-tight flex items-start">
                    <span className="text-brand-purple mr-1 font-bold">TIP:</span> 
                    Pega aquí el enlace directo de tu imagen (Imgur, Cloudinary, etc).
                </p>
            </div>

            {/* --- CONTROL DE POSICIÓN DE IMAGEN --- */}
            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Ajustar Posición de Imagen</label>
                <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10">
                    <button 
                        onClick={() => handleImagePosition('object-top')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-top' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ArrowUp size={16} />
                        <span className="text-[9px] font-bold mt-1">Arriba</span>
                    </button>
                    <button 
                        onClick={() => handleImagePosition('object-center')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-center' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Minus size={16} />
                        <span className="text-[9px] font-bold mt-1">Centro</span>
                    </button>
                    <button 
                        onClick={() => handleImagePosition('object-bottom')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-bottom' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ArrowDown size={16} />
                        <span className="text-[9px] font-bold mt-1">Abajo</span>
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN DE TEXTO --- */}
            <div className="flex items-center space-x-2 text-brand-purple border-b border-gray-100 dark:border-white/5 pb-2 pt-2">
                <TypeIcon size={16} />
                <h3 className="text-xs font-black uppercase">Información Textual</h3>
            </div>

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
                    {activeCategory === 'banners' ? 'Subtítulo' : 'Descripción Corta'}
                </label>
                <textarea 
                    value={editingItem.subtitle || editingItem.description || ''} 
                    onChange={(e) => {
                        const key = activeCategory === 'banners' ? 'subtitle' : 'description';
                        setEditingItem({...editingItem, [key]: e.target.value});
                    }}
                    rows={2}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium dark:text-white focus:border-brand-purple outline-none resize-none"
                />
            </div>

            {/* EXTRA FIELDS FOR MODULES */}
            {activeCategory === 'modules' && (
                <>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Contenido Detallado</label>
                        <textarea 
                            value={editingItem.textContent || ''} 
                            onChange={(e) => setEditingItem({...editingItem, textContent: e.target.value})}
                            rows={5}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-medium dark:text-white focus:border-brand-purple outline-none resize-none leading-relaxed"
                            placeholder="Texto completo que aparece dentro del módulo..."
                        />
                    </div>
                    
                    {/* STYLE EDITOR */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center space-x-2 text-brand-purple mb-4">
                            <Palette size={16} />
                            <h3 className="text-xs font-black uppercase">Diseño de Tarjeta</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Color de Fondo (Tailwind)</label>
                                <input 
                                    type="text" 
                                    value={editingItem.style?.bg || ''} 
                                    onChange={(e) => setEditingItem({
                                        ...editingItem, 
                                        style: { ...editingItem.style, bg: e.target.value }
                                    })}
                                    placeholder="Ej: bg-blue-600"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono dark:text-white focus:border-brand-purple outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Icono (Lucide Name)</label>
                                <input 
                                    type="text" 
                                    value={editingItem.style?.iconName || ''} 
                                    onChange={(e) => setEditingItem({
                                        ...editingItem, 
                                        style: { ...editingItem.style, iconName: e.target.value }
                                    })}
                                    placeholder="Ej: PlayCircle"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono dark:text-white focus:border-brand-purple outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Image URL Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
            />

            {/* Save Button */}
            <button 
                onClick={requestSave}
                className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4"
            >
                <Save size={16} className="mr-2" />
                Guardar Cambios
            </button>
         </div>
    </div>
    );
  };

  // --- PREVIEW MODAL (FULL PAGE MOCKUP) ---
  const renderPreviewModal = () => {
      if (!editingItem) return null;

      // PREVIEW TYPE 1: BANNERS (Muestra Home Page Profile)
      if (activeCategory === 'banners') {
          // Crear lista inyectando el banner editado
          const previewBanners = banners.map(b => {
              if (b.id === editingItem.id) {
                  return { ...editingItem, image: urlInput };
              }
              return b;
          });

          return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in">
                 <div className="w-full max-w-sm h-full max-h-[85vh] bg-brand-gray dark:bg-black rounded-3xl overflow-hidden relative shadow-2xl border-4 border-gray-800 flex flex-col">
                     
                     {/* Mock Status Bar */}
                     <div className="h-6 w-full bg-black/20 flex justify-between items-center px-4 shrink-0 z-50 relative">
                         <span className="text-[10px] text-white font-bold">9:41</span>
                         <div className="flex gap-1">
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                             <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-brand-gray dark:bg-black">
                        {/* HEADER */}
                        <header className="fixed top-6 left-0 right-0 z-40 flex flex-col justify-end pt-safe transition-all duration-300 bg-brand-gray/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10" style={{ height: '3.5rem', position: 'sticky', top: 0 }}>
                            <div className="flex items-center justify-between px-4 h-14 w-full">
                                <h1 className="text-base font-bold uppercase tracking-wider ml-1 truncate text-brand-black dark:text-white">Inicio</h1>
                                <div className="w-10 h-10 flex items-center justify-center rounded-full text-brand-black dark:text-white"><BellRing size={22} /></div>
                            </div>
                        </header>

                        {/* HERO */}
                        <div className="bg-brand-gray dark:bg-black pb-4">
                            <div className="px-6 pt-6 pb-2">
                                <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bienvenido de nuevo,</p>
                                <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tight">Streamer</h1>
                            </div>
                            <div className="relative mt-4 mb-6 px-4">
                                 <div className="overflow-x-auto scrollbar-hide flex gap-0 snap-x snap-mandatory rounded-sm shadow-xl">
                                    {previewBanners.map((banner) => {
                                        const Icon = getBannerIcon(banner.tag);
                                        return (
                                            <div key={banner.id} className={`relative flex-shrink-0 w-full overflow-hidden snap-center ${banner.shadow}`} style={{ aspectRatio: '1080/430' }}>
                                                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                                                <img src={banner.image} alt={banner.title} className={`absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay ${banner.imagePosition || 'object-center'}`} />
                                                <div className="absolute inset-0 p-5 flex flex-col justify-center items-start z-10">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className={`${banner.tagColor} text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm shadow-sm`}>{banner.tag}</span>
                                                    </div>
                                                    <h2 className="text-2xl font-black text-white uppercase leading-none mb-1 drop-shadow-md pr-10">{banner.title}</h2>
                                                    <p className="text-white/90 text-xs font-bold mt-1 max-w-[85%] leading-tight">{banner.subtitle}</p>
                                                    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-12" size={80} strokeWidth={1} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                 </div>
                            </div>
                        </div>
                        {/* GRID PLACEHOLDER */}
                        <div className="mx-4 mb-24 opacity-50 grayscale">
                            <div className="mb-4 pl-1 border-l-4 border-brand-purple ml-1">
                                <h3 className="text-lg font-black uppercase tracking-wide text-brand-black dark:text-white ml-2 leading-none">Módulos</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-5"><div className="h-32 bg-gray-800 rounded-sm"></div><div className="h-32 bg-gray-800 rounded-sm"></div></div>
                        </div>
                     </div>

                     <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50">
                         <button onClick={() => setShowFullPreview(false)} className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-xs shadow-lg active:scale-95 transition-transform">Cerrar Vista Previa</button>
                     </div>
                 </div>
            </div>
          );
      }

      // PREVIEW TYPE 2: MODULES (Muestra Training Detail Page)
      if (activeCategory === 'modules') {
          // Combinar datos editados con la estructura del item
          const previewModule = { ...editingItem, imageUrl: urlInput };
          const currentPos = getCurrentImagePosition();

          return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in">
                 <div className="w-full max-w-sm h-full max-h-[85vh] bg-white dark:bg-black rounded-3xl overflow-hidden relative shadow-2xl border-4 border-gray-800 flex flex-col">
                     
                     {/* Mock Status Bar */}
                     <div className="absolute top-0 left-0 right-0 h-6 z-50 flex justify-between items-center px-4 pointer-events-none">
                         <span className="text-[10px] text-white font-bold drop-shadow-md">9:41</span>
                         <div className="flex gap-1"><div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div><div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div></div>
                     </div>

                     {/* CONTENT */}
                     <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-white dark:bg-black">
                        {/* Nav Mock */}
                        <div className="absolute top-0 left-0 w-full z-40 pt-8 px-4 pointer-events-none">
                            <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
                                <ChevronLeft size={24} />
                            </div>
                        </div>

                        {/* HERO IMAGE */}
                        <div className="h-[40vh] w-full relative bg-brand-black shrink-0">
                            <img 
                                src={previewModule.imageUrl || 'https://via.placeholder.com/800x800'} 
                                className={`w-full h-full object-cover opacity-90 ${currentPos}`} 
                                alt="Preview"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-black/40"></div>
                            <div className="absolute bottom-0 left-0 w-full px-6 pb-6 z-10">
                                <span className="text-[10px] font-black text-white bg-brand-purple px-2 py-1 uppercase tracking-widest mb-3 inline-block shadow-sm">Módulo</span>
                                <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-[0.9] mb-1 drop-shadow-sm">{previewModule.title}</h1>
                            </div>
                        </div>

                        {/* TEXT CONTENT */}
                        <div className="px-6 pt-4 pb-20 bg-white dark:bg-black relative z-10 min-h-[50vh]">
                            <div className="h-1 w-10 bg-brand-purple mb-4"></div>
                            <h2 className="text-lg font-bold text-brand-black dark:text-white leading-tight mb-4">{previewModule.description}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-justify whitespace-pre-line">{previewModule.textContent}</p>
                            
                            {/* Fake Resources */}
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 opacity-60">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Recursos del Módulo</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-sm"></div>
                                    <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-sm"></div>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50">
                         <button onClick={() => setShowFullPreview(false)} className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-xs shadow-lg active:scale-95 transition-transform">Cerrar Vista Previa</button>
                     </div>
                 </div>
            </div>
          );
      }
      return null;
  };

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

      {/* --- PIN MODAL --- */}
      {showPinModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white dark:bg-[#121212] w-full max-w-xs rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
                  <div className="flex flex-col items-center mb-6">
                      <div className="bg-brand-black dark:bg-white text-white dark:text-black p-3 rounded-full mb-3">
                          <Lock size={24} />
                      </div>
                      <h3 className="text-lg font-black text-brand-black dark:text-white uppercase">Seguridad</h3>
                      <p className="text-xs text-gray-500 text-center">Ingresa el código de editor para confirmar los cambios.</p>
                  </div>

                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                    maxLength={4}
                    placeholder="••••"
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 text-center text-2xl font-black tracking-[1em] focus:border-brand-purple outline-none mb-4"
                    autoFocus
                  />
                  
                  {pinError && <p className="text-red-500 text-[10px] font-black uppercase text-center mb-4">Código Incorrecto</p>}

                  <div className="flex gap-3">
                      <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 text-xs font-bold uppercase text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg">Cancelar</button>
                      <button onClick={confirmSave} className="flex-1 py-3 text-xs font-bold uppercase text-white bg-brand-purple rounded-lg shadow-lg">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center">
              <div className="bg-white dark:bg-black p-4 rounded-xl flex items-center gap-3 shadow-xl">
                  <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold uppercase">Publicando Cambios...</span>
              </div>
          </div>
      )}

      {/* Full Screen Preview Modal */}
      {showFullPreview && renderPreviewModal()}
    </div>
  );
};

export default EditorDashboard;
