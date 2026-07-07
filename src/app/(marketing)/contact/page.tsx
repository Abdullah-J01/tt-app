"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import BackgroundGradient from "@/components/home/BackgroundGradient";
import FloatingCircle from "@/components/home/FloatingCircle";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useZodForm } from "@/components/ui/Form";

const channels = [
  {
    icon: Mail,
    title: "Email us",
    detail: "hello@studybooks.app",
    body: "For partnerships, press, or anything that needs a paper trail.",
  },
  {
    icon: MessageCircle,
    title: "Live chat",
    detail: "Mon–Fri, 9am–6pm",
    body: "In-app chat inside the StudyBooks app gets the fastest reply.",
  },
  {
    icon: MapPin,
    title: "Studio",
    detail: "Berlin, Germany",
    body: "We're a small, remote-first team based across three timezones.",
  },
];

const topics = ["General question", "Partnership", "Press", "Bug report", "Something else"];

const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().min(1, "Email is required").pipe(z.email("Enter a valid email")),
  message: z.string().min(1, "Please enter a message"),
});

export default function ContactPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useZodForm(contactSchema);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const onValid = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1100);
  };

  return (
    <main className="relative min-h-screen bg-white">
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-40 pb-20 sm:px-6 sm:pt-48 lg:px-8">
        <BackgroundGradient />
        <FloatingCircle />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-caption text-violet mb-4 font-semibold tracking-widest uppercase"
        >
          Contact
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-h1 text-ink max-w-2xl sm:text-[3.25rem]"
        >
          Say hello. We actually read these.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-body text-muted mt-6 max-w-lg"
        >
          Questions, feedback, partnership ideas, or just want to tell us your current streak? Pick
          a channel below or use the form.
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1fr_1.15fr]">
          {/* Channels */}
          <div className="space-y-4">
            {channels.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="rounded-xl2 border-border shadow-soft hover:shadow-lift flex gap-4 border bg-white p-6 transition-shadow duration-400"
              >
                <div className="bg-violet-tint flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <c.icon size={18} className="text-violet" />
                </div>
                <div>
                  <h3 className="font-display text-h3 text-ink">{c.title}</h3>
                  <p className="text-violet mt-0.5 text-sm font-medium">{c.detail}</p>
                  <p className="text-caption text-muted mt-1.5">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="rounded-xl3 border-border shadow-soft relative overflow-hidden border bg-white p-6 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                  >
                    <CheckCircle2 size={44} className="text-brand-green mb-4" />
                  </motion.div>
                  <h3 className="font-display text-h3 text-ink mb-1.5">Message sent</h3>
                  <p className="text-body text-muted max-w-xs">
                    Thanks for reaching out — we usually reply within one business day.
                  </p>
                  <Button
                    unstyled
                    onClick={() => {
                      reset();
                      setSubmitted(false);
                    }}
                    className="text-violet hover:text-violet-dark mt-6 text-sm font-medium transition-colors"
                  >
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  noValidate
                  onSubmit={handleSubmit(onValid)}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-caption text-ink mb-1.5 block font-medium">Name</span>
                      <Input
                        unstyled
                        type="text"
                        placeholder="Ada Lovelace"
                        className="border-border text-ink placeholder:text-muted/70 focus:border-violet focus:ring-violet/15 w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none focus:ring-2"
                        {...register("name")}
                      />
                      <FieldError className="mt-1.5">{errors.name?.message}</FieldError>
                    </label>
                    <label className="block">
                      <span className="text-caption text-ink mb-1.5 block font-medium">Email</span>
                      <Input
                        unstyled
                        type="email"
                        placeholder="ada@example.com"
                        className="border-border text-ink placeholder:text-muted/70 focus:border-violet focus:ring-violet/15 w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none focus:ring-2"
                        {...register("email")}
                      />
                      <FieldError className="mt-1.5">{errors.email?.message}</FieldError>
                    </label>
                  </div>

                  <div>
                    <span className="text-caption text-ink mb-2 block font-medium">Topic</span>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <Button
                          unstyled
                          type="button"
                          key={t}
                          onClick={() => setTopic(t)}
                          className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            topic === t
                              ? "text-white"
                              : "text-muted hover:text-ink border-border border"
                          }`}
                        >
                          {topic === t && (
                            <motion.span
                              layoutId="topic-pill"
                              className="bg-violet absolute inset-0 rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            />
                          )}
                          <span className="relative z-10">{t}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-caption text-ink mb-1.5 block font-medium">Message</span>
                    <Textarea
                      unstyled
                      rows={5}
                      placeholder="Tell us what's on your mind..."
                      className="border-border text-ink placeholder:text-muted/70 focus:border-violet focus:ring-violet/15 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2"
                      {...register("message")}
                    />
                    <FieldError className="mt-1.5">{errors.message?.message}</FieldError>
                  </label>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="bg-ink hover:bg-violet inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-colors duration-300 disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Send size={15} />
                    )}
                    {loading ? "Sending…" : "Send message"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
