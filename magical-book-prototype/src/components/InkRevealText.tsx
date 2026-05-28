import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface InkRevealTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export const InkRevealText = ({
  text,
  delay = 0,
  speed = 0.03,
  onComplete
}: InkRevealTextProps) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
      if (onComplete) {
        setTimeout(onComplete, text.length * speed * 1000);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, text.length, speed, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={revealed ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="relative inline-block"
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: 'blur(8px)',
            textShadow: '0 0 20px rgba(139, 90, 43, 0.8)'
          }}
          animate={revealed ? {
            opacity: 1,
            filter: 'blur(0px)',
            textShadow: '0 0 0px rgba(139, 90, 43, 0)'
          } : {}}
          transition={{
            delay: index * speed,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="inline-block"
          style={{
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

interface InkParagraphProps {
  children: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const InkParagraph = ({
  children,
  delay = 0,
  speed = 0.02,
  className = '',
  onComplete
}: InkParagraphProps) => {
  return (
    <p className={className}>
      <InkRevealText
        text={children}
        delay={delay}
        speed={speed}
        onComplete={onComplete}
      />
    </p>
  );
};
