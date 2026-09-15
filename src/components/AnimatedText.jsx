import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function Character({ char, progress, range }) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {char}
    </motion.span>
  );
}

function Word({ word, progress, start, end }) {
  const characters = word.split('');
  const amount = end - start;
  const step = amount / characters.length;

  return (
    <span className="inline-block whitespace-nowrap mr-[0.3em]">
      {characters.map((char, i) => {
        const charStart = start + i * step;
        const charEnd = charStart + step;
        return (
          <Character
            key={`char-${i}-${char}`}
            char={char}
            progress={progress}
            range={[charStart, charEnd]}
          />
        );
      })}
    </span>
  );
}

export function AnimatedText({ text, className = '' }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.35'],
  });

  const words = text.split(' ');

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word
            key={`word-${i}-${word}`}
            word={word}
            progress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
}

export default AnimatedText;
