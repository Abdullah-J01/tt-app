"use client";

import { Zap, BookOpen, Smartphone } from "lucide-react";
import FeatureCard from "./FeatureCard";
import {
  FloatingShard,
  FloatingBook,
  FloatingDevices,
} from "../three/Illustrations";

const features = [
  {
    icon: Zap,
    title: "Bite-sized cards",
    description: "Five-second insights you actually remember.",
    gradient: "bg-violet-gradient",
    illustration: <FloatingShard />,
  },
  {
    icon: BookOpen,
    title: "Thousands of studybooks",
    description: "A whole catalog, reimagined as cards.",
    gradient: "bg-green-gradient",
    illustration: <FloatingBook />,
  },
  {
    icon: Smartphone,
    title: "Learn on any device",
    description: "Phone, tablet, web — your streak follows.",
    gradient: "bg-plum-gradient",
    illustration: <FloatingDevices />,
  },
];

export default function FeatureCards() {
  return (
    <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-28">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {features.map((f, i) => (
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            gradient={f.gradient}
            index={i}
            illustration={f.illustration}
          />
        ))}
      </div>
    </section>
  );
}
