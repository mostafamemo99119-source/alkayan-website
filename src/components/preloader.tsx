import { useEffect, useState } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start the progress bar fill animation shortly after mount
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 100);

    // Hide after 2 seconds to let the user enjoy the preloader
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade transition to finish (500ms)
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(progressTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111] transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, #111 65%)"
      }}
    >
      {/* Container for logo with pulse animation */}
      <div className="relative flex flex-col items-center justify-center animate-pulse [animation-duration:3s]">
        
        {/* Glow behind the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/25 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="الكيان - Al Kayan" 
          className="relative z-10 w-72 md:w-80 max-w-md object-contain"
        />

      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-1/4 flex flex-col items-center gap-4 w-64 md:w-80 max-w-[80vw]">
        <span className="text-[#D4AF37]/80 text-lg md:text-xl font-display tracking-widest uppercase drop-shadow-md">
          جاري التحميل...
        </span>
        {/* Progress Bar Container */}
        <div className="w-full h-[3px] bg-[#D4AF37]/20 rounded-full overflow-hidden">
          {/* Progress Bar Fill */}
          <div 
            className="h-full bg-[#D4AF37] rounded-full transition-all ease-out"
            style={{ width: `${progress}%`, transitionDuration: "1900ms" }}
          />
        </div>
      </div>
    </div>
  );
}
