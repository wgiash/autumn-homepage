/* PROTOTYPE — two-column section: headline + swapping visual on the left,
   accordion on the right; the open item drives the image. Each step now
   composites a demonstrative artifact — the vignette's glass objects —
   over the photo, so the swap shows a claim being proven, not a mood.
   One inn (The Brass Lantern, from the vignette's first scenario) is
   found in step 1, booked in step 3 and paid out in step 4. */
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { SrStar, SrCheck, SrReply } from './SearchVignette'
import { useLang } from '../lib/i18n'
import { Arrow } from './Nav'

const EASE = [0.22, 0.61, 0.36, 1] as const
const SWAP = {
  initial: { opacity: 0, filter: 'blur(6px)' },
  /* release the filter at landing — a resident filter on the composite
     would keep the artifact's backdrop glass rasterized dead */
  animate: { opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
  exit: { opacity: 0, filter: 'blur(6px)' },
  transition: { duration: 0.35, ease: EASE },
}

const STEPS = [
  {
    title: 'We put you in front of the right guests',
    body: 'Google Ads, Google Maps and Google Hotel Ads. Your property shows up when travelers search your area, above the OTAs.',
  },
  {
    title: 'We fund the ads ourselves',
    body: 'No fixed fees and none of your budget at risk. We cover the ad spend out of our own pocket.',
  },
  {
    title: 'Guests book direct with you',
    body: 'Bookings land on your own website at your best rate. Nothing leaks to middlemen.',
  },
  {
    title: 'We earn only when you do',
    body: 'We take 13% on the bookings we drive. If we don’t deliver, you pay nothing.',
  },
] as const

/* the owner's website — a globe drawn in the icon set's stroke */
function WebIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M3.33789 17C5.06694 19.989 8.29866 22 12.0001 22C15.7015 22 18.9332 19.989 20.6622 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33789 7C5.06694 4.01099 8.29866 2 12.0001 2C15.7015 2 18.9332 4.01099 20.6622 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 21.9506C13 21.9506 14.4079 20.0966 15.2947 16.9999" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 2.04932C13 2.04932 14.4079 3.90328 15.2947 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 21.9506C11 21.9506 9.59215 20.0966 8.70532 16.9999" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 2.04932C11 2.04932 9.59215 3.90328 8.70532 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10L10.5 15L12 10L13.5 15L15 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 10L2.5 15L4 10L5.5 15L7 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10L18.5 15L20 10L21.5 15L23 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* the rates card's delta triangle, marking the OTA markup */
function DeltaUp() {
  return (
    <svg width="7" height="7" viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-hidden="true">
      <path
        d="M4.303 1.105C4.389 0.95 4.611 0.95 4.697 1.105L8.212 7.447C8.295 7.597 8.186 7.781 8.015 7.781H0.985C0.814 7.781 0.705 7.597 0.788 7.447L4.303 1.105Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* the ad scatter behind step 2 — placements floating at depths */
const AD_TILES = [
  { head: 'Google', reach: '12.4k reached', img: 'slide-1', style: { left: '2%', top: '6%', width: 58, zIndex: 3 } },
  { head: 'Google Maps', reach: '3,105 views', img: 'slide-6', style: { right: '2%', top: '8%', width: 44, zIndex: 1 } },
  { head: 'Google Hotels', reach: '214 clicks', img: 'thumb-hit-3', style: { left: '3%', bottom: '0%', width: 62, zIndex: 3 } },
  { head: 'Google', reach: '8.2k reached', img: 'slide-7', style: { right: '3%', bottom: '-1%', width: 66, zIndex: 3 } },
  /* the deep field — specks receding into the air */
  { head: 'Google Maps', reach: '1,890 views', img: 'thumb-3', style: { left: '24%', top: '3%', width: 30, zIndex: 0 } },
  { head: 'Google Hotels', reach: '96 bookings', img: 'slide-3', style: { right: '24%', bottom: '2%', width: 26, zIndex: 0 } },
  { head: 'Hotels', reach: '77', img: 'thumb-1', style: { left: '34%', bottom: '3%', width: 32, zIndex: 0 } },
  { head: 'Google', reach: '5.4k', img: 'thumb-hit-6', style: { right: '35%', top: '2%', width: 28, zIndex: 0 } },
] as const

function AdTile({ t, progress }: { t: (typeof AD_TILES)[number]; progress: MotionValue<number> }) {
  /* a whisper of parallax — near tiles drift more than the specks */
  const amp = 3 + (t.style.width - 26) * 0.25
  const y = useTransform(progress, [0, 1], [amp, -amp])
  return (
    <motion.div
      className="art-ad"
      /* depth in four registers: size, haze, focus, and color — the far
         tiles desaturate and warm toward the dusk air */
      style={{
        ...t.style,
        y,
        opacity: 0.52 + (t.style.width - 26) * 0.005,
        filter: [
          `blur(${(0.55 + (70 - t.style.width) * 0.02).toFixed(2)}px)`,
          `saturate(${(1 - (70 - t.style.width) * 0.006).toFixed(2)})`,
          `sepia(${((70 - t.style.width) * 0.004).toFixed(2)})`,
        ].join(' '),
      }}
    >
      {/* type rides the tile's scale — distance shrinks it naturally */}
      <div
        className="art-ad-head"
        style={{
          fontSize: t.style.width * 0.075, /* pure proportion — no floor */
          lineHeight: 1.35,
          padding: `${t.style.width * 0.033}px ${t.style.width * 0.05}px`,
        }}
      >
        <span>{t.head}</span>
      </div>
      <div className="art-ad-img" style={{ backgroundImage: `url(/hero/${t.img}.jpg)` }} />
    </motion.div>
  )
}

function AdScatter() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <div ref={ref} className="art-ads" aria-hidden="true">
      {AD_TILES.map((t, i) => (
        <AdTile key={i} t={t} progress={scrollYProgress} />
      ))}
    </div>
  )
}

/* step artifacts — the claim, shown as the object it produces */
const ARTS = [
  /* 1 · the placement: pinned on the map, booked direct under it,
     the big names below at their bigger prices */
  <div className="art-stack">
    <div className="art-map">
      <div className="art-pin-spot">
        {/* the hotel-price bubble: lamp badge, best rate, tail to the spot */}
        <div className="map-price-pin">
          <span className="map-pin-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.87172 3.42759L4.23172 12.2276C4.11623 12.6126 4.4045 13 4.80642 13L19.1936 13C19.5955 13 19.8838 12.6126 19.7683 12.2276L17.1283 3.42759C17.0521 3.1738 16.8185 3 16.5536 3L7.44642 3C7.18145 3 6.94786 3.1738 6.87172 3.42759Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8 15L8 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 21H16M12 15L12 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          $189
        </div>
        <div className="art-map-chip">
          The Brass Lantern <span className="sr-rating sr-dim48">4.9 <SrStar /></span>
        </div>
      </div>
    </div>
    <div className="sr-row is-picked">
      <div className="sr-thumb sr-thumb-sm" style={{ backgroundImage: 'url(/hero/thumb-hit-1.jpg)' }} />
      <div className="art-fill sr-row-col">
        <span className="art-strong art-truncate">Owner’s website</span>
        <span className="sr-row-sub">Suggested</span>
      </div>
      <span className="art-strong">$189</span>
    </div>
    <div className="sr-row">
      <div className="sr-thumb sr-thumb-sm" style={{ backgroundImage: 'url(/hero/icon-booking.png)' }} />
      <span className="art-fill art-truncate">Booking.com</span>
      <span className="art-amber art-delta"><DeltaUp /> $25</span>
      <span>$214</span>
    </div>
    <div className="sr-row">
      <div className="sr-thumb sr-thumb-sm" style={{ backgroundImage: 'url(/hero/icon-expedia.png)' }} />
      <span className="art-fill art-truncate">Expedia</span>
      <span className="art-amber art-delta"><DeltaUp /> $35</span>
      <span>$224</span>
    </div>
    <div className="art-confirm">
      <span className="sr-book is-booked">Confirm booking</span>
    </div>
  </div>,

  /* 2 · the receipt over a sky of running ads */
  <>
  <AdScatter />
  <div className="art-stack">
    <div className="art-panel">
      <div className="art-line"><span className="sr-dim64">Ad spend · March</span><span>$1,240</span></div>
      <div className="art-line"><span className="sr-dim64">Covered by Autumn</span><span className="art-amber">−$1,240</span></div>
      <div className="art-rule" />
      <div className="art-line art-strong"><span>You owe</span><span>$0</span></div>
    </div>
  </div>
  </>,

  /* 3 · the bookings arrive like notifications, newest on top */
  <div className="art-stack">
    <div className="sr-hit is-expanded">
      <div className="sr-hit-main">
        <div className="sr-hit-left">
          <div className="sr-hit-col">
            <p className="sr-hit-name">The Brass Lantern</p>
            <div className="sr-hit-meta"><span>3 bookings this week</span></div>
          </div>
        </div>
        <div className="sr-hit-side">
          <div className="sr-book is-booked sr-status"><span className="sr-book-row">Fully booked <SrCheck /></span></div>
        </div>
      </div>
      <div className="sr-hit-expand">
        <div className="sr-hit-subrow">
          <span>Booked <span className="sr-dim64">· found on Google Maps</span></span>
          <span className="sr-hit-time">3h ago</span>
        </div>
        <div className="sr-hit-subrow">
          <span>Booked <span className="sr-dim64">· found on Google Ads</span></span>
          <span className="sr-hit-time">2d ago</span>
        </div>
        <div className="sr-hit-subrow">
          <span>Booked <span className="sr-dim64">· found on Google Hotel Ads</span></span>
          <span className="sr-hit-time">Last week</span>
        </div>
      </div>
    </div>
    <div className="sr-row">
      <WebIcon />
      <span className="art-fill art-truncate">Booked direct on thebrasslantern.com</span>
    </div>
  </div>,

  /* 4 · the ledger: 13% on driven bookings, nothing otherwise */
  <div className="art-stack">
    <div className="art-panel">
      <div className="art-line"><span className="sr-dim64">Booking · 3 nights</span><span>$567</span></div>
      <div className="art-line"><span className="sr-dim64">Autumn · 13%</span><span className="art-amber">$74</span></div>
      <div className="art-rule" />
      <div className="art-line art-strong"><span>Your inn keeps</span><span>$493</span></div>
    </div>
    <div className="sr-row">
      <SrReply />
      <span className="art-fill art-truncate">No bookings?</span>
      <span>Keep it all</span>
    </div>
  </div>,
] as const

export function HowItWorks() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section id="how-it-works" className="svc hiw">
      <h2 className="svc-h2 hiw-h2">{t('How it works.')}</h2>
      <div className="hiw-visual">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={open} className="hiw-img" {...SWAP}>
              <div className="art-stage art-cream">{ARTS[open]}</div>
            </motion.div>
          </AnimatePresence>
      </div>

      <div className="hiw-list">
        {STEPS.map((step, i) => {
          const isOpen = i === open
          return (
            <div key={step.title} className={`hiw-item${isOpen ? ' is-open' : ''}`}>
              <button className="hiw-item-head" onClick={() => setOpen(i)}>
                <span className={`hiw-item-title${isOpen ? '' : ' svc-dim'}`}>{t(step.title)}</span>
              </button>
              <motion.div
                className="hiw-item-body"
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {/* the content fades in on its own beat, drifting up into place */}
                <motion.div
                  initial={false}
                  animate={{ y: isOpen ? 0 : 8, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: isOpen ? 0.1 : 0 }}
                >
                  <p>{t(step.body)}</p>
                  <a className="btn-glass hiw-item-cta" href="#flagship">
                    {t('Flagship Program')}
                    <Arrow />
                  </a>
                </motion.div>
              </motion.div>
            </div>
          )
        })}
      </div>

    </section>
  )
}
