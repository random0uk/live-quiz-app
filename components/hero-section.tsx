'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Unsplash fitness images - diverse people, energetic, inspiring
const heroImages = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop', // Woman fitness trainer
  'https://images.unsplash.com/photo-1552821206-c03b93f9e8d9?w=1200&h=800&fit=crop', // Woman working out
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop', // Diverse fitness group
  'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=1200&h=800&fit=crop', // Woman strength training
  'https://images.unsplash.com/photo-1540497905218-371f79a55e63?w=1200&h=800&fit=crop', // Woman yoga/wellness
]

const heroHeadlines = [
  'Challenge Yourself',
  'Test Your Knowledge',
  'Quick, Fun, Rewarding',
  'Level Up Your Brain',
  'Join the Quiz Revolution',
]

interface HeroSectionProps {
  onStartClick?: () => void
}

export default function HeroSection({ onStartClick }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
      setCurrentHeadlineIndex((prev) => (prev + 1) % heroHeadlines.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlay])

  const handlePrevImage = () => {
    setIsAutoPlay(false)
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    setCurrentHeadlineIndex((prev) => (prev - 1 + heroHeadlines.length) % heroHeadlines.length)
  }

  const handleNextImage = () => {
    setIsAutoPlay(false)
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    setCurrentHeadlineIndex((prev) => (prev + 1) % heroHeadlines.length)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImages[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-block">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              <span className="text-gold">Awane</span>
              <span className="text-white block">Quiz</span>
            </h1>
          </div>
        </motion.div>

        {/* Dynamic headline */}
        <motion.div
          key={currentHeadlineIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="mb-6 h-16 flex items-center"
        >
          <p className="text-2xl md:text-4xl font-bold text-white/90">
            {heroHeadlines[currentHeadlineIndex]}
          </p>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl"
        >
          Interactive quizzes that challenge, engage, and inspire. Play live with friends or test your knowledge solo.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button
            size="lg"
            onClick={onStartClick}
            className="bg-gold hover:bg-gold/90 text-navy-900 font-bold text-lg px-10 py-6 rounded-full shadow-lg"
          >
            Start Playing Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10 py-6 rounded-full"
          >
            Learn More
          </Button>
        </motion.div>

        {/* Image carousel indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 justify-center"
        >
          <button
            onClick={handlePrevImage}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            ←
          </button>

          <div className="flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAutoPlay(false)
                  setCurrentImageIndex(i)
                  setCurrentHeadlineIndex(i)
                }}
                className={`h-2 rounded-full transition-all ${
                  i === currentImageIndex ? 'bg-gold w-8' : 'bg-white/30 w-2'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextImage}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            →
          </button>
        </motion.div>

        {/* Slide counter */}
        <p className="absolute bottom-6 right-6 text-white/50 text-sm font-mono">
          {String(currentImageIndex + 1).padStart(2, '0')} / {String(heroImages.length).padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}
