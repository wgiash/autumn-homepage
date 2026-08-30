/* PROTOTYPE — the plain-english statement: one full-viewport serif
   paragraph saying what Autumn does, words inking up as it scrolls in
   (the reference's trailing-words-dim reveal). Copy is placeholder. */
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLang } from '../lib/i18n'

const TEXT =
  'Autumn is a marketing team for independent inns. We put your rooms in front of travelers searching Google, pay for the ads ourselves, and point every guest to book on your own website. When a guest we found books a stay, we take 13%. If no one books, you pay nothing.'

function Word({
  word,
  progress,
  start,
  end,
}: {
  word: string
  progress: MotionValue<number>
  start: number
  end: number
}) {
  const opacity = useTransform(progress, [start, end], [0.14, 1])
  return <motion.span style={{ opacity }}>{word} </motion.span>
}

export function Statement() {
  const { t } = useLang()
  /* track the paragraph itself — the section is viewport-tall with the
     text centered, so section geometry finishes the fill far too early */
  const pRef = useRef<HTMLParagraphElement | null>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: pRef,
    offset: ['start 0.92', 'end 0.55'],
  })
  const text = t(TEXT)
  const words = text.split(' ')
  return (
    <section className="svc stmt">
      <p ref={pRef} className="stmt-text">
        {reduced
          ? text
          : words.map((w, i) => (
              <Word
                key={i}
                word={w}
                progress={scrollYProgress}
                start={i / words.length}
                end={(i + 1) / words.length}
              />
            ))}
      </p>
    </section>
  )
}
