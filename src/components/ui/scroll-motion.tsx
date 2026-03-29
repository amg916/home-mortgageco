import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const fadeUp: Variants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, delay: custom }
  })
};

const AnimatedOnScroll = ({ children, className = "", delay = 0 }: Props) => {
  return (
    <motion.div
      className={className}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedOnScroll;
