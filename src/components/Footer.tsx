/* PROTOTYPE — footer: brand + blurb and © on the left, link columns on the
   right (#careers lands here), the wordmark set in ascii across the
   bottom, and the brand leaf falling through it all as ascii snow. */
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ASCII_AUTUMN, ASCII_COLS } from './footer-ascii'
import { LEAF_SPRITES } from './footer-leaves'
import { useLang } from '../lib/i18n'

/* deterministic scatter — stable across renders and HMR; half the leaves
   mirror and each lands at its own angle so the sprite doesn't stamp */
const LEAVES = Array.from({ length: 14 }, (_, i) => ({
  sprite: LEAF_SPRITES[i % LEAF_SPRITES.length],
  left: `${(i * 7.3 + 2.1) % 94}%`,
  size: 3 + (i % 3), /* specks */
  dur: `${10 + ((i * 137) % 8)}s`,
  delay: `-${(i * 211) % 12}s`, /* negative: mid-flight from the start */
  sway: `${2.6 + (i % 4) * 0.5}s`,
  dim: i % 2 ? 0.2 : 0.13,
  flip: i % 2 === 1,
  rot: Math.round(i * 137.5) % 360, /* golden-angle spread */
}))

export function Footer() {
  const { t } = useLang()
  /* scroll parallax: three depths drift at different rates while the
     css fall animation keeps running inside each layer */
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  /* the reveal box mirrors the fixed footer's natural height */
  const footRef = useRef<HTMLElement | null>(null)
  const [revealH, setRevealH] = useState<number>()
  useEffect(() => {
    const el = footRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setRevealH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const near = useTransform(scrollYProgress, [0, 1], [-90, 90])
  const mid = useTransform(scrollYProgress, [0, 1], [-55, 55])
  const far = useTransform(scrollYProgress, [0, 1], [-25, 25])
  const depths = [far, mid, near]

  return (
    /* the reveal box: the page scrolls off the fixed footer inside it;
       #careers rides here because anchors can't scroll to a fixed element */
    <div ref={ref} className="footer-reveal" id="careers" style={{ height: revealH }}>
    <footer ref={footRef} className="footer">
      {/* ascii leaves, snowing */}
      <div className="leaf-fall" aria-hidden="true">
        {LEAVES.map((l, i) => (
          <motion.div
            key={i}
            className="foot-leaf-p"
            style={{ left: l.left, y: depths[i % 3], rotate: l.rot, scaleX: l.flip ? -1 : 1 }}
          >
            <pre
              className="foot-leaf"
              style={{
                fontSize: l.size,
                opacity: l.dim,
                ['--dur' as string]: l.dur,
                ['--delay' as string]: l.delay,
                ['--sway' as string]: l.sway,
              }}
            >
              {l.sprite}
            </pre>
          </motion.div>
        ))}
      </div>
      <div className="footer-top">
        <div className="footer-brand">
          <a href="/" className="brand" aria-label="Autumn home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 12.5" width="14" height="12.5">
              <path
                d="M0.563 12.5L0.563 9.505 6.981 4.9 0.443 8.067C0.197 7.652 0.136 6.896 0.136 6.568 0.429 2.93 2.783 1.216 3.923 0.811 6.66-0.432 11.461 0.025 13.514 0.409 14.052 2.989 11.58 4.554 10.277 5.016L12.781 5.016C12.539 6.903 9.951 7.835 8.689 8.067L11.377 8.067C10.741 9.309 9.403 10.234 8.81 10.543 6.709 11.878 3.454 11.368 2.09 10.943L2.09 12.5Z"
                fill="color(display-p3 1 1 1)"
              />
            </svg>
            <span className="brand-name">autumn</span>
          </a>
        </div>
        <div className="footer-cols">
          <nav className="footer-col" aria-label="Site">
            <a className="nav-link" href="#how-it-works">{t('How it Works')}</a>
            <a className="nav-link" href="#services">{t('Services')}</a>
            <a className="nav-link" href="#results">{t('Results')}</a>
            <a className="nav-link" href="#flagship">{t('Flagship Program')}</a>
          </nav>
          <nav className="footer-col" aria-label="Company">
            <a className="nav-link" href="mailto:hello@autumnplatform.com">{t('Careers')}</a>
            <a className="nav-link" href="mailto:hello@autumnplatform.com">{t('Contact')}</a>
            <a className="nav-link" href="#">Instagram</a>
          </nav>
        </div>
      </div>
      {/* the year and a live line to us, riding inside the wordmark */}
      <div className="footer-ascii-wrap">
        <pre
          className="footer-ascii"
          style={{ ['--ascii-cols' as string]: ASCII_COLS }}
          aria-hidden="true"
        >
          {ASCII_AUTUMN}
        </pre>
        <div className="footer-ascii-over">
          <span>© 2026</span>
          <a className="footer-mail" href="mailto:hello@autumnplatform.com">hello@autumnplatform.com</a>
        </div>
      </div>
    </footer>
    </div>
  )
}
