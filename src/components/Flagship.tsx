/* PROTOTYPE — the Flagship Program: the conversion moment the three CTAs
   point at. The terms are shown as the agreement artifact itself, in the
   cream dialect, instead of being claimed in marketing copy. */
import { Arrow } from './Nav'

export function Flagship() {
  return (
    <section id="flagship" className="svc flag">
      <div className="flag-copy">
        <h2 className="svc-h2">The Flagship Program.</h2>
        <p className="flag-sub">
          We run your Google marketing end to end and fund the ads ourselves.
          Nothing up front, and nothing at all unless bookings arrive.
        </p>
        <a className="btn-glass" href="mailto:hello@autumnplatform.com">
          Apply for the Flagship Program
          <Arrow />
        </a>
        <p className="flag-note">Now onboarding four properties for spring.</p>
      </div>
      <div className="flag-visual">
        <div className="art-stage art-city">
          {/* the agreement printed as the receipt it amounts to */}
          <div className="receipt">
            <div className="receipt-head">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 12.5" width="14" height="12.5" aria-hidden="true">
                <path
                  d="M0.563 12.5L0.563 9.505 6.981 4.9 0.443 8.067C0.197 7.652 0.136 6.896 0.136 6.568 0.429 2.93 2.783 1.216 3.923 0.811 6.66-0.432 11.461 0.025 13.514 0.409 14.052 2.989 11.58 4.554 10.277 5.016L12.781 5.016C12.539 6.903 9.951 7.835 8.689 8.067L11.377 8.067C10.741 9.309 9.403 10.234 8.81 10.543 6.709 11.878 3.454 11.368 2.09 10.943L2.09 12.5Z"
                  fill="currentColor"
                />
              </svg>
              <span className="receipt-brand">autumn</span>
              <span className="receipt-sub">The agreement, in full</span>
            </div>
            <div className="receipt-rule" />
            <div className="receipt-items">
              <div className="receipt-line"><span>Fixed monthly fee</span><span>$0</span></div>
              <div className="receipt-line"><span>Your budget at risk</span><span>$0</span></div>
              <div className="receipt-line"><span>Ad spend</span><span>Covered by Autumn</span></div>
            </div>
            <div className="receipt-rule" />
            <div className="receipt-line receipt-total"><span>Autumn earns</span><span>13% of driven bookings</span></div>
            <div className="receipt-rule" />
            <p className="receipt-note">If we don’t deliver, you pay nothing.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
