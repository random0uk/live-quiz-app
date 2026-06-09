'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'

const heroImages = [
  'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=1200&fit=crop', // Quiz/trivia night
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop', // Students collaborating
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=1200&fit=crop', // Classroom learning
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=1200&fit=crop', // Friends playing game
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop', // Knowledge/study
]

const taglines = [
  { title: 'Quiz Challenge', sub: 'Test What You Know' },
  { title: 'Play Together', sub: 'Live. Real-Time. Fun.' },
  { title: 'Level Up', sub: 'One Question at a Time' },
  { title: 'Who Wins?', sub: 'Compete with Friends' },
  { title: 'Be the Champion', sub: 'Prove Your Knowledge' },
]

interface HeroSectionProps {
  onStartClick?: () => void
  onLearnMore?: () => void
}

export default function HeroSection({ onStartClick, onLearnMore }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const current = taglines[currentIndex]

  return (
    /* Full screen always */
    <div className="w-full h-full">
      <div className="relative w-full h-full overflow-hidden">

        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentIndex]}
              alt="Quiz background"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay — stronger at bottom for buttons */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* Content Layout */}
        <div className="relative z-10 h-full flex flex-col px-6 py-10">

          {/* TOP — Logo left, Login icon right */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white tracking-tight drop-shadow">
              Awane<span className="text-yellow-400">.</span>
            </span>
            <button
              onClick={onStartClick}
              className="flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Login"
            >
              <LogIn className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* MIDDLE — Spacer pushes content to bottom */}
          <div className="flex-1" />

          {/* BOTTOM — Title, desc, buttons, dots */}
          <div className="flex flex-col gap-4">

            {/* Title & Subtitle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-1"
              >
                <h1 className="text-4xl font-black text-white leading-tight drop-shadow-lg">
                  {current.title}
                </h1>
                <p className="text-base font-semibold text-yellow-300 drop-shadow">
                  {current.sub}
                </p>
                <p className="text-sm text-white/75 leading-relaxed mt-1 max-w-[280px]">
                  Interactive quizzes that challenge, engage, and inspire. Play live with friends or test your knowledge solo.
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Buttons — side by side, boxed with rounded corners */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={onStartClick}
                className="flex-1 md:flex-none md:w-44 h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
              >
                Start Playing
              </button>
              <button
                onClick={onLearnMore}
                className="flex-1 md:flex-none md:w-36 h-12 bg-transparent border-2 border-white/80 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all shadow-lg active:scale-95"
              >
                Learn More
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-1.5 mt-1">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-yellow-400 w-6' : 'bg-white/35 w-1.5'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
