
import { TrainingModule, UserProfile } from './types';

// Incrementa este número para obligar a TODOS los usuarios a refrescar su perfil
export const DATA_VERSION = 3; 

// --- CONFIGURACIÓN PÚBLICA (NO SENSIBLE) ---
export const ONESIGNAL_APP_ID = "3bbf8972-d8cb-4eed-a46b-6059a4f71cd1"; // ID Público de la App

// --- SEGURIDAD: LISTA ELIMINADA ---
// La gestión de administradores ahora se realiza estrictamente vía Base de Datos (Firestore).
// No agregar correos aquí para evitar exposición en el código cliente.
export const ADMIN_EMAILS: string[] = [];

export const MOCK_USER: UserProfile = {
  name: "Alex Rivera",
  id: "AGENCY-8821",
  role: "Streamer Oficial",
  avatarUrl: "https://picsum.photos/200/200?random=user"
};

// Data for Salary Calculator
// CORREGIDO Y ORDENADO DE MAYOR A MENOR PARA QUE LA LÓGICA .find() FUNCIONE CORRECTAMENTE
export const SALARY_TIERS = [
  { seeds: 3000000, pay: 36786 },
  { seeds: 2000000, pay: 24024 },
  { seeds: 1500000, pay: 17543 },
  { seeds: 1000000, pay: 11562 },
  { seeds: 750000, pay: 9072 },
  { seeds: 500000, pay: 5931 },
  { seeds: 400000, pay: 4604 },
  { seeds: 300000, pay: 3409 },
  { seeds: 250000, pay: 2840 },
  { seeds: 200000, pay: 2272 }, 
  { seeds: 150000, pay: 1704 },
  { seeds: 100000, pay: 1136 }, 
  { seeds: 60000, pay: 708 },
  { seeds: 30000, pay: 354 },
  { seeds: 20000, pay: 236 },
  { seeds: 10000, pay: 122 },
  { seeds: 5000, pay: 58 },
  { seeds: 2000, pay: 23 },
];

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'bigo-live',
    title: '¿Qué es Bigo Live?',
    description: 'Introducción a la plataforma líder de streaming global.',
    imageUrl: 'https://i.postimg.cc/VvBmfwCq/grok-image-xwya1is.jpg',
    // URL ACTUALIZADA A FIREBASE MP4
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/streamers-academy-8c01d.firebasestorage.app/o/Videos%2FUnleash%20Your%20Story%20and%20Embark%20on%20a%20Global%20Journey%20with%20Bigo%20Live!%20%F0%9F%8C%8E%F0%9F%8E%99%EF%B8%8F%F0%9F%93%BD%EF%B8%8FJoin%20the%20%23BigoFam%20toda.mp4?alt=media&token=e1107b22-5702-4f38-bc09-241c2b2fd691', 
    textContent: 'Bigo Live es una plataforma de transmisión en vivo global que permite a los usuarios transmitir sus momentos favoritos, hacer amigos de todo el mundo y realizar videollamadas en vivo. Como streamer, tu objetivo es crear contenido entretenido, interactuar con tu audiencia en tiempo real y construir una comunidad sólida.'
  },
  {
    id: 'pagos',
    title: 'Pagos y Semillas',
    description: 'Entiende cómo monetizar y retirar tus ganancias.',
    imageUrl: 'https://i.postimg.cc/65zvGzJL/IMG_20251102_060134.png',
    videoUrl: '#',
    textContent: 'Los pagos en la plataforma se basan en "Semillas" (Beans). Los espectadores envían regalos virtuales que se convierten en semillas en tu cartera. 210 semillas equivalen aproximadamente a USD $1.00. El umbral mínimo de retiro suele ser de $31 USD. Los pagos se procesan a través de Payoneer o transferencia bancaria directa dependiendo de tu región.',
    resources: [
      { title: 'Tabla de pagos', type: 'table' },
      { title: 'Calculadora', type: 'calc' },
      { title: 'Retiro monedero', type: 'wallet' },
      { title: 'Cuenta Payoneer', type: 'card' },
      { title: 'Condiciones de remuneración', type: 'doc' },
    ]
  },
  {
    id: 'bloqueos',
    title: 'Bloqueos y Normas',
    description: 'Evita sanciones conociendo las reglas de comunidad.',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    videoUrl: '#',
    textContent: 'Existen bloqueos Clase A (permanentes) y Clase B (temporales). Prohibido terminantemente: fumar, mostrar armas, contenido sexual explícito, menores de edad solos en cámara, y promoción de otras plataformas. Mantén un ambiente positivo y evita el discurso de odio para mantener tu cuenta segura.'
  },
  {
    id: 'pk',
    title: 'Cómo hacer un PK',
    description: 'Batallas en vivo para aumentar tus ingresos.',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    videoUrl: '#',
    textContent: 'Un PK (Player Kill) es una batalla de streaming donde dos emisores compiten por quién recibe más regalos en un tiempo determinado. Para iniciar uno, presiona el botón "VS" en la esquina inferior. Los PKs son la mejor manera de activar a tus donadores, ya que la competencia incentiva el apoyo.'
  },
  {
    id: 'bonos',
    title: 'Bonos de Agencia',
    description: 'Metas mensuales y recompensas extra.',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    videoUrl: '#',
    textContent: 'Como streamer de agencia, tienes acceso a bonos por cumplimiento de metas. Las metas se basan en dos factores: Horas de transmisión mensual y cantidad de Semillas recibidas. Cumplir ambas te otorga un salario base adicional que se paga junto con tus ingresos normales.'
  },
  {
    id: 'seguridad',
    title: 'Seguridad de Cuenta',
    description: 'Protege tu perfil contra robos y hacks.',
    imageUrl: 'https://i.postimg.cc/tR1VMQyb/istockphoto-1474128019-612x612.jpg',
    videoUrl: '#',
    textContent: 'Nunca compartas tu contraseña ni códigos de verificación SMS con nadie, ni siquiera con alguien que diga ser "Soporte Oficial". Vincula tu número de teléfono y un correo electrónico secundario. Activa la verificación de dos pasos si está disponible.'
  },
  {
    id: 'funciones',
    title: 'Funciones de la App',
    description: 'Domina las herramientas de transmisión.',
    imageUrl: 'https://picsum.photos/800/600?random=7',
    videoUrl: '#',
    textContent: 'Aprende a usar los filtros de belleza, las máscaras, el panel de música, la gestión de administradores y cómo fijar comentarios. El uso correcto de la iluminación y los stickers puede aumentar la retención de audiencia hasta un 40%.'
  },
  {
    id: 'live-data',
    title: 'Live Data',
    description: 'Analiza tus estadísticas para crecer.',
    imageUrl: 'https://picsum.photos/800/600?random=8',
    videoUrl: '#',
    textContent: 'El centro de creadores te ofrece "Live Data". Aquí puedes ver tus picos de audiencia, nuevos seguidores por transmisión y duración promedio de visualización. Revisa estos datos semanalmente para entender qué horarios y qué tipo de contenido funcionan mejor.'
  }
];
