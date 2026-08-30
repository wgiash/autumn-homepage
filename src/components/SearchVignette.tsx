/* Search vignette — transcribed 1:1 from the Paper storyboard:
   frame 1 (29-0): user clicks on search
   frame 2 (43-0): user types in and enters
   frame 3 (57-0): bar transforms into a results line; items pop in one by
                   one, emerge-blur cascade, spaced out
   frame 4 (E0-0): spacing tightens, items all fully fade in, cascade
   final   (BX-0): user clicks Book Now → “Booked ✓”
   Transition voice: the portfolio's case-study emerge triplet —
   opacity / scale 0.95 / blur — on the house curve. */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ResponseStream } from './ui/response-stream'
import { PROVIDERS } from './provider-icons'

/* six example searches — the vignette cycles through them */
const SCENARIOS = [
  {
    query: 'Inn near Stowe, Vermont',
    count: 'Top results for',
    label: 'Inns near Stowe, Vermont',
    hit: { name: 'The Brass Lantern', place: 'Stowe, Vermont', rating: '4.9', reviews: '(220)', thumb: '/hero/thumb-hit-1.jpg' },
    rows: [
      'Booking.com - The 10 BEST Stowe Inns',
      'Expedia - Stowe Hotels from $214',
    ],
  },
  {
    query: 'B&B in Savannah, Georgia',
    count: 'Top results for',
    label: 'B&Bs in Savannah, Georgia',
    hit: { name: 'Willow & Vine', place: 'Savannah, GA', rating: '4.8', reviews: '(184)', thumb: '/hero/thumb-hit-2.jpg' },
    rows: [
      'Booking.com - The 10 BEST Savannah B&Bs',
      'Expedia - Savannah Hotels from $149',
    ],
  },
  {
    query: 'Lodge near Leavenworth, Washington',
    count: 'Top results for',
    label: 'Lodges near Leavenworth, Washington',
    hit: { name: 'Alpenrose Lodge', place: 'Leavenworth, WA', rating: '4.9', reviews: '(312)', thumb: '/hero/thumb-hit-3.jpg' },
    rows: [
      'Booking.com - The 10 BEST Leavenworth Lodges',
      'Expedia - Leavenworth Hotels from $209',
    ],
  },
  {
    query: 'Inn on the Mendocino coast',
    count: 'Top results for',
    label: 'Inns on the Mendocino coast',
    hit: { name: 'Driftwood House', place: 'Mendocino, CA', rating: '4.9', reviews: '(156)', thumb: '/hero/thumb-hit-4.jpg' },
    rows: [
      'Booking.com - The 10 BEST Mendocino Inns',
      'Expedia - Mendocino Hotels from $239',
    ],
  },
  {
    query: 'Guesthouse in Taos, New Mexico',
    count: 'Top results for',
    label: 'Guesthouses in Taos, New Mexico',
    hit: { name: 'Casa Luz', place: 'Taos, New Mexico', rating: '4.8', reviews: '(98)', thumb: '/hero/thumb-hit-5.jpg' },
    rows: [
      'Booking.com - The 10 BEST Taos Guesthouses',
      'Expedia - Taos Hotels from $129',
    ],
  },
  {
    query: 'Inn near Bar Harbor, Maine',
    count: 'Top results for',
    label: 'Inns near Bar Harbor, Maine',
    hit: { name: 'The Saltwater Inn', place: 'Bar Harbor, ME', rating: '4.9', reviews: '(203)', thumb: '/hero/thumb-hit-6.jpg' },
    rows: [
      'Booking.com - The 10 BEST Bar Harbor Inns',
      'Expedia - Bar Harbor Hotels from $179',
    ],
  },
] as const
const EASE = [0.22, 0.61, 0.36, 1] as const
const HIDDEN = { opacity: 0, scale: 0.95, filter: 'blur(10px)' }
const SWAP = {
  initial: { opacity: 0, filter: 'blur(6px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(6px)' },
  transition: { duration: 0.3, ease: EASE },
}

type Phase = 'field' | 'typing' | 'entering' | 'sent' | 'searching' | 'cascade' | 'booked' | 'done'
/* cascade of four: results line leads, then hit, then the OTA rows.
   Trailing items start progressively farther below their (already tight)
   slots — in-flight spacing reads loose and every gap closes continuously
   over the same flight duration, converging as they land. */
const RISE = [280, 360, 440, 520] as const
const DELAY = [0, 0.12, 0.24, 0.36] as const

