'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-6">
        {/* Top Logo — Small and Right */}
        <div className="w-full flex justify-end">
          <div className="text-xl font-black text-white drop-shadow-lg">
            Awane<span className="text-yellow-400">.</span>
          </div>
        </div>

        {/* Content Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center gap-4 max-w-sm"
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

          {/* Buttons */}
          <div className="flex flex-col gap-2 w-full pt-2">
            <Button
              onClick={onStartClick}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-colors"
            >
              Start Playing Now
            </Button>
            <Button
              onClick={onLearnMore}
              className="w-full h-10 border-white/80 border bg-transparent text-white hover:bg-white/10 font-medium rounded-full transition-colors"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Bottom Dots Only */}
        <div className="flex gap-1.5">
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

        {/* Bottom Spacing */}
        <div className="h-4" />
      </div>
    </div>
  )
}
