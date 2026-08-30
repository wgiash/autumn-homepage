import { useLang } from '../lib/i18n'
/* Transcribed 1:1 from Paper: base nav (artboard 2-0 frame 5-0),
   scrolled island (artboard 43/57 frame 44-0): width compresses to 720,
   top margin appears, padding tightens, glass surface fades in, and the
   full border draws itself left → top → right → bottom in one stroke. */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

const EASE = [0.22, 0.61, 0.36, 1] as const

const MENU_LINKS = [
  ['How it Works', '#how-it-works'],
  ['Services', '#services'],
  ['Results', '#results'],
  ['Careers', '#careers'],
] as const

/* his hamburger — the outer lines fold into an X, the middle one dissolves */
function Burger({ open }: { open: boolean }) {
  const line = { transformBox: 'fill-box', transformOrigin: 'center' } as const
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M3 5H21"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        style={line}
        animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
      <motion.path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        style={line}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
      />
      <motion.path
        d="M3 19H21"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        style={line}
        animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </svg>
  )
}

function Arrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.875 7.5L13.125 7.5M13.125 7.5L7.813 2.188M13.125 7.5L7.813 12.813"
        fill="none"
        stroke="color(display-p3 1 1 1)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Nav() {
  const { lang, setLang, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const pillRef = useRef<HTMLDivElement | null>(null)
  const [naturalW, setNaturalW] = useState<number | null>(null)
  const [pillDims, setPillDims] = useState({ w: 0, h: 0 })

  /* the page holds still behind the open sheet; the vanished scrollbar's
     width is given back to body and the fixed header, so nothing re-lays
     out (the pill was animating that 15px as a dramatic transform) */
  useEffect(() => {
    if (!menuOpen) return
    const sw = window.innerWidth - document.documentElement.clientWidth
    const root = document.documentElement /* the scroller — body overflow doesn't stop it */
    const nav = navRef.current
    const prevO = root.style.overflow
    root.style.overflow = 'hidden'
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()
    if (sw > 0) {
      document.body.style.paddingRight = `${sw}px`
      if (nav) nav.style.paddingRight = `calc(${getComputedStyle(nav).paddingRight} + ${sw}px)`
    }
    return () => {
      root.style.overflow = prevO
      document.body.style.paddingRight = ''
      if (nav) nav.style.paddingRight = ''
      lenis?.start()
    }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* measure: container width (so max-width can transition px → px)
     and pill box (so the border path matches the drawn surface) */
  useEffect(() => {
    const nav = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return
    const measure = () => {
      const cs = getComputedStyle(nav)
      setNaturalW(nav.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))
      setPillDims({ w: pill.offsetWidth, h: pill.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(nav)
    ro.observe(pill)
    return () => ro.disconnect()
  }, [])

  const { w, h } = pillDims

  /* the open sheet always pairs with the full-width bar — a floating
     island transforms back to full when opened, and returns on close */
  const island = scrolled && !menuOpen

  return (
    <header ref={navRef} className={`nav${island ? ' is-scrolled' : ''}`}>
      <div
        ref={pillRef}
        className="nav-pill"
        style={{ maxWidth: island ? 720 : (naturalW ?? undefined) }}
      >
        {w > 0 && (
          <svg className="nav-border" aria-hidden="true">
            {/* one continuous stroke: bottom-left → up the LEFT → across the
                TOP → down the RIGHT → back along the bottom */}
            <path d={`M0,${h} L0,0 L${w},0 L${w},${h} L0,${h}`} pathLength={100} />
          </svg>
        )}
        <a href="/" className="brand" aria-label="Autumn home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 12.5" width="14" height="12.5">
            <path
              d="M0.563 12.5L0.563 9.505 6.981 4.9 0.443 8.067C0.197 7.652 0.136 6.896 0.136 6.568 0.429 2.93 2.783 1.216 3.923 0.811 6.66-0.432 11.461 0.025 13.514 0.409 14.052 2.989 11.58 4.554 10.277 5.016L12.781 5.016C12.539 6.903 9.951 7.835 8.689 8.067L11.377 8.067C10.741 9.309 9.403 10.234 8.81 10.543 6.709 11.878 3.454 11.368 2.09 10.943L2.09 12.5Z"
              fill="color(display-p3 1 1 1)"
            />
          </svg>
          <span className="brand-name">autumn</span>
        </a>
        <div className="nav-right">
          <nav className="nav-links" aria-label="Main">
            <a className="nav-link" href="#how-it-works">{t('How it Works')}</a>
            <a className="nav-link" href="#results">{t('Results')}</a>
            <a className="nav-link" href="#careers">{t('Careers')}</a>
          </nav>
          <div className="nav-right" style={{ gap: 8 }}>
            <div className="lang">
              <button
                className={`lang-opt${lang === 'en' ? '' : ' dim'}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <span className="sep">/</span>
              <button
                className={`lang-opt${lang === 'es' ? '' : ' dim'}`}
                onClick={() => setLang('es')}
              >
                ES
              </button>
            </div>
            <a className="btn-glass" href="#flagship">
              {t('Flagship Program')}
              <Arrow />
            </a>
            <button
              className={`nav-burger${menuOpen ? ' is-open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Burger open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* the mobile sheet — static: it simply appears */}
      {menuOpen && (
        <nav className="nav-menu" aria-label="Menu">
          {MENU_LINKS.map(([label, href]) => (
            <a key={href} className="nav-menu-link" href={href} onClick={() => setMenuOpen(false)}>
              {t(label)}
            </a>
          ))}
          <a className="btn-glass nav-menu-cta" href="#flagship" onClick={() => setMenuOpen(false)}>
            {t('Flagship Program')}
            <Arrow />
          </a>
        </nav>
      )}
    </header>
  )
}

export { Arrow }