export function SearchVignette() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduced ? 'done' : 'field')
  const [idx, setIdx] = useState(0)
  const swapTimer = useRef<number | null>(null)
  const sc = SCENARIOS[idx]

  /* the conductor — no cursor: beats advance on their own clock */
  useEffect(() => {
    if (reduced) return
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))
    if (phase === 'field') at(1400, () => setPhase('typing'))
    /* fade-mode words finish ≈ 6 segments × 140ms + 340ms fade */
    if (phase === 'typing') at(1600, () => setPhase('entering'))
    if (phase === 'entering') at(1400, () => setPhase('sent'))
    if (phase === 'sent') at(120, () => setPhase('searching')) /* the line leads while the field is still dissolving */
    if (phase === 'searching') at(3400, () => setPhase('cascade'))
    if (phase === 'cascade') at(3400, () => setPhase('booked'))
    if (phase === 'booked') at(1100, () => setPhase('done'))
    /* hold the settled frame, then cycle: results sink back behind the house
       and the next example search begins */
    if (phase === 'done')
      at(1900, () => {
        setPhase('field')
        swapTimer.current = window.setTimeout(
          () => { setIdx((i) => (i + 1) % SCENARIOS.length); setPlayed(false) },
          800, /* swap copy mid-sink, once the old results are mostly faded */
        )
      })
    return () => timers.forEach(clearTimeout)
  }, [phase, reduced])

  useEffect(() => () => { if (swapTimer.current) clearTimeout(swapTimer.current) }, [])

  useEffect(() => {
    if (phase === 'cascade') setPlayed(true)
  }, [phase])

  /* exit is a blur-out IN PLACE — 'played' marks that this cycle showed
     results, so the off-state dissolves at y:0 instead of sinking; when the
     scenario swaps, 'played' resets and items snap invisibly back below. */
  const [played, setPlayed] = useState(false)

  const rowsIn = phase === 'cascade' || phase === 'booked' || phase === 'done'
  const booked = phase === 'booked' || phase === 'done'
  const results = phase === 'sent' || phase === 'searching' || rowsIn
  const lineIn = phase === 'searching' || rowsIn

  /* whole-object blur-emerge (the signature move); glass revives on landing */
  const fly = (slot: number, exitDelay = 0) => ({
    initial: reduced ? false : ({ ...HIDDEN, y: RISE[slot] } as const),
    animate: rowsIn
      ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
      : played
        ? { opacity: 0, scale: 0.95, y: 0, filter: 'blur(10px)' }
        : { opacity: 0, scale: 0.95, y: RISE[slot], filter: 'blur(10px)' },
    transition: rowsIn
      ? { duration: 1.2, delay: DELAY[slot], ease: EASE, opacity: { duration: 1.4, delay: DELAY[slot] + 0.05, ease: 'easeOut' } }
      : played
        ? { duration: 0.5, delay: exitDelay, ease: EASE }
        : { duration: 0 },
  }) as const

  /* "Searching" centers on the line's 300px width, then slides to the
     line origin before transforming into the count */
  const searchRef = useRef<HTMLSpanElement | null>(null)
  const [centerX, setCenterX] = useState(122)
  useEffect(() => {
    if (phase === 'searching' && searchRef.current)
      setCenterX((300 - searchRef.current.offsetWidth) / 2)
  }, [phase])

  /* pill width animates as a number, measured off a hidden sizer holding
     both labels — no scale-based layout morphing */
  const bookRowRef = useRef<HTMLSpanElement | null>(null)
  const bookedRowRef = useRef<HTMLSpanElement | null>(null)
  const [pillW, setPillW] = useState<number | null>(null)
  useEffect(() => {
    const row = (booked ? bookedRowRef : bookRowRef).current
    if (row) setPillW(row.offsetWidth + 21) /* + padding 10×2 + border */
  }, [booked])

  return (
    <div className="sr-stack" aria-hidden="true">
      {/* the search field: absolute in the top slot, dissolves on send */}
      <AnimatePresence>
        {!results && (
          <motion.div
            key="bar"
            className="sr-bar"
            initial={reduced ? false : HIDDEN}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
            /* on cycle returns, wait for the results to finish dissolving
               before the field re-emerges */
            transition={{ duration: 0.45, delay: played ? 0.6 : 0, ease: EASE }}
          >
            <div className="sr-bar-row">
              {/* the magnifier never leaves — only the text beside it swaps */}
              <Magnifier />
              <AnimatePresence mode="wait" initial={false}>
                {phase === 'field' ? (
                  <motion.span key="placeholder" className="sr-dim64" {...SWAP}>
                    Search
                  </motion.span>
                ) : (
                  <motion.span key="query" className="sr-bar-fill" {...SWAP}>
                    <span>
                      <ResponseStream
                        key={sc.query}
                        as="span"
                        className="sr-stream"
                        textStream={sc.query}
                        mode="fade"
                        fadeDuration={340}
                        segmentDelay={140}
                        characterChunkSize={sc.query.length}
                      />
                    </span>
                    <span className="sr-send"><Plane /></span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* results line — item zero of the cascade, leading the hit */}
      <motion.div
        className="sr-for"
        initial={reduced ? false : { ...HIDDEN, y: RISE[0] }}
        animate={
          lineIn
            /* no backdrop on the line — filter can stay, avoiding the
               re-rasterize snap at landing */
            ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
            : played
              ? { opacity: 0, scale: 0.95, y: 0, filter: 'blur(10px)' }
              : { opacity: 0, scale: 0.95, y: RISE[0], filter: 'blur(10px)' }
        }
        transition={
          phase === 'searching'
            /* a status, not a result — it takes the bar's place in situ:
               y snaps home unseen, the emerge is opacity/scale/blur only */
            ? { duration: 0.45, delay: 0.12, ease: EASE, y: { duration: 0 } }
            : lineIn
              ? { duration: 1.2, delay: DELAY[0], ease: EASE, opacity: { duration: 1.2, delay: DELAY[0] + 0.05, ease: 'easeOut' } }
              : played
                ? { duration: 0.5, ease: EASE }
                : { duration: 0 }
        }
      >
        {/* one text object, two layers — "Searching" resolves into the
            results count in place instead of leaving and re-arriving */}
        <span className="sr-emerge sr-line-morph">
          <motion.span
            className="sr-line-layer"
            animate={{
              x: centerX, /* always centered — it leaves where it stands */
              opacity: phase === 'searching' ? 1 : 0,
              scale: phase === 'searching' ? 1 : 0.97,
              filter: phase === 'searching' ? 'blur(0px)' : 'blur(6px)',
            }}
            transition={{ x: { duration: 0 }, duration: 0.35, ease: EASE }}
          >
            <span ref={searchRef} className="sr-searching">Searching</span>
          </motion.span>
          <motion.span
            className="sr-line-layer"
            animate={{ opacity: rowsIn ? 1 : 0 }}
            transition={{ duration: 0.45, delay: rowsIn ? 0.32 : 0, ease: EASE }}
          >
            <span className="sr-dim64">{sc.count}</span>
            <span>{sc.label}</span>
          </motion.span>
        </span>
      </motion.div>

      {/* while searching: the providers tick past on a stepped conveyor */}
      <AnimatePresence>
        {phase === 'searching' && (
          <motion.div
            key="providers"
            className="sr-providers"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, delay: 0.3, ease: EASE } }}
            exit={{ opacity: 0, filter: 'blur(6px)', transition: { duration: 0.3, ease: EASE } }}
          >
            <ProviderStrip />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sr-group">
        {/* favored hit */}
        <motion.div
          className="sr-hit"
          initial={reduced ? false : { ...HIDDEN, y: RISE[1] }}
          animate={
            rowsIn
              ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
              : played
                ? { opacity: 0, scale: 0.95, y: 0, filter: 'blur(10px)' }
                : { opacity: 0, scale: 0.95, y: RISE[1], filter: 'blur(10px)' }
          }
          transition={
            rowsIn
              ? { duration: 1.2, delay: DELAY[1], ease: EASE, opacity: { duration: 1.2, delay: DELAY[1] + 0.05, ease: 'easeOut' } }
              : played
                ? { duration: 0.5, delay: 0.05, ease: EASE }
                : { duration: 0 }
          }
        >
          <motion.div className="sr-emerge sr-hit-inner">
          <div className="sr-hit-left">
            <div className="sr-thumb sr-thumb-lg" style={{ backgroundImage: `url(${sc.hit.thumb})` }} />
            <div className="sr-hit-col">
              <p className="sr-hit-name">{sc.hit.name}</p>
              <div className="sr-hit-meta">
                <span>{sc.hit.place}</span>
                <span className="sr-rating">{sc.hit.rating} <Star /> <span className="sr-count">{sc.hit.reviews}</span></span>
              </div>
            </div>
          </div>
          <motion.div
            className={`sr-book${booked ? ' is-booked' : ''}`}
            animate={{ width: pillW ?? undefined }}
            transition={{ width: { duration: 0.4, ease: EASE } }}
          >
            {/* hidden sizer: both labels, always mounted, purely for measurement */}
            <span className="sr-book-sizer" aria-hidden="true">
              <span ref={bookRowRef} className="sr-book-row">Book Now</span>
              <span ref={bookedRowRef} className="sr-book-row">Booked <CheckStatic /></span>
            </span>
            <AnimatePresence mode="wait" initial={false}>
              {booked ? (
                <motion.span key="booked" className="sr-book-row" {...SWAP}>
                  Booked <Check />
                </motion.span>
              ) : (
                <motion.span key="book" className="sr-book-row" {...SWAP}>
                  Book Now
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          </motion.div>
        </motion.div>

        {sc.rows.map((label, i) => (
          <div key={i} className="sr-row-wrap">
            <motion.div className="sr-row" {...fly(i + 2, 0.1 + i * 0.05)}>
              <motion.span className="sr-emerge sr-row-inner">
                <div
                  className="sr-thumb sr-thumb-sm"
                  style={{ backgroundImage: `url(/hero/${i === 0 ? 'icon-booking' : 'icon-expedia'}.png)` }}
                />
                <span>{label}</span>
              </motion.span>
            </motion.div>
            <motion.span style={{ display: 'inline-flex', flexShrink: 0 }} {...fly(i + 2, 0.1 + i * 0.05)}>
              <Chevron />
            </motion.span>
          </div>
        ))}
      </div>

    </div>
  )
}

/* stepped conveyor: not a glide — each provider hops to center stage,
   holds a beat, then yields to the next until all have had the window */
const PROVIDER_SLOT = 76 /* icon 24 + gap 52 */
function ProviderStrip() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers: number[] = []
    for (let k = 1; k < PROVIDERS.length; k++)
      timers.push(window.setTimeout(() => setStep(k), 900 + (k - 1) * 800))
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <motion.div
      className="sr-providers-strip"
      /* the active slot holds the window's center seat; each hop brings
         the next provider into it */
      animate={{ x: 98 - step * PROVIDER_SLOT }}
      initial={{ x: 98 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {PROVIDERS.map((p) => (
        <svg key={p.name} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label={p.name}>
          <path d={p.d} />
        </svg>
      ))}
    </motion.div>
  )
}

function Magnifier() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M17 17L21 21" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11C3 15.418 6.582 19 11 19C13.213 19 15.216 18.102 16.664 16.649C18.108 15.202 19 13.205 19 11C19 6.582 15.418 3 11 3C6.582 3 3 6.582 3 11Z" fill="none" stroke="currentColor" strokeOpacity="0.64" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Plane() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.846 7.151C1.546 7.216 1.315 7.458 1.265 7.762C1.214 8.065 1.355 8.369 1.618 8.527L8.135 12.442L14.354 8.087C14.694 7.849 15.161 7.932 15.399 8.271C15.637 8.611 15.554 9.078 15.215 9.316L8.995 13.671L10.445 21.134C10.504 21.436 10.742 21.672 11.044 21.728C11.347 21.785 11.653 21.651 11.817 21.39L22.792 3.939C22.953 3.683 22.945 3.357 22.771 3.109C22.598 2.862 22.294 2.743 21.999 2.806L1.846 7.151Z"
        fill="color(display-p3 1 1 1)"
      />
    </svg>
  )
}

function Star() {
  return (
    <svg width="13" height="13" viewBox="0 0 19.5 19.5" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path
        d="M6.978 6.693L9.088 2.442C9.357 1.896 10.142 1.896 10.412 2.442L12.523 6.693 17.242 7.378C17.848 7.467 18.089 8.208 17.651 8.63L14.237 11.939 15.043 16.608C15.146 17.21 14.512 17.666 13.972 17.383L9.75 15.176 5.529 17.383C4.989 17.666 4.354 17.21 4.456 16.608L5.262 11.939 1.85 8.63C1.41 8.208 1.652 7.467 2.259 7.378L6.978 6.693Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Chevron() {
  return (
    <svg
      width="6"
      height="6"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      style={{ rotate: '180deg', transformOrigin: '50% 50%', flexShrink: 0 }}
    >
      <path
        d="M5.737 1.473C5.852 1.267 6.148 1.267 6.263 1.473L10.949 9.929C11.06 10.129 10.915 10.375 10.687 10.375H1.313C1.085 10.375 0.94 10.129 1.051 9.929L5.737 1.473Z"
        fill="color(display-p3 0.96 0.58 0.52)"
        stroke="color(display-p3 0.96 0.58 0.52)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckStatic() {
  return (
    <svg width="12" height="12" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M3.75 9.75L6.75 12.75 14.25 5.25" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* the reply glyph — a drawn stroke rising out of the annotation, pointing on */
function Reply() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
      <path
        d="M22 10L8 10C0 10 0 21 8 21M22 10L15 3M22 10L15 17"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* the AI spark — marks the actions Autumn's system took by itself */
function Spark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
      <path
        d="M3 12C9.26752 12 12 9.36306 12 3C12 9.36306 14.7134 12 21 12C14.7134 12 12 14.7134 12 21C12 14.7134 9.26752 12 3 12Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* the check draws itself in after the label swap lands */}
      <motion.path
        d="M3.75 9.75L6.75 12.75 14.25 5.25"
        fill="none"
        stroke="color(display-p3 1 1 1)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.2, ease: EASE }}
      />
    </svg>
  )
}

/* the vignette's icon set, reusable by the demonstrative artifacts */
export { Magnifier as SrMagnifier, Star as SrStar, Chevron as SrChevron, CheckStatic as SrCheck, Spark as SrSpark, Reply as SrReply }
