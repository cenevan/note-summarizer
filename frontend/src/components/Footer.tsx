import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => (
  <motion.footer
    className="sticky bottom-0 z-50 bg-gradient-to-r from-[#001f3f] to-[#004080] text-white text-sm text-center py-4 w-full shadow-xl"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <p>&copy; {new Date().getFullYear()} Note AI. All rights reserved.</p>
  </motion.footer>
);

export default Footer;