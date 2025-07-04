import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-[#001f3f] to-[#004080] text-white text-sm text-center py-4 w-full">
    <p>
      &copy; {new Date().getFullYear()} SmartNotes. All rights reserved.{" "}
      <a
        href="https://github.com/cenevan/note-summarizer/tree/main"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-300"
      >
        GitHub
      </a>
    </p>
  </footer>
);

export default Footer;