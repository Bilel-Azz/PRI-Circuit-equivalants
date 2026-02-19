"use client";

import { motion } from "framer-motion";

interface SlideWrapperProps {
  children: React.ReactNode;
  slideKey: number;
}

export default function SlideWrapper({ children, slideKey }: SlideWrapperProps) {
  return (
    <motion.div
      key={slideKey}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.12 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 200,
        duration: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
}
