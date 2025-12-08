
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Layers, Image, Type, Save, Layout, ChevronRight, Edit3, Palette, Type as TypeIcon, Link as LinkIcon, ExternalLink, ArrowUp, ArrowDown, Minus, Eye, X, Smartphone, BellRing, Trophy, TrendingUp, Video, Gamepad2, Star, ShieldCheck, HelpCircle, ChevronLeft, Droplet, CreditCard, Home, Images, Grid, PaintBucket, Gift, ArrowDownUp, Crown } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import * as LucideIcons from 'lucide-react';
import { TrainingResource, GiftItem, TopStreamer } from '../types';

const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { banners, modules, homeConfig, gifts, topStreamers, updateBanner, updateModule, updateHomeConfig, updateGifts, updateTopStreamers } = useContent();
  
  // --- STATE MANAGEMENT ---
  const [activeCategory, setActiveCategory] = useState<'home' | 'modules' | 'gifts' | 'top3' | null>(null);
  const [subCategory, setSubCategory] = useState<'banners' | 'module_styles' | null>(null); 
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewView, setPreviewView] = useState<'home' | 'detail'>('home'); 

  // --- STATE FOR TOP 3 EDITOR ---
  const [localTopConfig, setLocalTopConfig] = useState(topStreamers);

  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial state
  useEffect(() => {
      setLocalTopConfig(topStreamers);
  }, [topStreamers]);

  useEffect(() => {
    if (editingItem && editingResourceIndex === null && editingItem.type !== 'gift' && editingItem.type !== 'top3_streamer') {
        const currentImage = editingItem.type === 'banner' ? editingItem.image : editingItem.imageUrl;
        setUrlInput(currentImage || '');
    }
  }, [editingItem, activeCategory, editingResourceIndex]);

  useEffect(() => {
      if (showFullPreview) {
          setPreviewView(isEditingResource ? 'detail' : 'home');
      }
  }, [showFullPreview]);

  const isEditingResource = editingResourceIndex !== null;
  const isStyleOnlyMode = subCategory === 'module_styles';

  const COLOR_PALETTE = [
      { name: 'Azul', bg: 'bg-blue-600', shadow: 'shadow-blue-600/40' },
      { name: 'Morado', bg: 'bg-brand-purple', shadow: 'shadow-purple-600/40' },
      { name: 'Verde', bg: 'bg-emerald-600', shadow: 'shadow-emerald-600/40' },
      { name: 'Rojo', bg: 'bg-red-600', shadow: 'shadow-red-600/40' },
      { name: 'Naranja', bg: 'bg-orange-500', shadow: 'shadow-orange-500/40' },
      { name: 'Rosa', bg: 'bg-pink-600', shadow: 'shadow-pink-600/40' },
      { name: 'Cian', bg: 'bg-cyan-600', shadow: 'shadow-cyan-600/40' },
      { name: 'Negro', bg: 'bg-gray-900', shadow: 'shadow-black/40' },
      { name: 'Gris', bg: 'bg-gray-600', shadow: 'shadow-gray-600/40' },
      { name: 'Indigo', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/40' },
      { name: 'Violeta', bg: 'bg-violet-600', shadow: 'shadow-violet-600/40' },
      { name: 'Esmeralda', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  ];

  // --- HANDLERS ---

  const handleBack = () => {
    if (editingResourceIndex !== null) {
        setEditingResourceIndex(null);
    } else if (editingItem) {
        setEditingItem(null);
        setUrlInput('');
    } else if (subCategory) {
        setSubCategory(null);
    } else if (activeCategory) {
        setActiveCategory(null);
    } else {
        navigate('/admin/selection');
    }
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  // --- IMAGE COMPRESSION UTILITY ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Limit width to 800px for Firestore safety
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
            // Compress to JPEG with 0.7 quality (~80KB)
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            // Use compression before setting state
            const compressedBase64 = await compressImage(file);
            setUrlInput(compressedBase64);
            
            if (editingItem && editingItem.type === 'top3_streamer') {
                // Update Top Streamer Avatar
                const newList = localTopConfig.list.map(s => s.rank === editingItem.rank ? { ...s, avatar: compressedBase64 } : s);
                const newConfig = { ...localTopConfig, list: newList };
                setLocalTopConfig(newConfig);
                setEditingItem({ ...editingItem, avatar: compressedBase64 });
            } else if (editingItem && editingItem.type === 'banner') {
                setEditingItem({ ...editingItem, image: compressedBase64 });
            } else if (editingItem && editingItem.type === 'module') {
                setEditingItem({ ...editingItem, imageUrl: compressedBase64 });
            }
        } catch (error) {
            console.error("Error processing image", error);
            alert("Error al procesar la imagen. Intenta con una más pequeña.");
        }
    }
  };

  // ... (existing Url Input Change logic) ...
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrlInput(newUrl);
      if (editingItem.type === 'banner') {
          setEditingItem({ ...editingItem, image: newUrl });
      } else if (editingResourceIndex === null && editingItem.type === 'module') {
          setEditingItem({ ...editingItem, imageUrl: newUrl });
      } else if (editingItem.type === 'top3_streamer') {
          const newList = localTopConfig.list.map(s => s.rank === editingItem.rank ? { ...s, avatar: newUrl } : s);
          const newConfig = { ...localTopConfig, list: newList };
          setLocalTopConfig(newConfig);
          setEditingItem({ ...editingItem, avatar: newUrl });
      }
  };

  // ... (existing handlers for modules, colors, opacity, icons) ...
  const handleImagePosition = (pos: 'object-top' | 'object-center' | 'object-bottom') => {
      if (editingItem.type === 'banner') {
          setEditingItem({ ...editingItem, imagePosition: pos });
      } else {
          setEditingItem({ 
              ...editingItem, 
              style: { ...editingItem.style, imagePosition: pos } 
          });
      }
  };

  const handleColorSelect = (color: typeof COLOR_PALETTE[0]) => {
      if (editingItem.type === 'module') {
          if (editingResourceIndex !== null) {
              const updatedResources = [...editingItem.resources];
              const currentRes = updatedResources[editingResourceIndex];
              updatedResources[editingResourceIndex] = {
                  ...currentRes,
                  style: { ...currentRes.style, bg: color.bg, shadow: color.shadow }
              };
              setEditingItem({ ...editingItem, resources: updatedResources });
          } else {
              setEditingItem({
                  ...editingItem,
                  style: { ...editingItem.style, bg: color.bg, shadow: color.shadow }
              });
          }
      }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const opacity = parseFloat(e.target.value);
      if (editingItem.type === 'module') {
          if (editingResourceIndex !== null) {
              const updatedResources = [...editingItem.resources];
              const currentRes = updatedResources[editingResourceIndex];
              updatedResources[editingResourceIndex] = {
                  ...currentRes,
                  style: { ...currentRes.style, cardOpacity: opacity }
              };
              setEditingItem({ ...editingItem, resources: updatedResources });
          } else {
              setEditingItem({
                  ...editingItem,
                  style: { ...editingItem.style, cardOpacity: opacity }
              });
          }
      }
  };

  const handleIconChange = (iconName: string) => {
      if (editingResourceIndex !== null) {
          const updatedResources = [...editingItem.resources];
          const currentRes = updatedResources[editingResourceIndex];
          updatedResources[editingResourceIndex] = {
              ...currentRes,
              style: { ...currentRes.style, iconName: iconName }
          };
          setEditingItem({ ...editingItem, resources: updatedResources });
      } else if (editingItem.type === 'module') {
           setEditingItem({
              ...editingItem, 
              style: { ...editingItem.style, iconName: iconName }
           });
      }
  };

  const getCurrentImagePosition = () => {
      if (editingItem.type === 'banner') {
          return editingItem.imagePosition || 'object-center';
      } else {
          return editingItem.style?.imagePosition || 'object-center';
      }
  };

  const handleAutoSort = async () => {
      if (editingItem.type !== 'gift' || !editingItem.category) return;
      setIsSaving(true);
      try {
          const categoryGifts = gifts.filter(g => g.category === editingItem.category);
          const otherGifts = gifts.filter(g => g.category !== editingItem.category);
          const sorted = categoryGifts.sort((a, b) => parseInt(a.value) - parseInt(b.value));
          const updatedCategoryGifts = sorted.map((g, index) => ({
              ...g,
              order: index + 1
          }));
          await updateGifts([...otherGifts, ...updatedCategoryGifts]);
          alert("¡Ordenado! Los regalos se han organizado por valor.");
          handleBack(); 
      } catch (e) { console.error(e); alert("Error al ordenar."); } finally { setIsSaving(false); }
  };

  // --- SAVE HANDLER (Including Top 3) ---
  const handleSave = async () => {
      setIsSaving(true);

      try {
          if (editingItem.type === 'banner') {
              const dataToSave = {
                  title: editingItem.title,
                  subtitle: editingItem.subtitle,
                  image: urlInput, 
                  tag: editingItem.tag,
                  imagePosition: editingItem.imagePosition || 'object-center'
              };
              await updateBanner(String(editingItem.id), dataToSave);
          } else if (editingItem.type === 'config') {
              const dataToSave: any = {
                  welcomeText: editingItem.welcomeText,
                  modulesTitle: editingItem.modulesTitle,
                  modulesSubtitle: editingItem.modulesSubtitle,
              };
              await updateHomeConfig(dataToSave);
          } else if (editingItem.type === 'module') {
               if (isStyleOnlyMode) {
                   const dataToSave = { style: editingItem.style };
                   await updateModule(editingItem.id, dataToSave);
               } else {
                    const dataToSave = {
                        title: editingItem.title,
                        description: editingItem.description,
                        imageUrl: urlInput, 
                        textContent: editingItem.textContent,
                        style: editingItem.style,
                        resources: editingItem.resources
                    };
                    await updateModule(editingItem.id, dataToSave);
               }
          } else if (editingItem.type === 'gift') {
              const safeOrder = parseInt(editingItem.order) || 0;
              const updatedGifts = gifts.map(g => g.id === editingItem.id ? { 
                  ...g, 
                  value: editingItem.value,
                  name: editingItem.name,
                  category: editingItem.category,
                  order: safeOrder
              } : g);
              await updateGifts(updatedGifts);
          } else if (activeCategory === 'top3') {
              // Save Entire Top 3 Config
              await updateTopStreamers(localTopConfig);
          }

          alert("¡Actualizado! Los cambios ya son visibles en la App.");
          
          if (activeCategory !== 'top3' || !editingItem) {
              setEditingItem(null);
              setEditingResourceIndex(null);
          }
      } catch (e) {
          console.error(e);
          alert("Error al guardar cambios. Verifica que la imagen no sea demasiado pesada (Máx 1MB).");
      } finally {
          setIsSaving(false);
      }
  };

  const getIconComponent = (iconName: string) => {
      // @ts-ignore
      const Icon = LucideIcons[iconName];
      return Icon || LucideIcons.Folder;
  };

  const renderCategoryList = () => (
    <div className="grid grid-cols-1 gap-4 animate-fade-in">
        <button 
            onClick={() => setActiveCategory('home')}
            className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-brand-black dark:bg-white/10 p-3 rounded-lg text-white dark:text-white">
                    <Home size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Página principal de inicio
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        Configurar textos, banners y tarjetas
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
                <div className="bg-blue-600 dark:bg-blue-900/20 p-3 rounded-lg text-white">
                    <Grid size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Módulos de Capacitación
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        Editar contenido completo de los módulos
                    </p>
                </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
        </button>

        <button 
            onClick={() => setActiveCategory('gifts')}
            className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-pink-600 dark:bg-pink-900/20 p-3 rounded-lg text-white">
                    <Gift size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Catálogo de Regalos
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        Modificar valor, orden y categoría
                    </p>
                </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
        </button>

        {/* TOP 3 CATEGORY */}
        <button 
            onClick={() => setActiveCategory('top3')}
            className="bg-white dark:bg-brand-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-yellow-500 dark:bg-yellow-500/20 p-3 rounded-lg text-white dark:text-yellow-500">
                    <Trophy size={24} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
                        Ranking Top 3
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        Editar ganadores, mes y tarjeta de felicitación
                    </p>
                </div>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
        </button>
    </div>
  );

  const renderItemList = () => {
    let items: any[] = [];
    let title = 'Lista de Items';

    // --- TOP 3 VIEW MODE (DIRECT EDITOR) ---
    if (activeCategory === 'top3') {
        const list = localTopConfig.list.sort((a,b) => a.rank - b.rank);
        
        return (
            <div className="animate-slide-up space-y-6">
                
                {/* Header Config */}
                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                    <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                        <h4 className="text-xs font-black uppercase text-brand-purple mb-1">Configuración General</h4>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Título del Mes / Periodo</label>
                        <input 
                            type="text" 
                            value={localTopConfig.month}
                            onChange={(e) => setLocalTopConfig({...localTopConfig, month: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold text-brand-black dark:text-white outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Título de Felicitación</label>
                        <input 
                            type="text" 
                            value={localTopConfig.congratsTitle || ''}
                            onChange={(e) => setLocalTopConfig({...localTopConfig, congratsTitle: e.target.value})}
                            placeholder="¡Felicidades!"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold text-brand-black dark:text-white outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Mensaje de Felicitación</label>
                        <textarea 
                            value={localTopConfig.congratsMessage || ''}
                            onChange={(e) => setLocalTopConfig({...localTopConfig, congratsMessage: e.target.value})}
                            placeholder="Mensaje corto motivador..."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium text-brand-black dark:text-white outline-none h-20 resize-none"
                        />
                    </div>
                </div>

                {/* List of 3 */}
                <div className="space-y-4">
                    {list.map((streamer) => (
                        <div key={streamer.rank} className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${streamer.rank === 1 ? 'bg-yellow-500 text-black' : streamer.rank === 2 ? 'bg-gray-300 text-black' : 'bg-orange-400 text-white'}`}>
                                        #{streamer.rank}
                                    </div>
                                    <span className="text-xs font-black uppercase text-gray-500">Puesto {streamer.rank}</span>
                                </div>
                                <button onClick={() => { setEditingItem({...streamer, type: 'top3_streamer'}); setUrlInput(streamer.avatar); }} className="text-[10px] font-bold text-brand-purple hover:underline uppercase">Editar Detalle</button>
                            </div>
                            <div className="flex items-center gap-4">
                                <img src={streamer.avatar} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                                <div>
                                    <h4 className="text-sm font-black uppercase text-brand-black dark:text-white">{streamer.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold">{streamer.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={handleSave} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4 sticky bottom-6">
                    <Save size={16} className="mr-2" /> Guardar Ranking
                </button>
            </div>
        );
    }

    // ... (rest of the file remains the same)
    if (activeCategory === 'home') {
        // ... (existing home logic) ...
        if (!subCategory) {
            return (
                <div className="animate-slide-up space-y-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">
                            Página Principal
                        </h2>
                    </div>
                    <button 
                        onClick={() => setEditingItem({ id: 'home_config', title: 'Configuración General', subtitle: 'Textos Principales', type: 'config', ...homeConfig })}
                        className="w-full bg-white dark:bg-brand-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center space-x-4 active:scale-[0.99] transition-all text-left group"
                    >
                         <div className="w-16 h-16 rounded-lg bg-brand-black dark:bg-white/10 flex items-center justify-center text-white">
                             <Type size={24} />
                         </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-brand-black dark:text-white uppercase truncate mb-1">
                                Textos Principales
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-2">
                                Saludos, títulos y textos de bienvenida.
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <button 
                        onClick={() => setSubCategory('banners')}
                        className="w-full bg-white dark:bg-brand-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center space-x-4 active:scale-[0.99] transition-all text-left group"
                    >
                         <div className="w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                             <Images size={24} />
                         </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-brand-black dark:text-white uppercase truncate mb-1">
                                Banners página principal de inicio
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-2">
                                Gestionar carrusel ({banners.length} banners)
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <button 
                        onClick={() => setSubCategory('module_styles')}
                        className="w-full bg-white dark:bg-brand-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center space-x-4 active:scale-[0.99] transition-all text-left group"
                    >
                         <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                             <PaintBucket size={24} />
                         </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black text-brand-black dark:text-white uppercase truncate mb-1">
                                Apariencia de tarjetas de módulo
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-2">
                                Personalizar colores y transparencia de tarjetas
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                </div>
            );
        } else if (subCategory === 'banners') {
            items = banners.map(b => ({...b, type: 'banner', subtitle: 'Banner del Carrusel'}));
            title = 'Banners de Inicio';
        } else if (subCategory === 'module_styles') {
            items = modules.map(m => ({...m, type: 'module'}));
            title = 'Estilos de Tarjetas';
        }
    } else if (activeCategory === 'modules') {
        items = modules.map(m => ({...m, type: 'module'}));
        title = 'Módulos de Capacitación';
    } else if (activeCategory === 'gifts') {
        items = gifts.map(g => ({...g, title: g.name, subtitle: `${g.value} Semillas - ${g.category?.toUpperCase()} [Orden: ${g.order}]`, type: 'gift'})).sort((a,b) => a.order - b.order);
        title = 'Catálogo de Regalos';
    }
    
    return (
        <div className="animate-slide-up space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-lg font-black uppercase text-brand-black dark:text-white">
                    {title}
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
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-white/10 overflow-hidden flex-shrink-0 relative shadow-inner">
                        {subCategory === 'module_styles' ? (
                            <div className={`w-full h-full ${item.style?.bg || 'bg-gray-500'}`}></div>
                        ) : subCategory === 'banners' ? (
                             <div className={`w-full h-full bg-gradient-to-r ${item.gradient || 'from-gray-500 to-gray-700'}`}></div>
                        ) : (
                            <img 
                                src={item.imageUrl || item.image} 
                                alt="" 
                                className={`w-full h-full object-cover ${item.type === 'banner' ? item.imagePosition : (item.type === 'module' ? item.style?.imagePosition : 'object-contain p-2')}`} 
                            />
                        )}
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
    const currentResource = isEditingResource ? editingItem.resources[editingResourceIndex] : null;
    const currentStyle = isEditingResource ? (currentResource.style || {}) : editingItem.style;

    // --- TOP 3 INDIVIDUAL STREAMER EDITOR ---
    if (editingItem.type === 'top3_streamer') {
        const handleLocalChange = (field: string, value: string) => {
            const newList = localTopConfig.list.map(s => s.rank === editingItem.rank ? { ...s, [field]: value } : s);
            setLocalTopConfig({...localTopConfig, list: newList});
            setEditingItem({...editingItem, [field]: value});
        };

        return (
            <div className="animate-slide-up space-y-6">
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-white/5 space-y-5">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-white/10 relative">
                            <img src={urlInput} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="mt-2 text-sm font-black uppercase">Editando Top {editingItem.rank}</h3>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20"><div className="flex gap-2"><input type="text" value={urlInput} onChange={handleUrlInputChange} className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-300 focus:border-brand-purple outline-none shadow-inner" placeholder="URL Foto..." /><button onClick={openGallery} className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-3 rounded-lg text-gray-500 hover:text-brand-purple transition-colors flex-shrink-0 shadow-sm" title="Subir archivo"><Image size={18} /></button></div></div>

                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Nombre Emisor</label><input type="text" value={editingItem.name} onChange={(e) => handleLocalChange('name', e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white outline-none" /></div>
                    
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">ID Bigo / Agencia</label><input type="text" value={editingItem.id} onChange={(e) => handleLocalChange('id', e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white outline-none" /></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Meta (Recaudado)</label><input type="text" value={editingItem.meta} onChange={(e) => handleLocalChange('meta', e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white outline-none" placeholder="Ej: 3M" /></div>
                        <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Récord Histórico</label><input type="text" value={editingItem.record} onChange={(e) => handleLocalChange('record', e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white outline-none" placeholder="Ej: 5M" /></div>
                    </div>

                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Tendencia</label><div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10"><button onClick={() => handleLocalChange('trend', 'up')} className={`flex-1 py-2 rounded text-xs font-black uppercase ${editingItem.trend === 'up' ? 'bg-white shadow text-green-500' : 'text-gray-400'}`}>Subiendo</button><button onClick={() => handleLocalChange('trend', 'stable')} className={`flex-1 py-2 rounded text-xs font-black uppercase ${editingItem.trend === 'stable' ? 'bg-white shadow text-gray-600' : 'text-gray-400'}`}>Estable</button><button onClick={() => handleLocalChange('trend', 'down')} className={`flex-1 py-2 rounded text-xs font-black uppercase ${editingItem.trend === 'down' ? 'bg-white shadow text-red-500' : 'text-gray-400'}`}>Bajando</button></div></div>

                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <button onClick={() => { setEditingItem(null); setUrlInput(''); }} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4">
                        <Save size={16} className="mr-2" /> Guardar Cambios
                    </button>
                </div>
            </div>
        );
    }

    // --- GIFT EDITOR MODE ---
    if (editingItem.type === 'gift') {
        // ... (existing gift editor code) ...
        return (
            <div className="animate-slide-up space-y-6">
                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-white/5 space-y-5 flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center p-4 border border-gray-200 dark:border-white/10 mb-2">
                        <img src={editingItem.imageUrl} alt="Gift" className="w-full h-full object-contain" />
                    </div>
                    <div className="w-full space-y-4">
                        <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Nombre del Regalo</label><input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold text-brand-black dark:text-white outline-none" /></div>
                        <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Valor (Semillas)</label><input type="number" value={editingItem.value} onChange={(e) => setEditingItem({...editingItem, value: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-lg font-black text-center text-brand-purple outline-none" /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Categoría</label><select value={editingItem.category || 'variedad'} onChange={(e) => setEditingItem({...editingItem, category: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-bold text-brand-black dark:text-white outline-none"><option value="variedad">Variedad</option><option value="lucky">Súper Lucky</option><option value="hot">Regalos HOT</option></select></div><div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Orden</label><input type="number" value={editingItem.order} onChange={(e) => setEditingItem({...editingItem, order: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-bold text-center text-brand-black dark:text-white outline-none" /></div></div>
                    </div>
                    <button onClick={handleSave} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4"><Save size={16} className="mr-2" /> Guardar Cambios</button>
                    <button onClick={handleAutoSort} className="w-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"><ArrowDownUp size={14} className="mr-2" /> Auto-ordenar por Precio</button>
                </div>
            </div>
        )
    }

    if (isStyleOnlyMode) {
        // ... (existing style editor code) ...
        const Icon = getIconComponent(currentStyle.iconName || 'Folder');
        return (
            <div className="animate-slide-up space-y-6">
                 {/* Visual Preview Box */}
                 <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-lg border border-gray-100 dark:border-white/5">
                    <div className="mb-4">
                        <h3 className="text-sm font-black uppercase text-brand-black dark:text-white">Previsualización de Tarjeta</h3>
                        <p className="text-[10px] text-gray-400">Así se verá en la página de inicio</p>
                    </div>
                    <div className="flex justify-center p-4 bg-gray-100 dark:bg-black/20 rounded-lg border border-dashed border-gray-300 dark:border-white/10">
                         <div className={`relative flex flex-col justify-end p-4 h-32 w-full max-w-[200px] text-left rounded-sm shadow-lg ${currentStyle.shadow} overflow-hidden group`}>
                            {editingItem.imageUrl && <img src={editingItem.imageUrl} alt="" className={`absolute inset-0 w-full h-full object-cover z-0 ${currentStyle.imagePosition || 'object-center'}`} />}
                            <div className={`absolute inset-0 z-10 ${currentStyle.bg} transition-opacity duration-300`} style={{ opacity: currentStyle.cardOpacity !== undefined ? currentStyle.cardOpacity : 1 }}></div>
                            <div className="relative z-20"><span className="text-sm font-black uppercase leading-tight block text-white tracking-wide drop-shadow-md">{editingItem.title}</span></div>
                            <div className="absolute -bottom-4 -right-4 opacity-20 text-white rotate-[-10deg] z-20"><Icon size={80} strokeWidth={1.5} /></div>
                         </div>
                    </div>
                 </div>
                 {/* Style Controls */}
                 <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-white/5 space-y-5">
                    <div className="flex items-center space-x-2 text-brand-purple mb-2"><Palette size={16} /><h3 className="text-xs font-black uppercase">Personalizar Apariencia</h3></div>
                    <div className="mb-6"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Elegir Color de Fondo</label><div className="flex flex-wrap gap-2">{COLOR_PALETTE.map((color, idx) => (<button key={idx} onClick={() => handleColorSelect(color)} className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform hover:scale-110 active:scale-95 ${color.bg.replace('bg-', 'bg-')} ${currentStyle?.bg === color.bg ? 'border-white ring-2 ring-brand-purple' : 'border-transparent'}`} title={color.name} />))}</div></div>
                    <div className="mb-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/5"><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase text-gray-400 flex items-center"><Droplet size={12} className="mr-1" /> Opacidad de Color</label><span className="text-[10px] font-bold text-brand-purple">{Math.round((currentStyle?.cardOpacity ?? 1) * 100)}%</span></div><input type="range" min="0" max="1" step="0.1" value={currentStyle?.cardOpacity ?? 1} onChange={handleOpacityChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple" /><div className="flex justify-between mt-1 text-[9px] text-gray-400 font-bold uppercase"><span>Transparente (Imagen)</span><span>Sólido (Color)</span></div></div>
                    <button onClick={handleSave} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4"><Save size={16} className="mr-2" /> Guardar Apariencia</button>
                 </div>
            </div>
        );
    }

    return (
    <div className="animate-slide-up space-y-6">
         {/* PORTADA VIEW (Existing for Banner/Modules) */}
         {editingItem.type !== 'config' && editingItem.type !== 'top3_streamer' && (
            <div className="bg-white dark:bg-brand-dark-card p-4 rounded-xl shadow-lg border border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 block">Vista de Portada (Identidad)</label>
                    <button onClick={() => setShowFullPreview(true)} className="text-[9px] font-bold text-brand-purple bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded hover:bg-purple-100 transition-colors flex items-center uppercase"><Eye size={12} className="mr-1" /> Vista previa página</button>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 group border border-gray-200 dark:border-white/10 flex items-center justify-center">
                    {editingItem.type === 'module' ? (
                            <div className="relative w-full h-full overflow-hidden flex flex-col justify-end p-6">
                                {urlInput && <img src={urlInput} alt="Preview" className={`absolute inset-0 w-full h-full object-cover z-0 ${currentPos}`} onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Error+de+Carga')} />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>
                                <div className="relative z-20"><span className="text-lg font-black uppercase leading-tight block text-white tracking-wide drop-shadow-md">{editingItem.title}</span><p className="text-xs text-white/90 font-medium mt-1 drop-shadow-sm line-clamp-2">{editingItem.description}</p></div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <div className={`absolute inset-0 bg-gradient-to-r ${editingItem.gradient || 'from-gray-700 to-gray-900'}`}></div>
                                <img src={urlInput || 'https://via.placeholder.com/800x400?text=Sin+Imagen'} alt="Preview" className={`absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay ${currentPos}`} onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Error+de+Carga')} />
                                <div className="absolute inset-0 p-5 flex flex-col justify-center items-start z-10"><div className="flex items-center space-x-2 mb-2"><span className={`${editingItem.tagColor || 'bg-white text-black'} text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm shadow-sm`}>{editingItem.tag}</span></div><h2 className="text-xl font-black text-white uppercase leading-none mb-1 drop-shadow-md">{editingItem.title}</h2><p className="text-white/90 text-xs font-bold mt-1 leading-tight">{editingItem.subtitle}</p></div>
                            </div>
                        )
                    }
                </div>
            </div>
         )}

         {/* Form Inputs Container */}
         <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-white/5 space-y-5">
            {isEditingResource && <button onClick={() => setEditingResourceIndex(null)} className="flex items-center text-[10px] font-bold text-gray-400 hover:text-brand-purple mb-4 uppercase tracking-wider"><ChevronLeft size={14} className="mr-1" /> Volver a Portada del Módulo</button>}

            {!isEditingResource && editingItem.type !== 'config' && editingItem.type !== 'top3_streamer' && (
                <>
                <div className="flex items-center justify-between text-brand-purple border-b border-gray-100 dark:border-white/5 pb-2"><div className="flex items-center space-x-2"><LinkIcon size={16} /><h3 className="text-xs font-black uppercase">Enlace de Imagen (URL)</h3></div><ExternalLink size={12} className="opacity-50" /></div>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20"><div className="flex gap-2"><input type="text" value={urlInput} onChange={handleUrlInputChange} className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-300 focus:border-brand-purple outline-none shadow-inner" placeholder="https://i.imgur.com/..." /><button onClick={openGallery} className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-3 rounded-lg text-gray-500 hover:text-brand-purple transition-colors flex-shrink-0 shadow-sm" title="Subir archivo desde dispositivo"><Image size={18} /></button></div></div>
                <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Ajustar Posición de Imagen</label><div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10"><button onClick={() => handleImagePosition('object-top')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-top' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}><ArrowUp size={16} /><span className="text-[9px] font-bold mt-1">Arriba</span></button><button onClick={() => handleImagePosition('object-center')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-center' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}><Minus size={16} /><span className="text-[9px] font-bold mt-1">Centro</span></button><button onClick={() => handleImagePosition('object-bottom')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${currentPos === 'object-bottom' ? 'bg-white dark:bg-brand-dark-card shadow-sm text-brand-purple border border-gray-200 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}><ArrowDown size={16} /><span className="text-[9px] font-bold mt-1">Abajo</span></button></div></div>
                </>
            )}

            <div className="flex items-center space-x-2 text-brand-purple border-b border-gray-100 dark:border-white/5 pb-2 pt-2"><TypeIcon size={16} /><h3 className="text-xs font-black uppercase">Información Textual</h3></div>

            {editingItem.type !== 'config' ? (
                <>
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Título</label><input type="text" value={isEditingResource ? currentResource.title : editingItem.title} onChange={(e) => { if (isEditingResource) { const updated = [...editingItem.resources]; updated[editingResourceIndex] = { ...currentResource, title: e.target.value }; setEditingItem({ ...editingItem, resources: updated }); } else { setEditingItem({...editingItem, title: e.target.value}); } }} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white focus:border-brand-purple outline-none" /></div>
                    {!isEditingResource && (<div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">{editingItem.type === 'banner' ? 'Subtítulo' : 'Descripción Corta'}</label><textarea value={editingItem.subtitle || editingItem.description || ''} onChange={(e) => { const key = editingItem.type === 'banner' ? 'subtitle' : 'description'; setEditingItem({...editingItem, [key]: e.target.value}); }} rows={2} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium dark:text-white focus:border-brand-purple outline-none resize-none" /></div>)}
                </>
            ) : (
                <>
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Saludo de Bienvenida</label><input type="text" value={editingItem.welcomeText || ''} onChange={(e) => setEditingItem({...editingItem, welcomeText: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white focus:border-brand-purple outline-none" placeholder="Ej: Bienvenido de nuevo," /></div>
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Título de Sección Módulos</label><input type="text" value={editingItem.modulesTitle || ''} onChange={(e) => setEditingItem({...editingItem, modulesTitle: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-bold dark:text-white focus:border-brand-purple outline-none" placeholder="Ej: Módulos de Capacitación" /></div>
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Subtítulo de Sección</label><textarea value={editingItem.modulesSubtitle || ''} onChange={(e) => setEditingItem({...editingItem, modulesSubtitle: e.target.value})} rows={2} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm font-medium dark:text-white focus:border-brand-purple outline-none resize-none" placeholder="Ej: Elige el módulo relacionado con tu duda" /></div>
                </>
            )}

            {/* Content Logic Same as before */}
            {editingItem.type === 'module' && !isEditingResource && (
                <><div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Contenido Detallado</label><textarea value={editingItem.textContent || ''} onChange={(e) => setEditingItem({...editingItem, textContent: e.target.value})} rows={5} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-medium dark:text-white focus:border-brand-purple outline-none resize-none leading-relaxed" placeholder="Texto completo que aparece dentro del módulo..." /></div></>
            )}
            
            {editingItem.type === 'module' && !isEditingResource && editingItem.resources && editingItem.resources.length > 0 && (
                 <div className="pt-4 border-t border-gray-100 dark:border-white/5"><div className="flex items-center space-x-2 text-brand-purple mb-4"><CreditCard size={16} /><h3 className="text-xs font-black uppercase">Tarjetas de la Página (Recursos)</h3></div><div className="space-y-2">{editingItem.resources.map((res: TrainingResource, idx: number) => (<button key={idx} onClick={() => setEditingResourceIndex(idx)} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 hover:border-brand-purple transition-all group"><div className="flex items-center space-x-3"><div className={`w-3 h-3 rounded-full ${res.style?.bg || 'bg-gray-400'}`}></div><span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{res.title}</span></div><Edit3 size={14} className="text-gray-400 group-hover:text-brand-purple" /></button>))}</div></div>
            )}

            {isEditingResource && (
                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    {/* ... (Style editor logic) ... */}
                    <div className="flex items-center space-x-2 text-brand-purple mb-4"><Palette size={16} /><h3 className="text-xs font-black uppercase">Personalizar Tarjeta Seleccionada</h3></div>
                    {/* Preview logic */}
                    {isEditingResource && (
                         <div className="mb-6"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Previsualización de Tarjeta de Color</label><div className="relative w-full h-32 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-gray-300 dark:border-white/10 p-4"><div className={`relative flex flex-col justify-between p-3 h-24 w-full max-w-[200px] text-left rounded-sm shadow-md ${currentStyle.shadow || 'shadow-gray-500/30'} overflow-hidden`}><img src={currentResource.imageUrl || editingItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0" onError={(e) => (e.currentTarget.style.display = 'none')} /><div className={`absolute inset-0 z-10 ${currentStyle.bg || 'bg-gray-500'}`} style={{ opacity: currentStyle.cardOpacity !== undefined ? currentStyle.cardOpacity : 1 }}></div>{(() => { const Icon = getIconComponent(currentStyle.iconName || 'Folder'); return (<><div className="relative z-20 flex flex-col h-full justify-between"><div className="bg-white/20 w-fit p-1 rounded-[2px] backdrop-blur-sm"><Icon size={14} className="text-white" strokeWidth={3} /></div><span className="text-[11px] font-black uppercase leading-tight text-white tracking-wide pr-4">{currentResource.title}</span></div><div className="absolute -bottom-2 -right-2 opacity-20 text-white rotate-[-15deg] z-20"><Icon size={50} strokeWidth={1.5} /></div></>) })()}</div></div></div>
                    )}
                    <div className="mb-6"><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Elegir Color de Fondo</label><div className="flex flex-wrap gap-2">{COLOR_PALETTE.map((color, idx) => (<button key={idx} onClick={() => handleColorSelect(color)} className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform hover:scale-110 active:scale-95 ${color.bg.replace('bg-', 'bg-')} ${currentStyle?.bg === color.bg ? 'border-white ring-2 ring-brand-purple' : 'border-transparent'}`} title={color.name} />))}</div></div>
                    <div className="mb-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/5"><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase text-gray-400 flex items-center"><Droplet size={12} className="mr-1" /> Opacidad de Color</label><span className="text-[10px] font-bold text-brand-purple">{Math.round((currentStyle?.cardOpacity ?? 1) * 100)}%</span></div><input type="range" min="0" max="1" step="0.1" value={currentStyle?.cardOpacity ?? 1} onChange={handleOpacityChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple" /><div className="flex justify-between mt-1 text-[9px] text-gray-400 font-bold uppercase"><span>Transparente (Imagen)</span><span>Sólido (Color)</span></div></div>
                    <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Icono (Nombre Lucide)</label><input type="text" value={currentStyle?.iconName || ''} onChange={(e) => handleIconChange(e.target.value)} placeholder="Ej: PlayCircle" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-xs font-mono dark:text-white focus:border-brand-purple outline-none" /></div>
                </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <button onClick={handleSave} className="w-full bg-brand-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center shadow-xl active:scale-95 transition-all mt-4"><Save size={16} className="mr-2" /> Guardar Cambios</button>
         </div>
    </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-black transition-colors duration-300">
      <Header title="Editor Visual" showBack onBack={handleBack} />
      
      {/* ... (Preview Modal logic same as before) ... */}

      <div className="flex-1 overflow-y-auto scrollbar-hide pt-[calc(3.5rem+env(safe-area-inset-top))] px-6 pb-24">
        
        {/* BREADCRUMB HEADER */}
        <div className="mt-4 mb-6">
             {activeCategory ? (
                 <div className="flex flex-col">
                     <button onClick={handleBack} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 hover:text-brand-purple flex items-center">
                         <ChevronLeft size={12} className="mr-1" /> Volver
                     </button>
                     <h1 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-none">
                        {editingItem ? 'Editando' : (subCategory ? 'Selecciona' : (activeCategory === 'top3' ? 'Ranking' : 'Categoría'))}
                     </h1>
                     <p className="text-xs text-gray-500 font-medium">
                        {editingItem ? editingItem.title || editingItem.name : (subCategory || activeCategory)}
                     </p>
                 </div>
             ) : (
                <>
                    <h1 className="text-3xl font-black text-brand-black dark:text-white uppercase leading-none tracking-tighter mb-2">
                        Editor Visual
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Personaliza el contenido de la App
                    </p>
                </>
             )}
        </div>

        {/* MAIN CONTENT SWITCHER */}
        {!activeCategory && renderCategoryList()}
        {activeCategory && !editingItem && renderItemList()}
        {editingItem && renderEditor()}

      </div>
    </div>
  );
};

export default EditorDashboard;
