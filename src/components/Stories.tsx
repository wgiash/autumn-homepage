/* PROTOTYPE — Stripe-style looping carousel as its own section: featured
   panel always leftmost, constant queue of strips trailing right. Advancing
   slides the next item out to featured while the skipped one travels to the
   back of the line. Vignette UI system; positions/widths are computed and
   animated as real layout values (no transform scaling → no image zoom). */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Arrow } from './Nav'
import { useLang } from '../lib/i18n'

const EASE = [0.22, 0.61, 0.36, 1] as const
const SWAP = {
  initial: { opacity: 0, filter: 'blur(6px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(6px)' },
  transition: { duration: 0.3, ease: EASE },
}

/* queue widths behind the featured slide: the runner-up reads wide, then a
   descending taper, ending in three identical thin slivers */
const STRIP_W = [140, 84, 44, 24, 10, 10, 10]
const GAP = 12
const GAP_MIN = 6 /* between the thin slivers */
const gapAt = (k: number) => (k >= 6 ? GAP_MIN : GAP)

const SLIDES = [
  {
    label: 'The Brass Lantern, Stowe',
    lead: '“Our best fall on record.”',
    rest: '— Don · direct bookings up 32%, OTA share down by half.',
    img: '/hero/slide-1.jpg',
  },
  {
    label: 'Willow & Vine, Savannah',
    lead: '“I stopped dreading the marketing.”',
    rest: '— Marianne · repeat stays up 41% from email alone.',
    img: '/hero/slide-2.jpg',
  },
  {
    label: 'Alpenrose Lodge, Leavenworth',
    lead: '“Booked solid through ski season.”',
    rest: '— Petra · RevPAR up 19% with dynamic pricing.',
    img: '/hero/slide-3.jpg',
  },
  {
    label: 'Driftwood House, Mendocino',
    lead: '“Guests say they found us on Google.”',
    rest: '— Sam · first page for every search that matters.',
    img: '/hero/slide-4.jpg',
  },
  {
    label: 'The Saltwater Inn, Bar Harbor',
    lead: '“It feels like having a whole team.”',
    rest: '— Ruth · ad spend covered by Autumn, risk-free.',
    img: '/hero/slide-6.jpg',
  },
  {
    label: 'Casa Luz, Taos',
    lead: '“Our quiet season isn’t quiet anymore.”',
    rest: '— Elena · shoulder-season occupancy up 27%.',
    img: '/hero/slide-5.jpg',
  },
  {
    label: 'Cedar & Sage Ranch, Fredericksburg',
    lead: '“Weekends sell themselves now.”',
    rest: '— Hank · direct revenue up 38% year over year.',
    img: '/hero/slide-7.jpg',
  },
  {
    label: 'The Meadowlark, Hudson Valley',
    lead: '“City guests find us first.”',
    rest: '— June · top of Google for every upstate search.',
    img: '/hero/slide-8.jpg',
  },
] as const

const N = SLIDES.length

type Ghost = { key: string; img: string; x: number; w: number; dir: 1 | -1; p: number; k: number }

