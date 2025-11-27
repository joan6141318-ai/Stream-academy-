import React, { useRef, useEffect, useState } from 'react';
import { Header } from '../components/Header.jsx';
import { Trophy, RefreshCw, Volume2, VolumeX, Pause, Play, ChevronUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameRunTool = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const jumpRef = useRef(false);
  const pausedRef = useRef(false);
  const audioCtxRef = useRef(null);
  const animationFrameRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const SPEED = 5;
  const GROUND_HEIGHT = 15;

  const astronautImg = useRef(null);
  
  useEffect(() => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = 'https://i.postimg.cc/2jnYM4LB/1763535410226.png';
      astronautImg.current = img;
  }, []);

  const playSound = (type) => {
    if (isMuted) return;
    try {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'closed') return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'jump') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(300, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'collect') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        }
    } catch (e) {
        console.warn("Audio playback failed", e);
    }
  };

  const handleRestart = () => {
    playSound('click');
    setGameKey(prev => prev + 1);
    setGameStarted(false);
    setIsGameOver(false);
    setScore(0);
    pausedRef.current = false;
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isGameOver) return;
    playSound('click');
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  };

  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  const triggerJump = (e) => {
    if (e) {
        if (e.type === 'touchstart') {
            e.preventDefault(); 
            e.stopPropagation();
        }
    }
    
    if (isGameOver) return;
    
    if (!pausedRef.current) {
        jumpRef.current = true;
        if (!gameStarted) setGameStarted(true);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) { 
        canvas.width = parent.clientWidth; 
        canvas.height = parent.clientHeight; 
    }

    let frameCount = 0;
    let playerY = canvas.height - GROUND_HEIGHT - 30;
    let playerVelocityY = 0;
    let isJumping = false;
    let currentScore = 0;
    let obstacles = [];
    let gems = [];
    let stars = [];
    let gameState = 'playing';

    for (let i = 0; i < 50; i++) {
        stars.push({ x: Math.random()*canvas.width, y: Math.random()*(canvas.height-GROUND_HEIGHT), size: Math.random()*2+0.5, speed: Math.random()*0.5+0.1 });
    }

    const drawAstronaut = (x, y) => {
        let runBobOffset = 0;
        if (!isJumping && gameState === 'playing' && !pausedRef.current) {
            runBobOffset = Math.sin(frameCount * 0.3) * 3; 
        }
        
        try {
            if (astronautImg.current && astronautImg.current.complete && astronautImg.current.naturalWidth !== 0) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(astronautImg.current, x - 17, (y - 34) + runBobOffset, 64, 64);
            } else {
                ctx.fillStyle = '#FFFFFF'; 
                ctx.fillRect(x, y, 30, 30);
            }
        } catch (e) {
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(x, y, 30, 30);
        }
    };

    const drawObstacle = (o) => {
        ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(o.x,o.y+o.h); ctx.lineTo(o.x+o.w/2,o.y); ctx.lineTo(o.x+o.w,o.y+o.h); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(o.x+o.w/2,o.y+o.h-10,5,0,Math.PI*2); ctx.fill();
    };

    const drawGem = (g) => {
        ctx.fillStyle = '#d946ef'; ctx.shadowColor='#d946ef'; ctx.shadowBlur=15; ctx.beginPath(); ctx.moveTo(g.x+g.w/2,g.y); ctx.lineTo(g.x+g.w,g.y+g.h/2); ctx.lineTo(g.x+g.w/2,g.y+g.h); ctx.lineTo(g.x,g.y+g.h/2); ctx.fill(); ctx.shadowBlur=0;
    };

    const gameLoop = () => {
        if (!canvasRef.current) return;

        ctx.fillStyle = '#000000'; ctx.fillRect(0,0,canvas.width,canvas.height); 

        ctx.fillStyle='#ffffff';
        stars.forEach(star => {
            if(gameState==='playing' && !pausedRef.current) star.x-=star.speed;
            if(star.x<0) star.x=canvas.width;
            ctx.globalAlpha=Math.random()*0.5+0.5; ctx.beginPath(); ctx.arc(star.x,star.y,star.size,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1.0;
        });

        ctx.fillStyle='#1e293b'; ctx.fillRect(0,canvas.height-GROUND_HEIGHT,canvas.width,GROUND_HEIGHT);
        ctx.fillStyle='#7c3aed'; ctx.fillRect(0,canvas.height-GROUND_HEIGHT,canvas.width,2);

        if(gameState==='playing' && !pausedRef.current) {
            if(jumpRef.current && !isJumping) { 
                playerVelocityY = JUMP_FORCE; 
                isJumping = true; 
                jumpRef.current = false; 
                playSound('jump'); 
            }
            jumpRef.current = false;

            playerVelocityY += GRAVITY; playerY += playerVelocityY;
            if(playerY > canvas.height-GROUND_HEIGHT-30) { playerY=canvas.height-GROUND_HEIGHT-30; playerVelocityY=0; isJumping=false; }

            if(frameCount%120===0) { const h=Math.random()>0.5?30:50; obstacles.push({x:canvas.width,y:canvas.height-GROUND_HEIGHT-h,w:30,h:h}); }
            if(frameCount%150===0) { gems.push({x:canvas.width,y:canvas.height-GROUND_HEIGHT-90-(Math.random()*50),w:20,h:20,collected:false}); }

            for(let i=0; i<obstacles.length; i++) {
                obstacles[i].x-=SPEED;
                const pBox = { x: 50+5, y: playerY+5, w: 20, h: 25 }; const o = obstacles[i];
                if(pBox.x < o.x+o.w && pBox.x+pBox.w > o.x && pBox.y < o.y+o.h && pBox.y+pBox.h > o.y) {
                    gameState='gameover'; setIsGameOver(true); setHighScore(prev=>Math.max(prev,currentScore)); playSound('gameover');
                }
            }
            for(let i=0; i<gems.length; i++) {
                gems[i].x-=SPEED;
                if(!gems[i].collected) {
                     const pBox = { x:50, y:playerY, w:30, h:30 }; const g = gems[i];
                     if(pBox.x < g.x+g.w && pBox.x+pBox.w > g.x && pBox.y < g.y+g.h && pBox.y+pBox.h > g.y) {
                        gems[i].collected=true; currentScore+=50; setScore(currentScore); playSound('collect');
                    }
                }
            }
            obstacles = obstacles.filter(o=>o.x>-50); gems = gems.filter(g=>g.x>-50); frameCount++;
        }
        drawAstronaut(50,playerY); obstacles.forEach(drawObstacle); gems.forEach(g=>!g.collected && drawGem(g));
        
        if(pausedRef.current && gameState==='playing') { 
            ctx.fillStyle='rgba(0,0,0,0.5)'; 
            ctx.fillRect(0,0,canvas.width,canvas.height); 
        }
        
        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => { 
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); 
    };
  }, [gameKey]);

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300 relative">
      <Header title="Moon Runner" showBack transparent onBack={() => navigate('/tools/gamer')} />

      <div className="flex-1 overflow-hidden flex flex-col">
        
        <div className="w-full h-[45%] bg-black relative flex-shrink-0 border-b-4 border-brand-purple/50 shadow-2xl z-10">
            <canvas 
                ref={canvasRef} 
                className="block w-full h-full touch-none select-none cursor-pointer active:cursor-grabbing" 
                onTouchStart={triggerJump}
                onMouseDown={triggerJump}
            />
            <div className="absolute top-14 left-4 z-10 flex space-x-2 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 flex items-center space-x-2">
                    <Trophy size={14} className="text-yellow-400" /><span className="text-white font-black font-mono text-sm">{score}</span>
                </div>
            </div>
            {isGameOver && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-40 animate-fade-in px-4">
                    <Zap size={48} className="text-brand-purple mb-4 animate-pulse" />
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">GAME OVER</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-8 tracking-widest">Puntuación Final: <span className="text-white text-lg ml-1">{score}</span></p>
                    <button onClick={handleRestart} className="w-64 bg-white text-brand-black py-4 rounded-sm font-black uppercase tracking-widest text-xs shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center cursor-pointer">
                        <RefreshCw size={16} className="mr-2" /> VOLVER A JUGAR
                    </button>
                </div>
            )}
            {isPaused && !isGameOver && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none"><div className="flex flex-col items-center"><Pause size={48} className="text-white opacity-50 mb-2" /><span className="text-white font-black uppercase tracking-widest text-lg">PAUSA</span></div></div>}
        </div>

        <div className="bg-white dark:bg-brand-dark-card px-6 py-3 flex justify-between items-center border-b border-gray-100 dark:border-white/5 shrink-0 z-20 relative">
            <div className={`flex flex-col transition-opacity duration-300 ${isGameOver || highScore > 0 ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Récord Personal</span>
                <div className="flex items-center space-x-2"><Trophy size={14} className="text-yellow-500" /><span className="text-lg font-black text-brand-black dark:text-white leading-none">{highScore}</span></div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Estado</span>
                <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGameOver ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                    <span className={`text-[10px] font-black uppercase ${isGameOver ? 'text-red-500' : 'text-green-500'}`}>{isGameOver ? 'OFFLINE' : 'ONLINE'}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-white dark:bg-brand-dark-card p-6 relative overflow-hidden">
            <div className="absolute top-6 left-6 flex gap-4 transform rotate-[-5deg] z-10">
                <div className="flex flex-col items-center space-y-1">
                    <button onClick={toggleSound} className={`w-14 h-6 rounded-full border-2 flex items-center justify-center shadow-sm active:scale-95 transition-all ${isMuted ? 'bg-red-500 border-red-600' : 'bg-gray-800 border-gray-900 dark:bg-white/10 dark:border-white/20'}`}>
                        {isMuted ? <VolumeX size={10} className="text-white" /> : <Volume2 size={10} className="text-white" />}
                    </button>
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">SONIDO</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <button onClick={togglePause} disabled={isGameOver} className={`w-14 h-6 rounded-full border-2 flex items-center justify-center shadow-sm active:scale-95 transition-all bg-gray-800 border-gray-900 dark:bg-white/10 dark:border-white/20 disabled:opacity-50`}>
                        {isPaused ? <Play size={10} className="text-white" /> : <Pause size={10} className="text-white" />}
                    </button>
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">PAUSA</span>
                </div>
            </div>
            
            <div className="absolute bottom-16 right-8 z-50">
                <button 
                    onTouchStart={triggerJump} 
                    onMouseDown={triggerJump}
                    onContextMenu={(e) => e.preventDefault()} 
                    disabled={isGameOver || isPaused} 
                    className={`w-36 h-36 rounded-full bg-brand-purple relative flex items-center justify-center shadow-[0_8px_0_#581c87] active:shadow-none active:translate-y-[8px] transition-all duration-100 border-4 border-white/10 select-none touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[10px] group cursor-pointer`}
                    style={{ touchAction: 'none' }} 
                >
                    <div className="flex flex-col items-center pointer-events-none">
                        <span className="text-white font-black text-xl tracking-[0.1em] drop-shadow-md">SALTAR</span>
                        <ChevronUp className="mt-1 text-white/80 animate-bounce group-active:opacity-0" size={24} strokeWidth={3} />
                    </div>
                    <div className="absolute top-4 left-6 w-10 h-5 bg-white/20 rounded-full -rotate-45 blur-[2px] pointer-events-none"></div>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default GameRunTool;