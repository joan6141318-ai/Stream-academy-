
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight, BrainCircuit, AlertCircle, Check, X, HelpCircle, Share2, Award, Zap, BarChart3, PartyPopper } from 'lucide-react';

// --- DATA: QUESTIONS BASED ON PROVIDED TEXT ---
const RAW_QUESTIONS = [
    {
        id: 1,
        question: "¿Qué es Bigo Live principalmente?",
        options: [
            { id: 'A', text: "Una red social para interactuar en tiempo real mediante transmisiones en vivo.", correct: true },
            { id: 'B', text: "Una aplicación exclusiva para editar videos cortos pregrabados.", correct: false },
            { id: 'C', text: "Una billetera virtual para criptomonedas y acciones.", correct: false }
        ]
    },
    {
        id: 2,
        question: "¿En qué dos factores se basa la monetización mensual?",
        options: [
            { id: 'A', text: "Cantidad de seguidores y likes en el perfil.", correct: false },
            { id: 'B', text: "Horas de transmisión y recaudación de semillas.", correct: true },
            { id: 'C', text: "Número de comentarios y veces compartido.", correct: false }
        ]
    },
    {
        id: 3,
        question: "¿Cuál es el valor de conversión oficial de las semillas?",
        options: [
            { id: 'A', text: "100 semillas = 1 USD", correct: false },
            { id: 'B', text: "210 semillas = 1 USD", correct: true },
            { id: 'C', text: "500 semillas = 1 USD", correct: false }
        ]
    },
    {
        id: 4,
        question: "¿Cuándo se deposita la remuneración mensual?",
        options: [
            { id: 'A', text: "Durante la primera semana de cada mes.", correct: true },
            { id: 'B', text: "El último día de cada mes.", correct: false },
            { id: 'C', text: "Inmediatamente después de cada transmisión.", correct: false }
        ]
    },
    {
        id: 5,
        question: "¿Cuál es el mínimo de horas mensuales para cumplir la meta?",
        options: [
            { id: 'A', text: "30 horas.", correct: false },
            { id: 'B', text: "60 horas.", correct: false },
            { id: 'C', text: "44 horas.", correct: true }
        ]
    },
    {
        id: 6,
        question: "¿Cuántas horas máximas se contabilizan por día para la meta?",
        options: [
            { id: 'A', text: "No hay límite diario.", correct: false },
            { id: 'B', text: "Máximo 2 horas por día.", correct: true },
            { id: 'C', text: "Máximo 4 horas por día.", correct: false }
        ]
    },
    {
        id: 7,
        question: "¿Cuánto debe durar una transmisión para ser válida?",
        options: [
            { id: 'A', text: "Al menos 30 minutos.", correct: true },
            { id: 'B', text: "Mínimo 1 hora completa.", correct: false },
            { id: 'C', text: "Cualquier duración cuenta.", correct: false }
        ]
    },
    {
        id: 8,
        question: "¿Qué métodos de retiro están disponibles?",
        options: [
            { id: 'A', text: "Solo transferencia bancaria local.", correct: false },
            { id: 'B', text: "Western Union y Cheque.", correct: false },
            { id: 'C', text: "Payoneer, PayPal y D-Local.", correct: true }
        ]
    },
    {
        id: 9,
        question: "¿Está permitido mostrar menores de edad en cámara?",
        options: [
            { id: 'A', text: "Sí, si están acompañados de un adulto.", correct: false },
            { id: 'B', text: "No, está estrictamente prohibido.", correct: true },
            { id: 'C', text: "Solo si es por poco tiempo.", correct: false }
        ]
    },
    {
        id: 10,
        question: "¿Qué sanción se aplica por faltas graves (como drogas o armas)?",
        options: [
            { id: 'A', text: "Una advertencia de 10 minutos.", correct: false },
            { id: 'B', text: "Inhabilitación de la cuenta por más de 1 año.", correct: true },
            { id: 'C', text: "Reducción de semillas.", correct: false }
        ]
    },
    {
        id: 11,
        question: "¿Para qué sirven los Puntos VIP en el sistema de bloqueos?",
        options: [
            { id: 'A', text: "Para comprar regalos más baratos.", correct: false },
            { id: 'B', text: "Para levantar algunos tipos de bloqueo.", correct: true },
            { id: 'C', text: "Para destacar en la página de inicio.", correct: false }
        ]
    },
    {
        id: 12,
        question: "¿Bigo solicita códigos de verificación por mensaje interno?",
        options: [
            { id: 'A', text: "Sí, para confirmar la identidad.", correct: false },
            { id: 'B', text: "A veces, en eventos especiales.", correct: false },
            { id: 'C', text: "Nunca.", correct: true }
        ]
    },
    {
        id: 13,
        question: "¿Quién es el único responsable de la seguridad de la cuenta?",
        options: [
            { id: 'A', text: "La agencia.", correct: false },
            { id: 'B', text: "El soporte técnico.", correct: false },
            { id: 'C', text: "El emisor.", correct: true }
        ]
    },
    {
        id: 14,
        question: "¿Se permite solicitar dinero por apps externas (PayPal/Nequi)?",
        options: [
            { id: 'A', text: "Sí, es decisión del emisor.", correct: false },
            { id: 'B', text: "No, está prohibido.", correct: true },
            { id: 'C', text: "Solo si se pone en el título del live.", correct: false }
        ]
    },
    {
        id: 15,
        question: "¿Qué sucede si el sistema determina que no hubo riesgo en una apelación?",
        options: [
            { id: 'A', text: "Puede desbloquear la cuenta.", correct: true },
            { id: 'B', text: "Otorga semillas de compensación.", correct: false },
            { id: 'C', text: "Reduce las horas de meta.", correct: false }
        ]
    }
];

