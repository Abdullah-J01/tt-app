"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { GRADES, SUBJECTS } from "@/config/subjects";
import { cn } from "@/lib/utils";

/** Onboarding: grade + interests (UI brief §6.1). */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Set<string>>(new Set());

  const toggleSubject = (slug: string) =>
    setSubjects((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const canContinue = step === 0 ? grade !== null : subjects.size >= 3;

  const onContinue = () => {
    if (step === 0) setStep(1);
    else router.push("/feed"); // TODO(team): persist prefs, then enter the feed
  };

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col px-5 py-10">
      {/* Progress dots */}
      <div className="mb-8 flex justify-center gap-2">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn("h-2 w-2 rounded-full", i <= step ? "bg-violet" : "bg-hairline")}
          />
        ))}
      </div>

      {step === 0 ? (
        <section>
          <h1 className="text-2xl font-bold">What are you studying?</h1>
          <p className="mt-1 text-muted">Pick your level to tailor your feed.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {GRADES.filter((g) => g.slug !== "all").map((g) => (
              <Chip key={g.slug} selected={grade === g.slug} onClick={() => setGrade(g.slug)}>
                {g.label}
              </Chip>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h1 className="text-2xl font-bold">Pick a few interests</h1>
          <p className="mt-1 text-muted">Choose at least 3 subjects.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Chip key={s.slug} selected={subjects.has(s.slug)} onClick={() => toggleSubject(s.slug)}>
                {s.name}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <div className="mt-auto pt-8">
        <Button className="w-full" size="lg" disabled={!canContinue} onClick={onContinue}>
          {step === 0 ? "Continue" : "Start learning"}
        </Button>
      </div>
    </div>
  );
}
