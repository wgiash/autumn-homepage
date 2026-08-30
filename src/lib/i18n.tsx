/* Hand-rolled EN/ES: the page speaks the reader's language, the artifacts
   stay English on purpose — they depict what guests and Google actually
   show. EN strings are the keys; ES lines are kept near-equal in length
   so no layout breathes differently. */
import { createContext, useContext, useState, type ReactNode } from 'react'

const ES: Record<string, string> = {
  // nav + footer
  'How it Works': 'Cómo funciona',
  'Results': 'Resultados',
  'Careers': 'Empleo',
  'Services': 'Servicios',
  'Contact': 'Contacto',
  'Flagship Program': 'Programa Flagship',
  // hero
  'AI-Enabled Digital Marketing': 'Marketing digital impulsado por IA',
  'Best in class digital marketing. Now available for boutique hotels.':
    'Marketing digital de primer nivel. Ahora para hoteles boutique.',
  'Apply for our Flagship Program': 'Aplica al Programa Flagship',
  // statement
  'Autumn is a marketing team for independent inns. We put your rooms in front of travelers searching Google, pay for the ads ourselves, and point every guest to book on your own website. When a guest we found books a stay, we take 13%. If no one books, you pay nothing.':
    'Autumn es un equipo de marketing para posadas independientes. Ponemos tus habitaciones frente a viajeros que buscan en Google, pagamos los anuncios nosotros, y dirigimos a cada huésped a reservar en tu propia web. Cuando un huésped que encontramos reserva, cobramos 13%. Si nadie reserva, no pagas nada.',
  // how it works
  'How it works.': 'Cómo funciona.',
  'We put you in front of the right guests': 'Te ponemos frente a los huéspedes correctos',
  'Google Ads, Google Maps and Google Hotel Ads. Your property shows up when travelers search your area, above the OTAs.':
    'Google Ads, Google Maps y Google Hotel Ads. Tu propiedad aparece cuando los viajeros buscan tu zona, por encima de las OTAs.',
  'We fund the ads ourselves': 'Nosotros pagamos los anuncios',
  'No fixed fees and none of your budget at risk. We cover the ad spend out of our own pocket.':
    'Sin tarifas fijas y sin arriesgar tu presupuesto. Cubrimos la inversión publicitaria de nuestro bolsillo.',
  'Guests book direct with you': 'Los huéspedes reservan directo contigo',
  'Bookings land on your own website at your best rate. Nothing leaks to middlemen.':
    'Las reservas llegan a tu propia web con tu mejor tarifa. Nada se filtra a intermediarios.',
  'We earn only when you do': 'Solo ganamos cuando tú ganas',
  'We take 13% on the bookings we drive. If we don’t deliver, you pay nothing.':
    'Cobramos 13% de las reservas que generamos. Si no cumplimos, no pagas nada.',
  // orbit
  'Meanwhile, at your inn.': 'Mientras tanto, en tu posada.',
  // services
  'The rest of your marketing, handled.': 'El resto de tu marketing, resuelto.',
  'Dynamic pricing': 'Precios dinámicos',
  'that keeps your best rate on your own site, adjusting to demand without you touching a thing':
    'que mantienen tu mejor tarifa en tu web, ajustándose a la demanda sin que toques nada',
  'Reputation': 'Reputación',
  'that answers every review in your voice, within the day':
    'que responde cada reseña con tu voz, el mismo día',
  'Email marketing': 'Email marketing',
  'that turns past guests into repeat stays, no discount codes needed':
    'que convierte huéspedes pasados en estancias repetidas, sin códigos de descuento',
  'Social media': 'Redes sociales',
  'that keeps your inn top of mind, posted in your voice':
    'que mantienen tu posada presente, publicadas con tu voz',
  'Websites & AI SEO': 'Webs y SEO con IA',
  'found by travelers on Google and ChatGPT alike':
    'encontradas por viajeros en Google y también en ChatGPT',
  // stories
  'Proof from properties like yours.': 'Pruebas de propiedades como la tuya.',
  'Join them': 'Únete',
  // flagship
  'The Flagship Program.': 'El Programa Flagship.',
  'We run your Google marketing end to end and fund the ads ourselves. Nothing up front, and nothing at all unless bookings arrive.':
    'Gestionamos tu marketing en Google de principio a fin y pagamos los anuncios. Nada por adelantado, y nada en absoluto si no llegan reservas.',
  'Apply for the Flagship Program': 'Aplica al Programa Flagship',
  'Now onboarding four properties for spring.': 'Incorporando cuatro propiedades para primavera.',
}

type Lang = 'en' | 'es'
type LangValue = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string }

const Ctx = createContext<LangValue>({ lang: 'en', setLang: () => {}, t: (s) => s })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (s: string) => (lang === 'es' ? (ES[s] ?? s) : s)
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}