// Modern Circular Progress with Gradient
const CircularProgress = ({ percentage, colorClass }: { percentage: number, colorClass: string }) => {
    const radius = 65;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48 drop-shadow-2xl">
            <svg height="100%" width="100%" viewBox="0 0 130 130" className="rotate-[-90deg]">
                {/* Background Track */}
                <circle
                    stroke="currentColor"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx="65"
                    cy="65"
                    className="text-black/10 dark:text-white/5"
                />
                {/* Foreground Progress */}
                <circle
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx="65"
                    cy="65"
                    className={colorClass}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-black text-brand-black dark:text-white leading-none tracking-tighter">
                    {percentage}<span className="text-2xl align-top">%</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Precisión</span>
            </div>
        </div>
    );
};

const EvaluationQuiz: React.FC = () => {
  const navigate = useNavigate();
  
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [displayedScore, setDisplayedScore] = useState(0);

  // --- LOGIC: SHUFFLE ---
  const startQuiz = () => {
      const shuffledQ = [...RAW_QUESTIONS].sort(() => Math.random() - 0.5);
      const finalQuestions = shuffledQ.map(q => {
          const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          const labeledOptions = shuffledOptions.map((opt, idx) => ({
              ...opt,
              id: String.fromCharCode(65 + idx)
          }));
          return { ...q, options: labeledOptions };
      });

      setQuestions(finalQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setWrongAnswers([]);
      setSelectedOption(null);
      setIsFinished(false);
      setIsPlaying(true);
      setDisplayedScore(0);
  };

  const handleAnswer = (optionId: string, isCorrect: boolean, correctText: string) => {
      if (selectedOption) return; 
      
      setSelectedOption(optionId);

      if (isCorrect) {
          setScore(prev => prev + 1);
      } else {
          setWrongAnswers(prev => [...prev, {
              q: questions[currentQuestionIndex].question,
              a: correctText
          }]);
      }

      setTimeout(() => {
          setIsAnimating(true);
          setTimeout(() => {
              if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                  setSelectedOption(null);
                  setIsAnimating(false);
              } else {
                  setIsFinished(true);
                  setIsPlaying(false);
                  setIsAnimating(false);
              }
          }, 200);
      }, 1200); // Tiempos ajustados para disfrutar la animación
  };

  // Score Animation
  useEffect(() => {
      if (isFinished) {
          const targetScore = Math.round((score / questions.length) * 100);
          let start = 0;
          const timer = setInterval(() => {
              start += 1;
              if (start >= targetScore) {
                  setDisplayedScore(targetScore);
                  clearInterval(timer);
              } else {
                  setDisplayedScore(start);
              }
          }, 10);
          return () => clearInterval(timer);
      }
  }, [isFinished, score, questions.length]);

  // --- RENDER: INTRO SCREEN ---
  if (!isPlaying && !isFinished) {
      return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            <Header title="Evaluación" showBack onBack={() => navigate('/welcome')} />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative mb-10 z-10">
                    <div className="w-24 h-24 bg-white dark:bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center shadow-2xl border-[3px] border-gray-100 dark:border-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <BrainCircuit size={48} className="text-brand-purple" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-brand-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                        Examen
                    </div>
                </div>

                <h1 className="text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-transparent bg-clip-text bg-gradient-to-br from-brand-purple to-pink-600 relative z-10">
                    Certificación<br/>Mensual
                </h1>

                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mb-10 relative z-10">
                    Demuestra tu dominio sobre las normas, monetización y seguridad de la plataforma.
                </p>

                <button 
                    onClick={startQuiz}
                    className="w-full max-w-xs h-16 bg-brand-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-black/20 dark:shadow-white/10 active:scale-95 transition-all flex items-center justify-center gap-3 group relative z-10"
                >
                    <span>Iniciar Test</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER: RESULTS SCREEN (PREMIUM DASHBOARD) ---
  if (isFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      let config = { 
          title: "Inténtalo de Nuevo", 
          msg: "Repasa los módulos antes de volver a intentarlo.",
          color: "text-red-500", 
          ringColor: "text-red-500",
          icon: AlertCircle,
          bgGradient: "from-red-500/20 to-orange-500/20"
      };

      if (percentage >= 90) {
          config = { 
              title: "¡Experto Certificado!", 
              msg: "Has demostrado un dominio total de la plataforma.",
              color: "text-emerald-500", 
              ringColor: "text-emerald-500",
              icon: Trophy,
              bgGradient: "from-emerald-500/20 to-teal-500/20"
          };
      } else if (percentage >= 70) {
          config = { 
              title: "Conocimiento Sólido", 
              msg: "Tienes las bases claras, afina los detalles.",
              color: "text-brand-purple", 
              ringColor: "text-brand-purple",
              icon: Award,
              bgGradient: "from-purple-500/20 to-pink-500/20"
          };
      }

      return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            <Header title="Reporte Final" showBack onBack={() => navigate('/welcome')} />
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
                
                {/* --- HERO DASHBOARD CARD --- */}
                <div className="bg-white dark:bg-[#121212] rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5 mb-8 relative overflow-hidden text-center mt-4">
                    {/* Background Glow */}
                    <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${config.bgGradient} opacity-50 blur-3xl pointer-events-none`}></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-6 scale-110">
                            <CircularProgress percentage={displayedScore} colorClass={config.ringColor} />
                        </div>

                        <h2 className={`text-2xl font-black uppercase tracking-tight leading-none mb-2 ${config.color}`}>
                            {config.title}
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed">
                            {config.msg}
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full mt-8">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-gray-100 dark:border-white/5">
                                <div className="text-emerald-500 mb-1"><CheckCircle2 size={20} /></div>
                                <span className="text-2xl font-black text-brand-black dark:text-white">{score}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Correctas</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-gray-100 dark:border-white/5">
                                <div className="text-red-500 mb-1"><XCircle size={20} /></div>
                                <span className="text-2xl font-black text-brand-black dark:text-white">{questions.length - score}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fallos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- INSIGHTS / CORRECTIONS --- */}
                {wrongAnswers.length > 0 ? (
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <BrainCircuit size={16} className="text-brand-purple" />
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Correcciones Clave</h3>
                        </div>
                        <div className="space-y-4">
                            {wrongAnswers.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#121212] p-5 rounded-[1.5rem] border-l-4 border-l-red-500 border-y border-r border-gray-100 dark:border-r-white/5 dark:border-y-white/5 shadow-sm relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">Pregunta</p>
                                        <p className="text-xs font-bold text-brand-black dark:text-white mb-4 leading-relaxed">
                                            {item.q}
                                        </p>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-3">
                                            <Check size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={3} />
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Respuesta Correcta</p>
                                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-100 leading-snug">{item.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 text-center animate-slide-up">
                        <PartyPopper size={32} className="text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-300 uppercase leading-none mb-1">¡Sin Errores!</h3>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">Un resultado impecable.</p>
                    </div>
                )}

                <div className="h-8"></div> {/* Spacer */}

                <button 
                    onClick={startQuiz}
                    className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
                >
                    <RefreshCw size={16} />
                    <span>Volver a Intentar</span>
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER: QUESTION SCREEN (IMPROVED INTERACTION) ---
  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] dark:bg-black transition-colors duration-300">
        
        {/* Progress Header */}
        <div className="pt-safe bg-white/90 dark:bg-black/90 backdrop-blur-xl sticky top-0 z-30">
            <div className="px-6 h-16 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                <button onClick={() => navigate('/welcome')} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors">
                    <X size={22} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Pregunta</span>
                    <span className="text-sm font-black text-brand-black dark:text-white leading-none">
                        <span className="text-brand-purple">{currentQuestionIndex + 1}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        {questions.length}
                    </span>
                </div>
                <div className="w-8"></div>
            </div>
            {/* Smooth Progress Bar */}
            <div className="w-full h-1 bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-pink-500 transition-all duration-500 ease-out rounded-r-full" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-32 flex flex-col justify-center min-h-0 relative">
            <div className={`transition-all duration-500 transform ${isAnimating ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
                
                {/* HERO QUESTION */}
                <div className="mb-10 px-2">
                    <h2 className="text-2xl md:text-3xl font-black text-brand-black dark:text-white uppercase leading-tight tracking-tight drop-shadow-sm text-left">
                        {currentQ.question}
                    </h2>
                </div>
                
                {/* COLOR-FLOOD OPTIONS LIST */}
                <div className="space-y-4">
                    {currentQ.options.map((opt: any, index: number) => {
                        const isSelected = selectedOption === opt.id;
                        const showResult = !!selectedOption;
                        const isCorrect = opt.correct;

                        // Base Style
                        let containerClass = "relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 transform group overflow-hidden";
                        let badgeClass = "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors duration-300 z-10";
                        let textClass = "text-sm font-bold leading-snug z-10 relative transition-colors duration-300";
                        let icon = null;

                        if (showResult) {
                            if (isCorrect) {
                                // CORRECT STATE: GREEN FLOOD
                                containerClass += " bg-emerald-500 border-emerald-500 shadow-xl shadow-emerald-500/40 scale-[1.02]";
                                badgeClass += " bg-white text-emerald-600";
                                textClass += " text-white";
                                icon = <CheckCircle2 size={24} className="text-white animate-[bounce_0.5s_ease-in-out] z-10" strokeWidth={3} />;
                            } else if (isSelected && !isCorrect) {
                                // WRONG STATE: RED FLOOD
                                containerClass += " bg-rose-500 border-rose-500 shadow-xl shadow-rose-500/40 shake-animation";
                                badgeClass += " bg-white text-rose-600";
                                textClass += " text-white";
                                icon = <XCircle size={24} className="text-white animate-pulse z-10" strokeWidth={3} />;
                            } else {
                                // UNSELECTED STATE: FADE
                                containerClass += " bg-gray-50 dark:bg-white/5 border-transparent opacity-40 blur-[1px]";
                                badgeClass += " bg-gray-200 dark:bg-white/10 text-gray-400";
                                textClass += " text-gray-400";
                            }
                        } else {
                            // DEFAULT STATE
                            containerClass += " bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-white/10 hover:border-brand-purple dark:hover:border-brand-purple active:scale-[0.98] shadow-sm hover:shadow-md";
                            badgeClass += " bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-brand-purple group-hover:text-white";
                            textClass += " text-gray-600 dark:text-gray-300 group-hover:text-brand-black dark:group-hover:text-white";
                        }

                        return (
                            <button
                                key={opt.id}
                                disabled={!!selectedOption}
                                onClick={() => handleAnswer(opt.id, opt.correct, currentQ.options.find((o:any) => o.correct)?.text)}
                                style={{ animationDelay: `${index * 75}ms` }}
                                className={`${containerClass} animate-slide-up flex items-center justify-between gap-4`}
                            >
                                {/* Fill Animation Background (Optional subtle gradient) */}
                                {showResult && (isSelected || isCorrect) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                                )}

                                <div className="flex items-center gap-4 flex-1">
                                    <div className={badgeClass}>
                                        {opt.id}
                                    </div>
                                    <span className={textClass}>{opt.text}</span>
                                </div>
                                {icon}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
        
        {/* Footer Hint */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FA] dark:from-black to-transparent pointer-events-none flex justify-center pb-safe">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-2">
                <HelpCircle size={12} className="text-gray-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Selecciona la mejor opción</span>
            </div>
        </div>

        <style>{`
            .shake-animation {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        `}</style>
    </div>
  );
};

export default EvaluationQuiz;