function useMediaQuery(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

export function Stories() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  /* on mobile the conveyor gives way to a native swipe strip */
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const dirRef = useRef<1 | -1>(1) /* which way the queue is rotating */
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const ghostTimer = useRef<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const changeRef = useRef<'rotate' | 'hover'>('rotate')
  const rotatingUntil = useRef(0) /* hover is ignored while the row is in flight */
  const slide = SLIDES[active]

  /* previous queue positions — lets a wrapping slide exit one side and
     re-enter from the other instead of traversing the track */
  const prevDistRef = useRef<number[]>(SLIDES.map((_, i) => i))
  useEffect(() => {
    prevDistRef.current = SLIDES.map((_, i) => (i - active + N) % N)
  }, [active])

  const trackRef = useRef<HTMLDivElement | null>(null)
  const mstripRef = useRef<HTMLDivElement | null>(null)
  const [trackW, setTrackW] = useState(0)

  /* the mobile strip loops: three copies of the deck, seated on the middle
     one, silently re-centered whenever a swipe settles near either end */
  const normTimer = useRef<number | null>(null)
  const autoScrollRef = useRef(false)
  const lastUserScroll = useRef(0)
  useEffect(() => {
    if (!isMobile) return
    const el = mstripRef.current
    if (!el) return
    const step = el.clientWidth * 0.82 + 12
    el.scrollTo({ left: step * N, behavior: 'auto' })
  }, [isMobile])

  /* autoplay only while the section is actually on screen */
  useEffect(() => {
    const el = trackRef.current ?? mstripRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [isMobile])

  /* the strip keeps the desktop's 9s cadence, yielding while the reader
     is mid-swipe */
  useEffect(() => {
    if (!isMobile || !inView) return
    const iv = window.setInterval(() => {
      const el = mstripRef.current
      if (!el) return
      if (performance.now() - lastUserScroll.current < 3000) return
      const step = el.clientWidth * 0.82 + 12
      autoScrollRef.current = true
      el.scrollTo({ left: step * (Math.round(el.scrollLeft / step) + 1), behavior: 'smooth' })
    }, 9000)
    return () => clearInterval(iv)
  }, [isMobile, inView])
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setTrackW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* rotate the queue; items that loop past the front leave a ghost being
     pushed out one side while their real selves enter from the other */
  const rotRef = useRef<{ dir: 1 | -1; k: number }>({ dir: 1, k: 1 })
  const rotate = (target: number, forceDir?: 1 | -1) => {
    if (target === active) return
    /* rotate the SHORT way around the loop */
    const kf = (target - active + N) % N
    const dir: 1 | -1 = forceDir ?? (kf <= N - kf ? 1 : -1)
    const k = dir === 1 ? kf : N - kf
    rotRef.current = { dir, k }
    const made: Ghost[] = []
    if (dir === 1) {
      for (let p = 0; p < k; p++) {
        const idx = (active + p) % N
        made.push({ key: `${idx}-${target}`, img: SLIDES[idx].img, x: xs[p], w: widths[p], dir, p, k })
      }
    } else {
      for (let p = N - k; p < N; p++) {
        const idx = (active + p) % N
        made.push({ key: `${idx}-${target}`, img: SLIDES[idx].img, x: xs[p], w: widths[p], dir, p, k })
      }
    }
    setGhosts(made)
    dirRef.current = dir
    changeRef.current = 'rotate'
    rotatingUntil.current = performance.now() + 700
    setHovered(null)
    setActive(target)
    if (ghostTimer.current) clearTimeout(ghostTimer.current)
    ghostTimer.current = window.setTimeout(() => setGhosts([]), 700)
  }
  const go = (d: number) => rotate((active + d + N) % N, d > 0 ? 1 : -1)
  const pick = (i: number) => rotate(i, 1) /* the conveyor always turns forward on clicks */

  /* geometry by queue position (dist 0 = featured) */
  const stripTotal = STRIP_W.slice(0, N - 1).reduce((a, b) => a + b, 0)
  const gapTotal = Array.from({ length: N - 1 }, (_, j) => gapAt(j + 1)).reduce((a, b) => a + b, 0)
  const featW = Math.max(200, trackW - stripTotal - gapTotal)
  const widths: number[] = []
  const xs: number[] = []
  for (let k = 0; k < N; k++) {
    widths.push(k === 0 ? featW : STRIP_W[Math.min(k - 1, STRIP_W.length - 1)])
  }
  /* hover: the hovered strip swells slightly; everyone else cinches in
     proportionally so the row's total width holds */
  const hovDist = hovered !== null ? (hovered - active + N) % N : 0
  if (hovered !== null) {
    /* swell scales with the strip — slivers only nudge, wide strips get the full 16 */
    const EXTRA = Math.min(16, widths[hovDist] * 0.4)
    const others = widths.reduce((a, b, k) => (k === hovDist ? a : a + b), 0)
    const ratio = (others - EXTRA) / others
    for (let k = 0; k < N; k++) widths[k] = k === hovDist ? widths[k] + EXTRA : widths[k] * ratio
  }
  let cursor = 0
  for (let k = 0; k < N; k++) {
    if (k > 0) cursor += gapAt(k)
    xs.push(cursor)
    cursor += widths[k]
  }

  return (
    <section id="results" className="svc">
      <div className="svc-head-row">
        <div>
          <h2 className="svc-h2">{t('Proof from properties like yours.')}</h2>
        </div>
        <div className="svc-nav-arrows">
          <button className="svc-arrow-btn is-prev" onClick={() => go(-1)} aria-label="Previous">
            <Arrow />
          </button>
          <button className="svc-arrow-btn" onClick={() => go(1)} aria-label="Next">
            <Arrow />
          </button>
        </div>
      </div>

      {isMobile ? (
        <div
          className="svc-mstrip"
          ref={mstripRef}
          onTouchStart={() => {
            autoScrollRef.current = false
            lastUserScroll.current = performance.now()
          }}
          onScroll={(e) => {
            const el = e.currentTarget
            const step = el.clientWidth * 0.82 + 12
            const j = Math.round(el.scrollLeft / step)
            const idx = ((j % N) + N) % N
            if (idx !== active) {
              changeRef.current = 'hover' /* caption swaps quietly on swipe */
              setActive(idx)
            }
            if (!autoScrollRef.current) lastUserScroll.current = performance.now()
            if (normTimer.current) clearTimeout(normTimer.current)
            /* once the swipe settles, drift back to the middle copy unseen */
            normTimer.current = window.setTimeout(() => {
              autoScrollRef.current = false
              const jj = Math.round(el.scrollLeft / step)
              if (jj < N || jj >= 2 * N)
                el.scrollTo({ left: step * (N + ((jj % N) + N) % N), behavior: 'auto' })
            }, 140)
          }}
        >
          {[...SLIDES, ...SLIDES, ...SLIDES].map((s, j) => {
            const idx = j % N
            return (
              <div
                key={`${s.label}-${j}`}
                className={`svc-mslide${idx === active ? ' is-active' : ''}`}
                style={{ backgroundImage: `url(${s.img})` }}
                onClick={() => {
                  /* tap the featured card to advance; tap a peeking one to seat it */
                  const el = mstripRef.current
                  if (!el) return
                  const step = el.clientWidth * 0.82 + 12
                  const here = Math.round(el.scrollLeft / step)
                  const target = idx === active ? here + 1 : j
                  autoScrollRef.current = true
                  el.scrollTo({ left: step * target, behavior: 'smooth' })
                }}
              >
                {idx === active && <span className="svc-slide-label">{s.label}</span>}
              </div>
            )
          })}
        </div>
      ) : (
      <div
        ref={trackRef}
        className="svc-carousel"
        onMouseLeave={() => {
          /* hover is sticky inside the track — gaps and the featured slide
             keep it; only leaving the whole section clears it */
          changeRef.current = 'hover'
          setHovered(null)
        }}
      >
        {trackW > 0 &&
          SLIDES.map((s, i) => {
            const dist = (i - active + N) % N
            const prev = prevDistRef.current[i]
            /* forward rotation shrinks dist; an INCREASE means the item
               looped past the front (exit left, re-enter right) — and
               vice versa for backward rotation */
            const wrapFwd = dirRef.current === 1 && dist > prev
            const wrapBack = dirRef.current === -1 && dist < prev
            /* wrapped items snap beyond the edge at t=0 and travel in WITH
               the rest — as a pre-spaced train, so multiple wraps never
               stack on each other; their old selves exit as ghosts */
            const { k } = rotRef.current
            const anim = wrapFwd
              ? {
                  x: [trackW + 40 + (xs[dist] - xs[N - k]), xs[dist]],
                  width: [widths[dist], widths[dist]],
                }
              : wrapBack
                ? {
                    x: [xs[dist] - (xs[k - 1] + widths[k - 1] + 40), xs[dist]],
                    width: [widths[dist], widths[dist]],
                  }
                : { x: xs[dist], width: widths[dist] }
            return (
              <motion.div
                key={s.label}
                className={`svc-slide${dist === 0 ? ' is-active' : ''}`}
                style={{
                  zIndex: wrapFwd ? 0 : wrapBack ? N + 1 : N - dist,
                }}
                initial={false}
                animate={anim}
                transition={{ duration: changeRef.current === 'hover' ? 0.3 : 0.65, ease: EASE }}
                onClick={() => pick(i)}
                onMouseEnter={() => {
                  if (performance.now() > rotatingUntil.current) {
                    changeRef.current = 'hover'
                    setHovered(i)
                  }
                }}
              >
                {/* the image layer holds the pre-hover featured width (featW,
                    not widths[0]): the hover swell resizes the windows but
                    never the image scale — no zoom, no jerk */}
                <div className="svc-slide-img" style={{ backgroundImage: `url(${s.img})`, width: featW + 24 }} />
                <AnimatePresence>
                  {dist === 0 && (
                    <motion.span className="svc-slide-label" {...SWAP}>
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {dist === 0 && !reduced && (
                  <div className="svc-progress">
                    <div
                      key={active}
                      className={`svc-progress-fill${hovered !== null || !inView ? ' is-paused' : ''}`}
                      onAnimationEnd={() => {
                        if (hovered === null && inView) go(1)
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        {ghosts.map((g) => (
          <motion.div
            key={g.key}
            className="svc-slide"
            style={{ zIndex: 0, pointerEvents: 'none' }}
            initial={{ x: g.x, width: g.w, opacity: 1 }}
            animate={
              g.dir === 1
                ? /* crushed against the incoming featured slide's left edge —
                     wide gap kept while exiting left — dimming on the way out */
                  { x: -((g.k - g.p) * (8 + GAP)), width: 8, opacity: 0.2 }
                : { x: trackW + 40, opacity: 0.2 }
            }
            transition={{ duration: 0.65, ease: EASE }}
          >
            {/* same constant-scale window as the live slides */}
            <div className="svc-slide-img" style={{ backgroundImage: `url(${g.img})`, width: featW + 24 }} />
          </motion.div>
        ))}
      </div>
      )}

      <div className="svc-caption">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={active} className="svc-caption-text" {...SWAP}>
            <span className="svc-caption-lead">{slide.lead}</span>{' '}
            <span className="svc-dim">{slide.rest}</span>
          </motion.p>
        </AnimatePresence>
        <a className="btn-glass" href="#flagship">
          {t('Join them')}
          <Arrow />
        </a>
      </div>
    </section>
  )
}
