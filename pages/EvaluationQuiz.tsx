
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight, BrainCircuit, AlertCircle, Check, X, HelpCircle, ChevronRight, PartyPopper, Star, Zap, GraduationCap, ArrowUpRight } from 'lucide-react';

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

// Componente de Anillo de Progreso (Donut Chart) - Updated for better visuals
const CircularProgress = ({ percentage, colorClass }: { percentage: number, colorClass: string }) => {
    const radius = 55;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg height="100%" width="100%" viewBox="0 0 110 110" className="rotate-[-90deg]">
                <circle
                    stroke="currentColor"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx="55"
                    cy="55"
                    className="text-gray-100 dark:text-white/5"
                />
                <circle
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx="55"
                    cy="55"
                    className={colorClass}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-black text-brand-black dark:text-white leading-none tracking-tighter">
                    {percentage}<span className="text-lg text-gray-400">%</span>
                </span>
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
  
  // Results Animation State
  const [displayedScore, setDisplayedScore] = useState(0);

  // --- LOGIC: SHUFFLE ---
  const startQuiz = () => {
      // Shuffle Questions
      const shuffledQ = [...RAW_QUESTIONS].sort(() => Math.random() - 0.5);
      
      // Shuffle Options inside each question & Assign A/B/C labels dynamically based on new order
      const finalQuestions = shuffledQ.map(q => {
          const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          // Re-assign IDs to A, B, C for display purposes after shuffle
          const labeledOptions = shuffledOptions.map((opt, idx) => ({
              ...opt,
              id: String.fromCharCode(65 + idx) // 65 is 'A'
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
      if (selectedOption) return; // Prevent double click
      
      setSelectedOption(optionId);

      if (isCorrect) {
          setScore(prev => prev + 1);
      } else {
          // Guardar el error para el reporte final
          setWrongAnswers(prev => [...prev, {
              q: questions[currentQuestionIndex].question,
              a: correctText
          }]);
      }

      // Auto advance
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
          }, 300);
      }, 1500);
  };

  // Effect for counting up score
  useEffect(() => {
      if (isFinished) {
          const targetScore = Math.round((score / questions.length) * 100);
          let start = 0;
          const duration = 1500; // ms
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = targetScore / steps;

          const timer = setInterval(() => {
              start += increment;
              if (start >= targetScore) {
                  setDisplayedScore(targetScore);
                  clearInterval(timer);
              } else {
                  setDisplayedScore(Math.floor(start));
              }
          }, stepTime);
          return () => clearInterval(timer);
      }
  }, [isFinished, score, questions.length]);

  // --- RENDER: INTRO SCREEN ---
  if (!isPlaying && !isFinished) {
      return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            <Header title="Evaluación" showBack onBack={() => navigate('/welcome')} />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-2xl"></div>
                    <div className="relative bg-white dark:bg-[#1A1A1A] p-6 rounded-[2.5rem] shadow-2xl border-[5px] border-white dark:border-white/10">
                        <BrainCircuit size={64} className="text-brand-purple" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-pink-500">
                    Evaluación<br/>Mensual
                </h1>

                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-8 w-full max-w-xs">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        Demuestra tu conocimiento sobre las normas, monetización y seguridad de la plataforma. Tienes <strong>15 preguntas</strong> para probar que eres un experto.
                    </p>
                </div>

                <button 
                    onClick={startQuiz}
                    className="w-full max-w-xs h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Comenzar Test</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER: RESULTS SCREEN (REDESIGNED) ---
  if (isFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      let status = { text: "Necesitas Estudiar", color: "text-red-500", ringColor: "text-red-500", bg: "bg-red-50", icon: AlertCircle };
      let isHigh = false;

      if (percentage >= 90) {
          status = { text: "Experto Total", color: "text-green-500", ringColor: "text-green-500", bg: "bg-green-50", icon: Trophy };
          isHigh = true;
      } else if (percentage >= 70) {
          status = { text: "Conocimiento Sólido", color: "text-brand-purple", ringColor: "text-brand-purple", bg: "bg-purple-50", icon: GraduationCap };
          isHigh = true;
      } else if (percentage >= 50) {
          status = { text: "Puedes Mejorar", color: "text-orange-500", ringColor: "text-orange-500", bg: "bg-orange-50", icon: Zap };
      }

      return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            <Header title="Resultados" showBack onBack={() => navigate('/welcome')} />
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24">
                
                {/* --- HERO SCORE CARD --- */}
                <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 text-center mb-8 relative overflow-hidden group">
                    
                    {/* Dynamic Background Gradient (Subtle) */}
                    <div className={`absolute top-0 inset-x-0 h-32 ${status.bg} dark:bg-opacity-10 rounded-t-[2.5rem] transition-colors duration-500`}></div>

                    {/* Decor Icons (Background Only - z-0) */}
                    {isHigh && (
                        <>
                            <PartyPopper size={80} className="absolute -top-4 -left-4 text-brand-purple/10 rotate-12 z-0 pointer-events-none" />
                            <Star size={60} className="absolute top-10 -right-6 text-yellow-400/20 rotate-45 z-0 pointer-events-none" />
                        </>
                    )}

                    {/* Main Content (z-10) */}
                    <div className="relative z-10 flex flex-col items-center">
                        
                        {/* Rank Badge */}
                        <div className="inline-flex items-center gap-2 bg-white dark:bg-[#222] px-4 py-1.5 rounded-full shadow-sm mb-6 border border-gray-100 dark:border-white/5">
                            <status.icon size={14} className={status.color} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                {status.text}
                            </span>
                        </div>

                        {/* Chart */}
                        <div className="mb-6">
                            <CircularProgress percentage={displayedScore} colorClass={status.ringColor} />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-2xl flex flex-col items-center justify-center border border-green-100 dark:border-green-900/20">
                                <span className="text-xl font-black text-green-600 dark:text-green-400 leading-none mb-1">{score}</span>
                                <span className="text-[9px] font-bold text-green-800/50 dark:text-green-400/50 uppercase tracking-widest">Aciertos</span>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl flex flex-col items-center justify-center border border-red-100 dark:border-red-900/20">
                                <span className="text-xl font-black text-red-500 leading-none mb-1">{questions.length - score}</span>
                                <span className="text-[9px] font-bold text-red-800/50 dark:text-red-400/50 uppercase tracking-widest">Errores</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- WRONG ANSWERS SECTION --- */}
                {wrongAnswers.length > 0 && (
                    <div className="mb-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-100 dark:bg-red-900/20 p-1.5 rounded-full">
                                    <BrainCircuit size={14} className="text-red-500" />
                                </div>
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Áreas de Mejora</h3>
                            </div>
                            <span className="text-[9px] font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-gray-500">{wrongAnswers.length} Items</span>
                        </div>

                        <div className="space-y-4">
                            {wrongAnswers.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#111] p-5 rounded-2xl border-l-4 border-l-red-500 border-y border-r border-gray-100 dark:border-r-white/5 dark:border-y-white/5 shadow-sm relative overflow-hidden group">
                                    
                                    {/* Subtle Decor Icon */}
                                    <XCircle className="absolute right-[-10px] top-[-10px] text-red-500/5 rotate-12 pointer-events-none" size={100} />

                                    <div className="relative z-10">
                                        {/* Question */}
                                        <div className="mb-4">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Pregunta</span>
                                            <p className="text-sm font-bold text-brand-black dark:text-white leading-snug">
                                                {item.q}
                                            </p>
                                        </div>
                                        
                                        {/* Correction Block */}
                                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-900/20 flex items-start gap-3">
                                            <div className="mt-0.5 bg-green-200 dark:bg-green-800 rounded-full p-0.5">
                                                <Check size={10} className="text-green-700 dark:text-green-100" strokeWidth={4} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest block mb-0.5">Solución</span>
                                                <p className="text-xs font-bold text-green-800 dark:text-green-100 leading-tight">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- FOOTER ACTION --- */}
                <button 
                    onClick={startQuiz}
                    className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mb-4 hover:opacity-90"
                >
                    <RefreshCw size={16} />
                    <span>Intentar de Nuevo</span>
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER: QUESTION SCREEN ---
  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
        
        {/* Simplified Header with Progress */}
        <div className="pt-safe bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
            <div className="px-4 h-14 flex items-center justify-between">
                <button onClick={() => navigate('/welcome')} className="w-8 h-8 flex items-center justify-center -ml-2 text-gray-400">
                    <X size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pregunta</span>
                    <span className="text-sm font-black text-brand-black dark:text-white leading-none">
                        {currentQuestionIndex + 1} <span className="text-gray-300">/</span> {questions.length}
                    </span>
                </div>
                <div className="w-8"></div>
            </div>
            {/* Progress Line */}
            <div className="w-full h-1 bg-gray-100 dark:bg-white/10">
                <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-pink-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-24 flex flex-col justify-center min-h-0">
            <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                
                {/* HERO QUESTION */}
                <div className="mb-10 text-center px-2">
                    <h2 className="text-2xl font-black text-brand-black dark:text-white uppercase leading-tight tracking-tight drop-shadow-sm">
                        {currentQ.question}
                    </h2>
                </div>
                
                {/* OPTIONS LIST */}
                <div className="space-y-4">
                    {currentQ.options.map((opt: any, index: number) => {
                        let stateClass = "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-purple/50";
                        let badgeClass = "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400";
                        let icon = null;

                        if (selectedOption) {
                            if (opt.correct) {
                                stateClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 shadow-lg shadow-green-500/10";
                                badgeClass = "bg-green-500 text-white";
                                icon = <CheckCircle2 size={18} className="text-green-500 animate-bounce" />;
                            } else if (selectedOption === opt.id) {
                                stateClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
                                badgeClass = "bg-red-500 text-white";
                                icon = <XCircle size={18} className="text-red-500 animate-shake" />;
                            } else {
                                stateClass = "bg-gray-50 dark:bg-black/20 border-transparent text-gray-300 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={opt.id}
                                disabled={!!selectedOption}
                                onClick={() => handleAnswer(opt.id, opt.correct, currentQ.options.find((o:any) => o.correct)?.text)}
                                style={{ animationDelay: `${index * 100}ms` }}
                                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 active:scale-[0.98] group animate-slide-up ${stateClass}`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Option Badge (A, B, C) */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${badgeClass} group-hover:scale-105 duration-200`}>
                                        {opt.id}
                                    </div>
                                    <span className="text-xs font-bold leading-snug">{opt.text}</span>
                                </div>
                                {icon}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
        
        {/* Footer Hint */}
        <div className="p-6 bg-[#FAFAFA] dark:bg-black flex items-center justify-center text-gray-400 gap-2 pb-safe">
            <HelpCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Selecciona la mejor opción</span>
        </div>
    </div>
  );
};

export default EvaluationQuiz;
