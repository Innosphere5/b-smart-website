"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#9F1239] text-[#FACC15] shadow-2xl border-2 border-[#FACC15] transition-all duration-300 hover:bg-[#7F1D1D] hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] ${
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      <ArrowUp size={20} className="transition-transform duration-200 hover:-translate-y-0.5" />
    </button>
  );
}
