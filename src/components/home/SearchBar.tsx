"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className="hidden md:flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 cursor-text"
      animate={{ width: focused ? 340 : 220 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={16} className="text-muted shrink-0" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search studybooks, subjects…"
        aria-label="Search studybooks, subjects"
        className="w-full bg-transparent text-sm text-ink placeholder:text-muted outline-none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </motion.div>
  );
}
