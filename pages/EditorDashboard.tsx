import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Layers, Image, Type, Save, Layout, ChevronRight, Edit3, Lock, ArrowLeft, Palette, Type as TypeIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { banners, modules, updateBanner, updateModule } = useContent();
  
  // --- STATE MANAGEMENT ---
  const [activeCategory, setActiveCategory] = useState<'banners' | 'modules' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
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
                  image: urlInput, // Usar el valor del input, que puede ser editado manualmente
                  tag: editingItem.tag
              };
              await updateBanner(String(editingItem.id), dataToSave);
          } else if (activeCategory === 'modules') {
              // Estructura exacta para Módulos
               const dataToSave = {
                  title: editingItem.title,
                  description: editingItem.description,
                  imageUrl: urlInput, // Usar el valor del input, que puede ser editado manualmente
                  textContent: editingItem.textContent,
                  style: editingItem.style
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
                        <img src={item.imageUrl || item.image} alt="" className="w-full h-full object-cover" />
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
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase text-gray-400 block">Vista Previa en Vivo</label>
                <span className="text-[9px] font-bold text-green-500 uppercase flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                </span>
            </div>
            
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group border border-gray-200 dark:border-white/10">
                <img 
                    src={urlInput || 'https://via.placeholder.com/800x400?text=Sin+Imagen'} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-opacity duration-300" 
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
                    Pega aquí el enlace directo de tu imagen (Imgur, Cloudinary, etc). Al cambiar el texto, la vista previa de arriba se actualizará automáticamente.
                </p>
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
    </div>
  );
};

export default EditorDashboard;