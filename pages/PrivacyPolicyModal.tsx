
import React from 'react';
import { X, ShieldCheck, Lock, Globe, Copyright } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/40">
            <div className="flex items-center space-x-3">
                <div className="bg-brand-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                    <ShieldCheck size={20} strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase text-brand-black dark:text-white leading-none">Aviso de Privacidad</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Términos y Condiciones</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-justify">
            
            {/* 1. Introducción */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple mb-2 flex items-center">
                    <Globe size={14} className="mr-2" /> 1. Introducción y Funcionalidad
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    La presente plataforma, desarrollada y operada por <strong>Grupo Moon</strong>, tiene como finalidad exclusiva la capacitación, gestión y optimización de recursos para creadores de contenido y emisores. Las herramientas aquí proporcionadas (calculadoras, tablas, guías) son de uso interno y formativo.
                </p>
            </section>

            {/* 2. Protección de Datos */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple mb-2 flex items-center">
                    <Lock size={14} className="mr-2" /> 2. Seguridad de la Información
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-2">
                    En cumplimiento con los estándares internacionales de protección de datos, informamos que:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    <li>La información recopilada (nombres, correos electrónicos, imágenes de perfil y datos de actividad) se aloja en servidores seguros protegidos por la infraestructura de <strong>Google Cloud Platform (Firebase)</strong>.</li>
                    <li>Se utilizan protocolos de encriptación estándar (SSL/TLS) para la transmisión de datos.</li>
                    <li>Las contraseñas y claves sensibles son almacenadas mediante hashing criptográfico (SHA-256) y nunca en texto plano.</li>
                </ul>
            </section>

            {/* 3. Propiedad Intelectual de Terceros (BIGO) */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple mb-2">
                    3. Marcas de Terceros
                </h3>
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        Los logotipos, nombres comerciales y referencias a <strong>"Bigo Live"</strong> que aparecen en esta aplicación son utilizados con fines <strong>meramente informativos, educativos y de referencia</strong>. Dichos activos son propiedad exclusiva de Bigo Technology Pte. Ltd. Esta aplicación no reclama propiedad sobre dichas marcas ni implica una afiliación corporativa directa más allá de la gestión de agencia.
                    </p>
                </div>
            </section>

            {/* 4. Propiedad Intelectual Propia (MOON) */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple mb-2 flex items-center">
                    <Copyright size={14} className="mr-2" /> 4. Propiedad Intelectual
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    Los nombres, logotipos, diseños, código fuente y metodologías asociados a:
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-1 text-xs font-bold text-brand-black dark:text-white uppercase tracking-wide pl-4 border-l-2 border-brand-purple">
                    <li>• Agency Moon</li>
                    <li>• Streamers Academy</li>
                    <li>• Capacitamoon</li>
                    <li>• Grupo Moon</li>
                </ul>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mt-2">
                    Son propiedad intelectual exclusiva de <strong>Grupo Moon</strong> y sus desarrolladores. Queda prohibida su reproducción total o parcial sin autorización escrita.
                </p>
            </section>

            {/* 5. Cláusula de Opt-Out y Acceso */}
            <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple mb-2">
                    5. Derechos del Usuario y Limitación de Acceso
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-2">
                    El uso de esta aplicación requiere el registro de información básica para personalizar la experiencia de capacitación.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                        En caso de que el usuario no desee proporcionar dicha información, puede solicitar al equipo de soporte un método de acceso alternativo o directo a la información pública. Sin embargo, <strong>los desarrolladores se reservan el derecho de restringir el acceso</strong> a herramientas avanzadas (calculadoras, simuladores, PKs) que requieran técnicamente dichos datos para funcionar.
                    </p>
                </div>
            </section>

            {/* Footer Legal */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                    Última actualización: Noviembre 2025 • Departamento Legal Grupo Moon
                </p>
            </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212]">
            <button 
                onClick={onClose}
                className="w-full bg-brand-black dark:bg-white text-white dark:text-black h-12 rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform"
            >
                Entendido y Aceptar
            </button>
        </div>
      </div>
    </div>
  );
};
