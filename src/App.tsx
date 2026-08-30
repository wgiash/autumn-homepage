import { Hero } from './components/Hero'
import { Statement } from './components/Statement'
import { HowItWorks } from './components/HowItWorks'
import { Services } from './components/Services'
import { Orbit } from './components/Orbit'
import { Stories } from './components/Stories'
import { Flagship } from './components/Flagship'
import { Footer } from './components/Footer'
import { useLenis } from './lib/useLenis'

/* hatched divider band between sections — hairline-bounded, blueprint style */
function Divider({ full = false }: { full?: boolean }) {
  return <div className={`divider${full ? ' is-full' : ''}`} aria-hidden="true" />
}

function App() {
  useLenis()
  return (
    <>
      <div className="frame-lines">
        <Hero />
        <Divider full />
        <Statement />
        <Divider />
        <HowItWorks />
        <Divider />
        <Orbit />
        {/* full width: it underlines the marquee's resting dock */}
        <Divider full />
        <Services />
        <Divider />
        <Stories />
        <Divider />
        <Flagship />
        <Divider full />
        <Footer />
      </div>
    </>
  )
}

export default App
