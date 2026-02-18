import { Variants } from 'framer-motion'

export const fadeSoft: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: 'easeOut' 
    } 
  }
}

export const staggerSoft: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18
    }
  }
}

export const buttonElegant: Variants = {
  hover: { 
    scale: 1.04, 
    transition: { 
      duration: 0.3 
    } 
  }
}
