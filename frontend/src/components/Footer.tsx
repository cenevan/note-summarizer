import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-[#001f3f] to-[#004080] text-white text-sm text-center py-4 w-full">
    <p>&copy; {new Date().getFullYear()} Note AI. All rights reserved.</p>
  </footer>
);

export default Footer;