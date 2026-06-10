import { motion, useReducedMotion } from 'motion/react';

const luxuryEase = [0.22, 1, 0.36, 1];

const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const subtleVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export function LuxuryReveal({
  as = 'div',
  children,
  className = '',
  delay = 0,
  subtle = false,
  hover = false,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as] ?? motion.div;
  const variants = subtle ? subtleVariants : revealVariants;

  return (
    <Component
      className={className}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={variants}
      transition={{ duration: 0.54, delay, ease: luxuryEase }}
      whileHover={hover && !prefersReducedMotion ? { y: -3, scale: 1.01 } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

export function LuxuryStagger({ children, className = '', delay = 0, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.06,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const luxuryItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: luxuryEase },
  },
};

export function LuxuryItem({ as = 'div', children, className = '', ...props }) {
  const Component = motion[as] ?? motion.div;

  return (
    <Component className={className} variants={luxuryItemVariants} {...props}>
      {children}
    </Component>
  );
}