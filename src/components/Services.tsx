/* PROTOTYPE — services card row: tall visual with the service's artifact
   floating mid-frame (an email + its reply, a post, a search snippet + an
   AI answer), header then description below. Inns match the vignette. */
import { SrStar, SrSpark } from './SearchVignette'
import { useLang } from '../lib/i18n'
/* the reply glyph — a drawn stroke rising out of the reply, pointing on */
function ReplyArrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
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

const CARDS = [
  {
    lead: 'Email marketing',
    rest: 'that turns past guests into repeat stays, no discount codes needed',
    art: (
      <>
      <div className="art-float art-cream">
        <div className="art-stack">
          <div className="art-panel art-card">
            <div className="art-line">
              <span className="art-mail-from">
                <span className="sr-thumb sr-thumb-sm" style={{ backgroundImage: 'url(/hero/thumb-hit-2.jpg)' }} />
                Willow &amp; Vine
              </span>
              <span className="art-note">9:14 AM</span>
            </div>
            <div>
              <p className="art-strong art-truncate">October at the inn</p>
              <p className="sr-dim64 art-clamp2">The garden turns gold this month, and a few quiet weekends are still open.</p>
            </div>
          </div>
          <div className="sr-row">
            <ReplyArrow />
            <span className="art-fill">“Booked the garden room, see you in October.”</span>
          </div>
        </div>
      </div>
      </>
    ),
  },
  {
    lead: 'Social media',
    rest: 'that keeps your inn top of mind, posted in your voice',
    art: (
      <>
      <div className="art-float art-cream">
        <div className="art-stack">
          <div className="art-panel art-card is-stacked">
            <div className="art-post-img" style={{ backgroundImage: 'url(/hero/slide-4.jpg)' }}>
              {/* the outlink tag: this post points home */}
              <span className="art-outlink">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                driftwoodhouse.com
              </span>
            </div>
            <div className="art-line">
              <span className="art-iconline">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                214 <span className="sr-dim48">· 2,140 views</span>
              </span>
              <span className="sr-dim48">@driftwoodhouse</span>
            </div>
          </div>
        </div>
      </div>
      </>
    ),
  },
  {
    lead: 'Websites & AI SEO',
    rest: 'found by travelers on Google and ChatGPT alike',
    art: (
      <>
      <div className="art-float art-cream">
        <div className="art-stack">
          {/* the traveler asks, chat-style; the answer below cites the inn */}
          <div className="art-panel art-card art-chat-q">
            <p>I’m going to Bar Harbor for a while and I need a place to stay.</p>
          </div>
          {/* the AI answer, cited — the spark says who wrote it */}
          <div className="sr-row is-replied">
            <div className="sr-row-head">
              <SrSpark />
              <span>The Saltwater Inn — best overall</span>
            </div>
            <p className="sr-row-quote">
              Quiet harbor views and a serious breakfast; the best rate and late
              checkout book direct on their site.{' '}
              <span className="art-cite">
                <span className="art-cite-fav" style={{ backgroundImage: 'url(/hero/thumb-hit-6.jpg)' }} />
                thesaltwaterinn.com
              </span>
            </p>
          </div>
        </div>
      </div>
      </>
    ),
  },
] as const

const WIDE = [
  {
    lead: 'Dynamic pricing',
    rest: 'that keeps your best rate on your own site, adjusting to demand without you touching a thing',
    art: (
      <>
      <div className="art-float art-cream">
        <div className="art-stack">
          <div className="art-panel art-roomy">
            <div className="art-note">This week · Garden room</div>
            <div className="art-nights">
              <div className="art-night"><span className="art-night-day">Thu</span><span className="art-night-price">$169</span></div>
              <div className="art-night"><span className="art-night-day">Fri</span><span className="art-night-price">$189</span></div>
              <div className="art-night"><span className="art-night-day">Sat</span><span className="art-night-price art-amber">$205</span></div>
              <div className="art-night"><span className="art-night-day">Sun</span><span className="art-night-price">$158</span></div>
            </div>
            <div className="art-note">Sat auto-repriced ↑ at 4:02 pm.</div>
            <div className="art-rule" />
            <div className="art-line"><span className="sr-dim64">On the OTAs tonight</span><span className="sr-dim64">$214</span></div>
            <div className="art-line art-strong"><span>On your site</span><span>$189</span></div>
          </div>
          <div className="sr-row">
            <ReplyArrow />
            <span className="art-fill">Always the lowest price, on your own site.</span>
          </div>
        </div>
      </div>
      </>
    ),
  },
  {
    lead: 'Reputation',
    rest: 'that answers every review in your voice, within the day',
    art: (
      <>
      <div className="art-float art-cream">
        <div className="art-stack">
          <div className="art-panel">
            <div className="art-line">
              <span className="sr-rating sr-dim48">5.0 <SrStar /> <span className="sr-count">Google</span></span>
              <span className="art-note">2h ago</span>
            </div>
            <p className="sr-dim64">“The quietest weekend we’ve had in years.” — Marta</p>
          </div>
          <div className="sr-row is-replied">
            <div className="sr-row-head">
              <SrSpark />
              <span>Replied in your voice</span>
            </div>
            <p className="sr-row-quote">“So glad you got home safe, Marta. The fire’s lit for next fall.”</p>
          </div>
        </div>
      </div>
      </>
    ),
  },
] as const

export function Services() {
  const { t } = useLang()
  return (
    <section id="services" className="svc">
      <h2 className="svc-h2">{t('The rest of your marketing, handled.')}</h2>

      <div className="svc-cards">
        {WIDE.map((c) => (
          <article key={c.lead} className="svc-card is-wide">
            <div className="svc-card-img is-headed">
              <header className="svc-card-inhead">
                <h3 className="svc-card-title">
                  {t(c.lead)} <span className="svc-dim">{t(c.rest)}</span>
                </h3>
              </header>
              {c.art}
            </div>
          </article>
        ))}
        {CARDS.map((c) => (
          <article key={c.lead} className="svc-card">
            <div className="svc-card-img is-headed">
              {/* conversational: the service and its promise, inside the card */}
              <header className="svc-card-inhead">
                <h3 className="svc-card-title">
                  {t(c.lead)} <span className="svc-dim">{t(c.rest)}</span>
                </h3>
              </header>
              {c.art}
            </div>
          </article>
        ))}
      </div>

    </section>
  )
}
