"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, Building2, ChevronDown } from "lucide-react";

const HERO_IMAGES = [
  "/image/image_1.jpg",
  "/image/image_2.jpg",
  "/image/image_3.jpg",
];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Continuous, uninterrupted background slideshow carousel (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] flex flex-col justify-center overflow-hidden bg-[#153730] pt-20 pb-24 lg:pt-28 lg:pb-32">
      {/* Background Slideshow Carousel with Fixed Parallax Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {HERO_IMAGES.map((imgSrc, index) => (
          <div
            key={imgSrc}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex
                ? "opacity-100 scale-105"
                : "opacity-0 scale-100"
            }`}
            style={{
              transition: "opacity 1.2s ease-in-out, transform 6s ease-out",
            }}
          >
            <Image
              src={imgSrc}
              alt="Pilipinas Rental Marketplace Slide"
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* Rich multi-layer cinematic gradients for optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#153730] via-[#153730]/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#153730]/90 via-transparent to-[#153730]/60" />

        {/* Ambient glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FADA7A]/15 blur-[120px]" />
      </div>

      {/* Main Center Content (Headline, Trust Indicators & Stats) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto">
        {/* Top Badge & Headline Wrapper */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF7EF] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-black/10">
            <Sparkles className="w-3.5 h-3.5 text-[#F0A93A]" />
            <span>Pilipinas&apos; Premier Rental Marketplace</span>
          </div>

          <h1 className="font-display font-black tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.08] drop-shadow-md">
            Tuklasin ang perpektong{" "}
            <span className="relative inline-block text-[#FADA7A]">
              tahanan mo
              <svg
                className="absolute left-0 -bottom-2 w-full"
                height="10"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7 C 50 2, 150 2, 198 7"
                  stroke="#F0A93A"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  pathLength="1"
                  className="[stroke-dasharray:1] [stroke-dashoffset:1] animate-draw"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#FAF7EF]/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow">
            Daan-daang beripikadong paupahan sa buong bansa. Direktang kausap
            ang may-ari, walang hassle, walang hidden fees.
          </p>

          {/* Minimalist, Fully Rounded & Clean Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={scrollToContent}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#153730] font-bold text-sm shadow-lg shadow-black/10 hover:bg-[#FAF7EF] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Mag-browse ng Paupahan</span>
              <ArrowRight className="w-4 h-4 text-[#153730] transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <a
              href="/list-property"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-sm hover:bg-white/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Building2 className="w-4 h-4 text-[#FADA7A]" />
              <span>Mag-post ng Ari-arian</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center text-white/60 animate-bounce cursor-pointer"
        onClick={scrollToContent}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold mb-1">
          Mag-scroll
        </span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
