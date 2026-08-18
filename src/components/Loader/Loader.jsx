import { motion } from 'framer-motion';
import './Loader.css';

export default function Loader() {
  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      aria-label="Loading site assets"
    >
      <div className="loader-track">
        <img 
          src="/loading_car.svg" 
          alt="Loading Mustang" 
          className="loader-car" 
        />
      </div>
    </motion.div>
  );
}
