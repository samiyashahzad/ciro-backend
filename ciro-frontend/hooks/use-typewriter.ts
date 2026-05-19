'use client'

import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed: number = 35, startDelay: number = 0) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    if (!text) return

    let currentIndex = 0
    let timeoutId: NodeJS.Timeout

    const startTyping = () => {
      const type = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
          timeoutId = setTimeout(type, speed)
        } else {
          setIsComplete(true)
        }
      }
      type()
    }

    const delayTimeout = setTimeout(startTyping, startDelay)

    return () => {
      clearTimeout(delayTimeout)
      clearTimeout(timeoutId)
    }
  }, [text, speed, startDelay])

  return { displayedText, isComplete }
}
