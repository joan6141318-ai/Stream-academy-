
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight, BrainCircuit, AlertCircle, Check, X, HelpCircle } from 'lucide-react';

// --- DATA: QUESTIONS BASED ON PROVIDED TEXT ---
const RAW_QUESTIONS = [
    {
        id: 1,
        question: "¿Qué es Bigo Live principalmente?",
        options: [
            { id: 'a', text: "Una red social para interactuar en tiempo real mediante transmisiones en vivo.", correct: true },
            { id: 'b', text: "Una aplicación exclusiva para editar videos cortos pregrabados.", correct: false },
            { id: 'c', text: "Una billetera virtual para criptomonedas y acciones.", correct: false }
        ]
    },
    {
        id: 2,
        question: "¿En qué dos factores se basa la monetización mensual?",
        options: [
            { id: 'a', text: "Cantidad de seguidores y likes en el perfil.", correct: false },
            { id: 'b', text: "Horas de transmisión y recaudación de semillas.", correct: true },
            { id: 'c', text: "Número de comentarios y veces compartido.", correct: false }
        ]
    },
    {
        id: 3,
        question: "¿Cuál es el valor de conversión oficial de las semillas?",
        options: [
            { id: 'a', text: "100 semillas = 1 USD", correct: false },
            { id: 'b', text: "210 semillas = 1 USD", correct: true },
            { id: 'c', text: "500 semillas = 1 USD", correct: false }
        ]
    },
    {
        id: 4,
        question: "¿Cuándo se deposita la remuneración mensual?",
        options: [
            { id: 'a', text: "Durante la primera semana de cada mes.", correct: true },
            { id: 'b', text: "El último día de cada mes.", correct: false },
            { id: 'c', text: "Inmediatamente después de cada transmisión.", correct: false }
        ]
    },
    {
        id: 5,
        question: "¿Cuál es el mínimo de horas mensuales para cumplir la meta?",
        options: [
            { id: 'a', text: "30 horas.", correct: false },
            { id: 'b', text: "60 horas.", correct: false },
            { id: 'c', text: "44 horas.", correct: true }
        ]
    },
    {
        id: 6,
        question: "¿Cuántas horas máximas se contabilizan por día para la meta?",
        options: [
            { id: 'a', text: "No hay límite diario.", correct: false },
            { id: 'b', text: "Máximo 2 horas por día.", correct: true },
            { id: 'c', text: "Máximo 4 horas por día.", correct: false }
        ]
    },
    {
        id: 7,
        question: "¿Cuánto debe durar una transmisión para ser válida?",
        options: [
            { id: 'a', text: "Al menos 30 minutos.", correct: true },
            { id: 'b', text: "Mínimo 1 hora completa.", correct: false },
            { id: 'c', text: "Cualquier duración cuenta.", correct: false }
        ]
    },
    {
        id: 8,
        question: "¿Qué métodos de retiro están disponibles?",
        options: [
            { id: 'a', text: "Solo transferencia bancaria local.", correct: false },
            { id: 'b', text: "Western Union y Cheque.", correct: false },
            { id: 'c', text: "Payoneer, PayPal y D-Local.", correct: true }
        ]
    },
    {
        id: 9,
        question: "¿Está permitido mostrar menores de edad en cámara?",
        options: [
            { id: 'a', text: "Sí, si están acompañados de un adulto.", correct: false },
            { id: 'b', text: "No, está estrictamente prohibido.", correct: true },
            { id: 'c', text: "Solo si es por poco tiempo.", correct: false }
        ]
    },
    {
        id: 10,
        question: "¿Qué sanción se aplica por faltas graves (como drogas o armas)?",
        options: [
            { id: 'a', text: "Una advertencia de 10 minutos.", correct: false },
            { id: 'b', text: "Inhabilitación de la cuenta por más de 1 año.", correct: true },
            { id: 'c', text: "Reducción de semillas.", correct: false }
        ]
    },
    {
        id: 11,
        question: "¿Para qué sirven los Puntos VIP en el sistema de bloqueos?",
        options: [
            { id: 'a', text: "Para comprar regalos más baratos.", correct: false },
            { id: 'b', text: "Para levantar algunos tipos de bloqueo.", correct: true },
            { id: 'c', text: "Para destacar en la página de inicio.", correct: false }
        ]
    },
    {
        id: 12,
        question: "¿Bigo solicita códigos de verificación por mensaje interno?",
        options: [
            { id: 'a', text: "Sí, para confirmar la identidad.", correct: false },
            { id: 'b', text: "A veces, en eventos especiales.", correct: false },
            { id: 'c', text: "Nunca.", correct: true }
        ]
    },
    {
        id: 13,
        question: "¿Quién es el único responsable de la seguridad de la cuenta?",
        options: [
            { id: 'a', text: "La agencia.", correct: false },
            { id: 'b', text: "El soporte técnico.", correct: false },
            { id: 'c', text: "El emisor.", correct: true }
        ]
    },
    {
        id: 14,
        question: "¿Se permite solicitar dinero por apps externas (PayPal/Nequi)?",
        options: [
            { id: 'a', text: "Sí, es decisión del emisor.", correct: false },
            { id: 'b', text: "No, está prohibido.", correct: true },
            { id: 'c', text: "Solo si se pone en el título del live.", correct: false }
        ]
    },
    {
        id: 15,
        question: "¿Qué sucede si el sistema determina que no hubo riesgo en una apelación?",
        options: [
            { id: 'a', text: "Puede desbloquear la cuenta.", correct: true },
            { id: 'b', text: "Otorga semillas de compensación.", correct: false },
            { id: 'c', text: "Reduce las horas de meta.", correct: false }
        ]
    }
];

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

  // --- LOGIC: SHUFFLE ---
  const startQuiz = () => {
      // Shuffle Questions
      const shuffledQ = [...RAW_QUESTIONS].sort(() => Math.random() - 0.5);
      
      // Shuffle Options inside each question
      const finalQuestions = shuffledQ.map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
      }));

      setQuestions(finalQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setWrongAnswers([]);
      setSelectedOption(null);
      setIsFinished(false);
      setIsPlaying(true);
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

  // --- RENDER: RESULTS SCREEN ---
  if (isFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      let status = { text: "Necesitas Estudiar", color: "text-red-500", bg: "bg-red-500" };
      if (percentage >= 90) status = { text: "¡Experto Total!", color: "text-green-500", bg: "bg-green-500" };
      else if (percentage >= 70) status = { text: "Conocimiento Sólido", color: "text-brand-purple", bg: "bg-brand-purple" };
      else if (percentage >= 50) status = { text: "Puedes Mejorar", color: "text-orange-500", bg: "bg-orange-500" };

      return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
            <Header title="Resultados" showBack onBack={() => navigate('/welcome')} />
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-[calc(3.5rem+env(safe-area-inset-top))]">
                
                {/* Score Card */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 text-center mb-8 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${status.bg}`}></div>
                    
                    <div className="mb-4 inline-flex items-center justify-center p-4 rounded-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 shadow-inner">
                        <Trophy size={40} className={status.color} />
                    </div>
                    
                    <h2 className="text-5xl font-black text-brand-black dark:text-white mb-1 tracking-tighter">{percentage}%</h2>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${status.color}`}>
                        {status.text}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl">
                            <span className="block text-xl font-black text-green-600">{score}</span>
                            <span className="text-[9px] font-bold text-green-800/60 uppercase">Aciertos</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">
                            <span className="block text-xl font-black text-red-500">{questions.length - score}</span>
                            <span className="text-[9px] font-bold text-red-800/60 uppercase">Errores</span>
                        </div>
                    </div>
                </div>

                {/* Wrong Answers List */}
                {wrongAnswers.length > 0 && (
                    <div className="mb-8 animate-slide-up">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <AlertCircle size={16} className="text-red-500" />
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Correcciones</h3>
                        </div>
                        <div className="space-y-3">
                            {wrongAnswers.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#111] p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pregunta</p>
                                    <p className="text-xs font-black text-brand-black dark:text-white mb-3 leading-tight">{item.q}</p>
                                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                                        <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase block">Respuesta Correcta</span>
                                            <span className="text-xs font-medium text-green-800 dark:text-green-200">{item.a}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={startQuiz}
                    className="w-full h-14 bg-brand-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
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
        <Header title={`Pregunta ${currentQuestionIndex + 1}/${questions.length}`} showBack onBack={() => navigate('/welcome')} />
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 mt-[calc(3.5rem+env(safe-area-inset-top))]">
            <div 
                className="h-full bg-brand-purple transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-24">
            <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
                
                {/* Question Card */}
                <div className="mt-4 mb-8">
                    <h2 className="text-xl font-black text-brand-black dark:text-white uppercase leading-tight tracking-tight mb-6">
                        {currentQ.question}
                    </h2>
                    
                    <div className="space-y-3">
                        {currentQ.options.map((opt: any) => {
                            let stateClass = "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-brand-black dark:text-white hover:border-gray-300";
                            let icon = null;

                            if (selectedOption) {
                                if (opt.correct) {
                                    stateClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30";
                                    icon = <CheckCircle2 size={20} className="text-white animate-bounce" />;
                                } else if (selectedOption === opt.id) {
                                    stateClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30";
                                    icon = <XCircle size={20} className="text-white animate-shake" />;
                                } else {
                                    stateClass = "bg-gray-100 dark:bg-white/5 border-transparent text-gray-400 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    disabled={!!selectedOption}
                                    onClick={() => handleAnswer(opt.id, opt.correct, currentQ.options.find((o:any) => o.correct)?.text)}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 active:scale-[0.98] ${stateClass}`}
                                >
                                    <span className="text-xs font-bold leading-snug pr-4">{opt.text}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
        
        {/* Footer Hint */}
        <div className="p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 gap-2">
            <HelpCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Selecciona la mejor opción</span>
        </div>
    </div>
  );
};

export default EvaluationQuiz;
