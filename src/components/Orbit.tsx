/* PROTOTYPE v1 — the constellation, transcribed 1:1 from Paper:
   room photo center (KG-0), UPDATING RATES right (KH-0), SENDING EMAILS
   top-left (MG-0), CURATING POSTS bottom-left (LB-0). White glass cards
   (#FFFFFFCC, blur 4) on the dark field; positions are Paper's world
   offsets. Rates and emails step vertically (highlight walks the list),
   posts hop as a conveyor; the nightly price rolls and its delta flips. */
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import type { MotionStyle } from 'motion/react'
import { useLang } from '../lib/i18n'

const EASE = [0.22, 0.61, 0.36, 1] as const

/* each factor detects, and pushes the price its own way */
/* rgb so motion can tween them against the inactive gray */
const FACTORS = [
  { label: 'Season', sq: 'rgb(77, 148, 158)', price: 224 },
  { label: 'Scarcity', sq: 'rgb(80, 123, 184)', price: 242 },
  { label: 'Nearby Events', sq: 'rgb(184, 133, 71)', price: 251 },
  { label: 'Weather', sq: 'rgb(214, 179, 71)', price: 237 },
] as const

const SUBJECTS = [
  'October at the Inn',
  'Leaf season openings',
  'A quiet weekend, on us',
  'The fire’s lit for you',
] as const

/* ALTERNATE (saved): counters in tags, per-inn scale — swap for FEED to use
export const FEED_TAGS = [
  ['RATES UPDATED', '1,428'],
  ['EMAILS SENT', '1,204'],
  ['REVIEWS ANSWERED', '312'],
  ['POSTS CURATED', '86'],
  ['BOOKINGS DRIVEN', '214'],
  ['AD SPEND COVERED', '$18,940'],
  ['SEARCHES WON', '3,105'],
] as const */

/* the live feed — per-inn actions with their examples; a third slot holds
   a trailing icon so it can be spaced apart from the text */
const FEED: ReadonlyArray<readonly [string, string, string?]> = [
  ['REPRICED', 'Garden Room $205', '↑'],
  ['REVIEW ANSWERED', '“thank you, Marta”'],
  ['EMAIL SENT', 'October at the Inn'],
  ['POST CURATED', 'the café at seven'],
  ['BOOKED', 'Oct 12–15 · 2 guests'],
  ['AD SPEND', 'covered · you owe $0'],
  ['RANKING', '#1 for “inn near Stowe”'],
]

/* the center mosaic: a 4×6 collage, every cell filled — two 2×2 features,
   three doubles, ten singles. [img, colSpan, rowSpan]; the order is tuned
   so grid auto-placement leaves no holes */
const TILES: ReadonlyArray<readonly [string, number, number]> = [
  ['inn-10', 2, 2], ['inn-02', 1, 1], ['inn-13', 1, 1], ['inn-01', 2, 1],
  ['inn-04', 1, 1], ['inn-06', 1, 1], ['inn-15', 2, 2], ['inn-11', 2, 1],
  ['inn-12', 2, 1], ['inn-03', 1, 1], ['inn-05', 1, 1], ['inn-07', 1, 1],
  ['inn-08', 1, 1], ['inn-09', 1, 1], ['inn-14', 1, 1],
]

const GREEN = 'color(display-p3 0.316 0.677 0.32)'
const RED = 'rgb(181, 107, 26)' /* amber, inked for the light card */
const GMAIL_D =
  'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z'

const ROW = 28 /* 16px line + 12px gap */

/* vertical conveyor with the posts card's hop-rest cadence: rows step up
   through a masked window; on reaching the doubled list's copy it snaps
   back mid-beat on an identical frame */
function useTicker(count: number, ms: number, on: boolean) {
  const [step, setStep] = useState(0)
  const [snap, setSnap] = useState(false)
  useEffect(() => {
    if (!on) return
    let t = 0
    const iv = window.setInterval(() => {
      setStep((v) => {
        const next = v + 1
        if (next === count) {
          t = window.setTimeout(() => {
            setSnap(true)
            setStep(0)
            requestAnimationFrame(() => setSnap(false))
          }, 520)
        }
        return next
      })
    }, ms)
    return () => {
      clearInterval(iv)
      clearTimeout(t)
    }
  }, [count, ms, on])
  return { step, snap, seat: step % count }
}

