'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

const heroImages = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1552821206-c03b93f9e8d9?w=1200&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=1200&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1540497905218-371f79a55e63?w=1200&h=1600&fit=crop',
]

interface HeroSectionProps {
  onStartClick?: () => void
  onLearnMore?: () => void
}

export default function HeroSection({ onStartClick, onLearnMore }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentImageIndex]}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-start p-6 pt-12">
        {/* Top Header — Logo Left, Login Icon Right */}
        <div className="w-full flex items-center justify-between mb-16">
          <div className="text-xl font-black text-white drop-shadow-lg">
            Awane<span className="text-yellow-400">.</span>
          </div>
          <button 
            onClick={onStartClick}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Login"
          >
            <LogIn className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center gap-4 max-w-sm flex-1"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
              Quiz Challenge
            </h1>
            <p className="text-base font-medium text-white/90 drop-shadow">
              Level Up Your Brain
            </p>
          </div>

          <p className="text-sm text-white/80 leading-relaxed drop-shadow">
            Interactive quizzes that challenge, engage, and inspire. Play live with friends or test your knowledge solo.
          </p>

          {/* Buttons — Side by Side */}
          <div className="flex gap-2 w-full pt-4 max-w-sm">
            <Button
              onClick={onStartClick}
              className="flex-1 h-11 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full transition-colors text-sm"
            >
              Start Playing
            </Button>
            <Button
              onClick={onLearnMore}
              className="flex-1 h-11 border-white/80 border bg-transparent text-white hover:bg-white/10 font-medium rounded-full transition-colors text-sm"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Bottom Dots Only */}
        <div className="flex gap-1.5 mb-6">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentImageIndex ? 'bg-yellow-400 w-6' : 'bg-white/40 w-2'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
