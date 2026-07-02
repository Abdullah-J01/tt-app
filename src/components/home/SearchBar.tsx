"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function SearchBar() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className="border-border hidden cursor-text items-center gap-2 rounded-full border bg-white/70 px-4 py-2 md:flex"
      animate={{ width: focused ? 340 : 220 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onClick={() => inputRef.current?.focus()}
    >
      <Search size={16} className="text-muted shrink-0" aria-hidden="true" />
      <Input
        unstyled
        ref={inputRef}
        type="text"
        placeholder="Search studybooks, subjects…"
        aria-label="Search studybooks, subjects"
        className="text-ink placeholder:text-muted w-full bg-transparent text-sm outline-none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </motion.div>
  );
}