function VTicker({
  step,
  count,
  snap,
  children,
}: {
  step: number
  count: number
  snap: boolean
  children: React.ReactNode
}) {
  return (
    <div className="orb-ticker">
      <motion.div
        className="orb-ticker-strip"
        /* the seated row holds the window's center slot; the strip is
           tripled so the wrap snap always lands on an identical frame */
        animate={{ y: -ROW * (step + count - 1) }}
        initial={{ y: -ROW * (count - 1) }}
        transition={{ duration: snap ? 0 : 0.4, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function RatesCard({ on, style }: { on: boolean; style?: MotionStyle }) {
  const { step, snap, seat } = useTicker(FACTORS.length, 1000, on)
  const idx = seat
  const prev = (idx + FACTORS.length - 1) % FACTORS.length
  const up = FACTORS[idx].price >= FACTORS[prev].price

  /* the number itself rolls between rates */
  const mv = useMotionValue<number>(FACTORS[0].price)
  const label = useTransform(mv, (v) => `$${Math.round(v)} a night`)
  useEffect(() => {
    const c = animate(mv, FACTORS[idx].price, { duration: 0.55, ease: EASE })
    return () => c.stop()
  }, [idx, mv])

  return (
    <motion.div className="orb-card orb-rates" style={style}>
      <div className="orb-head">Updating rates...</div>
      <div className="orb-rows-ruled">
        <VTicker step={step} count={FACTORS.length} snap={snap}>
          {[...FACTORS, ...FACTORS, ...FACTORS].map((f, i) => (
            <motion.div
              key={i}
              className="orb-row"
              animate={{ opacity: i % FACTORS.length === idx ? 1 : 0.32 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <motion.span
                className="orb-sq"
                animate={{ backgroundColor: i % FACTORS.length === idx ? f.sq : 'rgb(120, 116, 110)' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <span>{f.label}</span>
            </motion.div>
          ))}
        </VTicker>
      </div>
      <div className="orb-price">
        <motion.span>{label}</motion.span>
        <motion.svg
          width="7"
          height="7"
          viewBox="0 0 9 9"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, transformOrigin: '50% 50%' }}
          animate={{ rotate: up ? 0 : 180 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <motion.path
            d="M4.303 1.105C4.389 0.95 4.611 0.95 4.697 1.105L8.212 7.447C8.295 7.597 8.186 7.781 8.015 7.781H0.985C0.814 7.781 0.705 7.597 0.788 7.447L4.303 1.105Z"
            fill="none"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ stroke: up ? GREEN : RED }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </motion.svg>
      </div>
    </motion.div>
  )
}

function EmailsCard({ on, style }: { on: boolean; style?: MotionStyle }) {
  const { step, snap, seat } = useTicker(SUBJECTS.length, 1150, on)
  return (
    <motion.div className="orb-card orb-emails" style={style}>
      <div className="orb-head">Sending emails...</div>
      <VTicker step={step} count={SUBJECTS.length} snap={snap}>
        {[...SUBJECTS, ...SUBJECTS, ...SUBJECTS].map((subject, i) => (
          <motion.div
            key={i}
            className="orb-row"
            animate={{ opacity: i % SUBJECTS.length === seat ? 1 : 0.32 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <motion.path
                d={GMAIL_D}
                animate={{ fill: i % SUBJECTS.length === seat ? 'rgb(234, 67, 53)' : 'rgb(0, 0, 0)' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </svg>
            <span>{subject}</span>
          </motion.div>
        ))}
      </VTicker>
    </motion.div>
  )
}

function PostSkeleton() {
  return (
    <div className="orb-post">
      <div className="orb-post-img" />
      <div className="orb-post-lines">
        <div className="orb-bar" style={{ alignSelf: 'stretch' }} />
        <div className="orb-bar" style={{ width: 41 }} />
      </div>
    </div>
  )
}

function PostsCard({ on, style }: { on: boolean; style?: MotionStyle }) {
  /* conveyor of identical skeletons — the wrap snap is invisible */
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!on) return
    const iv = window.setInterval(() => setStep((v) => (v + 1) % 4), 650)
    return () => clearInterval(iv)
  }, [on])
  return (
    <motion.div className="orb-card orb-posts" style={style}>
      <div className="orb-head">Curating posts...</div>
      <div className="orb-post-window">
        <motion.div
          className="orb-post-strip"
          /* seat one slot deep so a buffer card always fills the left
             tail — the wrap snap then lands on a truly identical frame */
          animate={{ x: -48 - 68 * step }}
          initial={{ x: -48 }}
          transition={{ duration: step === 0 ? 0 : 0.3, ease: EASE }}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <PostSkeleton key={i} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export function Orbit() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const on = !reduced

  /* gyroscopic: the composition leans toward the cursor on springs;
     each layer's depth becomes a computed x/y slip (translateZ inside
     preserve-3d would kill the cards' backdrop blur). It follows the
     cursor anywhere in the viewport, but only while it's on screen. */
  const orbitRef = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  const [seen, setSeen] = useState(false) /* the feed emerges once halfway through */
  /* the fixed-px composition zooms to the stage's width — crisp re-layout */
  const [zoom, setZoom] = useState(1)
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mx = useSpring(mxRaw, { stiffness: 70, damping: 18 })
  const my = useSpring(myRaw, { stiffness: 70, damping: 18 })
  /* strictly 2D: rotateX/rotateY (or an ancestor perspective) would seat
     the cards in a 3D rendering context, where Chromium refuses to sample
     backdrop-filter. The lean is a whole-composition drift; depth is each
     layer slipping further at its old translateZ distance */
  const RAD = Math.PI / 180
  const lean = (z: number, mv: typeof mx) =>
    useTransform(mv, (v) => z * Math.tan(v * 14 * RAD))
  const compX = useTransform(mx, [-0.5, 0.5], [-8, 8])
  const compY = useTransform(my, [-0.5, 0.5], [-8, 8])
  const photoX = lean(24, mx)
  const photoY = lean(24, my)
  const emailsX = lean(56, mx)
  const emailsY = lean(56, my)
  const ratesX = lean(72, mx)
  const ratesY = lean(72, my)
  const postsX = lean(10, mx)
  const postsY = lean(10, my)

  useEffect(() => {
    const el = orbitRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      const h = e.contentRect.height
      /* below the ~650 knee the linear fit shrank the composition into
         oblivion, but half-rate overshot and clipped the stage on phones —
         a wider gutter and a 0.65 damp keep it big AND inside the frame */
      const wz = (w - 150) / 560
      const KNEE = (650 - 150) / 560
      const wzEased = wz >= KNEE ? wz : KNEE - (KNEE - wz) * 0.65
      setZoom(Math.min(1.35, wzEased, (h - 96) / 548))
    })
    ro.observe(el)
    return () => {
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  /* blur-emerges past halfway through the stage, and blur-emerges back
     out when you scroll up above it again */
  useEffect(() => {
    const check = () => {
      const el = orbitRef.current
      if (!el) return
      setSeen(el.getBoundingClientRect().top < window.innerHeight * 0.5)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    if (!on || !inView) {
      mxRaw.set(0)
      myRaw.set(0)
      return
    }
    const onMove = (e: MouseEvent) => {
      mxRaw.set(e.clientX / window.innerWidth - 0.5)
      myRaw.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [on, inView, mxRaw, myRaw])

  return (
    <section className="svc orb-sec">
      <h2 className="svc-h2 orb-h2">{t('Meanwhile, at your inn.')}</h2>
      {/* the latch wrapper spans stage + bar only, so the sticky bar first
          appears at the stage's top edge */}
      <div className="orb-latch">
      <div ref={orbitRef} className="svc-orbit" aria-hidden="true">
        {/* scale(), not zoom: an ancestor zoom is another thing that stops
            Chromium rendering the cards' backdrop blur */}
        <div className="orb-zoom" style={{ transform: `scale(${zoom})` }}>
          <motion.div className="orb-comp" style={{ x: compX, y: compY }}>
          <motion.div className="orb-photo orb-mosaic" style={{ x: photoX, y: photoY }}>
            {TILES.map(([t, w, h], i) => (
              <div
                key={i}
                className="orb-tile"
                style={{
                  backgroundImage: `url(/hero/${t}.jpg)`,
                  gridColumn: w === 2 ? 'span 2' : undefined,
                  gridRow: h === 2 ? 'span 2' : undefined,
                }}
              />
            ))}
          </motion.div>
          <EmailsCard on={on} style={{ x: emailsX, y: emailsY }} />
          <RatesCard on={on} style={{ x: ratesX, y: ratesY }} />
          <PostsCard on={on} style={{ x: postsX, y: postsY }} />
          </motion.div>
        </div>
      </div>

      {/* latches to the viewport bottom while the stage is on screen,
          then settles between the sections once you scroll past */}
      <motion.div
        className="orb-feed"
        initial={{ opacity: 0, filter: 'blur(6px)' }}
        animate={seen ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(6px)' }}
        transition={{ duration: 0.3, ease: EASE }}
        aria-hidden="true"
      >
        <div className="orb-feed-window">
          <div className="orb-feed-strip">
            {[...FEED, ...FEED].map(([label, val, ic], i) => (
              <span key={i} className="orb-feed-item">
                <span className="orb-feed-label">{label}:</span>
                <span className="orb-feed-num">
                  {val}
                  {ic && <span>{ic}</span>}
                </span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>
      </div>
    </section>
  )
}
