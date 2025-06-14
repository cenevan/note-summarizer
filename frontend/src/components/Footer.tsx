import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-gray-400 text-sm text-center py-4 w-full">
    <p>&copy; {new Date().getFullYear()} AI Note Summarizer. All rights reserved.</p>
  </footer>
);

export default Footer;