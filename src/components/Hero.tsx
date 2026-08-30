/* Transcribed 1:1 from Paper artboards 2-0 / 57-0 "Cityscape evening scene". */
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Nav, Arrow } from './Nav'
import { SearchVignette } from './SearchVignette'

export function Hero() {
  const reduced = useReducedMotion()

  /* slight scroll parallax: the copy rises as one group over the first fold */
  const { scrollY } = useScroll()
  const yCopy = useTransform(scrollY, [0, 600], [0, -60])

  return (
    <section className="hero">
      <div className="hero-vignette">
        <SearchVignette />
      </div>
      <div className="hero-fg" aria-hidden="true" />
      <Nav />
      <div className="hero-body">
        <motion.div className="hero-copy" style={reduced ? undefined : { y: yCopy }}>
          <div className="hero-text">
            <h1 className="hero-h1">AI-Enabled Digital Marketing</h1>
            <p className="hero-sub">
              Best in class digital marketing. Now available for boutique hotels.
            </p>
          </div>
          <a className="btn-glass" href="#flagship">
            Apply for our Flagship Program
            <Arrow />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
