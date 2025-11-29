import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Layers, Image as ImageIcon, Type, Save, Layout, ChevronRight, Edit3, Lock, ArrowLeft, Palette, Type as TypeIcon, Link as LinkIcon } from 'lucide-react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Función para comprimir imágenes antes de procesar (Fix Firestore 1MB limit)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image(); // Constructor nativo limpio
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Limit width for banners/modules
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convertir a JPEG con 70% de calidad para reducir tamaño base64
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          } else {
            reject(new Error("Error al procesar imagen"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
        try {
            // Comprimir imagen antes de establecerla en el estado
            const compressedBase64 = await compressImage(file);
            
            setEditingItem({
                ...editingItem,
                imageUrl: compressedBase64,
                // Unified update for visual feedback
                image: compressedBase64 
            });
        } catch (error) {
            console.error("Error compressing image:", error);
            alert("La imagen es demasiado pesada o incompatible. Intenta con otra.");
        }
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
              // Mapeo para asegurar compatibilidad de campos
              const dataToSave = {
                  title: editingItem.title,
                  subtitle: editingItem.subtitle,
                  image: editingItem.imageUrl || editingItem.image,
                  tag: editingItem.tag
              };
              await updateBanner(String(editingItem.id), dataToSave);
          } else if (activeCategory === 'modules') {
               const dataToSave = {
                  title: editingItem.title,
                  description: editingItem.description,
                  imageUrl: editingItem.imageUrl || editingItem.image, // Ensure we get the latest url
                  textContent: editingItem.textContent,
                  style: editingItem.style
              };
              await updateModule(editingItem.id, dataToSave);
          }
          alert("Cambios guardados exitosamente y reflejados en tiempo real.");
          setEditingItem(null);
      } catch (e) {
          console.error(e);
          alert("Error al guardar cambios. Es posible que la imagen sea muy grande.");
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
                    <ImageIcon size={24} strokeWidth={1.5} />
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
            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Vista Previa (Toca para editar imagen)</label>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group">
                <img src={editingItem.imageUrl || editingItem.image} alt="Preview" className="w-full h-full object-cover transition-opacity duration-300" />
                
                {/* Overlay on hover/action */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={openGallery}>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform hover:scale-110 transition-transform">
                        <ImageIcon size={24} />
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
            <div className="flex items-center space-x-2 text-brand-purple border-b border-gray-100 dark:border-white/5 pb-2">
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

            {/* Image Source Input (Manual URL) */}
            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center">
                    <LinkIcon size={10} className="mr-1" />
                    Enlace de Imagen (URL)
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={editingItem.imageUrl || editingItem.image || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setEditingItem({
                                    ...editingItem, 
                                    imageUrl: val,
                                    image: val
                                });
                            }}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 pr-8 text-xs font-mono dark:text-white focus:border-brand-purple outline-none"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>
                    <button 
                        onClick={openGallery}
                        className="bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-purple dark:text-gray-300 dark:hover:text-white px-3 rounded-lg transition-colors border border-gray-200 dark:border-white/5"
                        title="Subir desde dispositivo"
                    >
                        <ImageIcon size={20} />
                    </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">
                    * Pega un enlace directo o usa el botón para subir (se comprimirá automáticamente).
                </p>
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
                         <p className="text-[9px] text-gray-400 mt-2">
                            * Modifica las clases de CSS para cambiar la apariencia en la lista de módulos.
                        </p>
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

export default EditorDashboard;