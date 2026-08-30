import { useEffect } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  useEffect(() => {
    /* the entrance choreography assumes a fresh top-of-page arrival — reloads
       must not restore mid-page scroll under it (same fix as the portfolio) */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.05 })
    /* exposed so overlays (mobile menu) can halt scrolling — lenis routes
       user gestures through programmatic scrolls that ignore overflow */
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])
}
