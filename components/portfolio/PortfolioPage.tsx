"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  codolioStats,
  createEmptyContactForm,
  sections,
  type CodolioStats,
  type ContactForm,
} from "@/lib/portfolio";
import {
  AtSign,
  Award,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Gamepad2,
  Globe,
  Mail,
  Menu,
  Palette,
  Send,
  Star,
  Trophy,
  X,
} from "lucide-react";

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState<ContactForm>(createEmptyContactForm());
  const [formStatus, setFormStatus] = useState("");
  const [formStatusType, setFormStatusType] = useState<"success" | "error" | "idle">("idle");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Fix #1: Sync loading duration precisely so TypewriterText starts fresh
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  // Fix #2: Active nav section via IntersectionObserver
  useEffect(() => {
    const sectionEls = sections.map((s) =>
      document.getElementById(s.toLowerCase())
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const updateField = (field: keyof ContactForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateContactForm = () => {
    const errors: Partial<Record<keyof ContactForm, string>> = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) errors.name = "Name is required.";
    if (!trimmedEmail) errors.email = "Email is required.";
    else if (!emailPattern.test(trimmedEmail)) errors.email = "Enter a valid email address.";
    if (!trimmedMessage) errors.message = "Message is required.";
    else if (trimmedMessage.length < 10) errors.message = "Message must be at least 10 characters.";

    return errors;
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateContactForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormStatusType("error");
      setFormStatus("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setFormStatusType("idle");
    setFormStatus("Sending...");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setFormStatusType("error");
        setFormStatus(data.error || "Failed to send message.");
        return;
      }

      // Fix #5: Show locked confirmation state on success
      setFormStatusType("success");
      setFormStatus(data.message || "Message sent successfully.");
      setFormData(createEmptyContactForm());
      setFormErrors({});
      setFormSubmitted(true);
    } catch (error) {
      console.error("Contact form request error:", error);
      setFormStatusType("error");
      setFormStatus("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      <ParticleBackground />

      <AnimatePresence>{isLoading ? <LoadingScreen /> : null}</AnimatePresence>

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        activeSection={activeSection}
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
        onCloseMenu={() => setMobileMenuOpen(false)}
      />

      {/* Fix #1: Pass isLoading so TypewriterText delays until screen is gone */}
      <HeroSection isLoading={isLoading} />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ResumeSection codolioStats={codolioStats} />
      <AchievementsSection />
      <ContactSection
        formData={formData}
        formStatus={formStatus}
        formStatusType={formStatusType}
        formErrors={formErrors}
        onChange={updateField}
        onSubmit={handleContactSubmit}
        isSubmitting={isSubmitting}
        formSubmitted={formSubmitted}
        onReset={() => setFormSubmitted(false)}
      />
      <Footer />
    </div>
  );
}

// ─── ParticleBackground ───────────────────────────────────────────────────────

function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0a]"
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.4 }}
      style={{ pointerEvents: "auto" }}
    >
      <div className="text-center">
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
          className="mb-6"
        >
          <Gamepad2 className="mx-auto h-14 w-14 text-yellow-400" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 font-mono text-2xl font-black uppercase tracking-[0.4em] text-white"
        >
          HKS STUDIO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500"
        >
          &gt;_ Initializing...
        </motion.p>
        <div className="mx-auto mt-6 h-px w-56 overflow-hidden bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "linear" }}
            className="h-full bg-yellow-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Navigation({
  mobileMenuOpen,
  activeSection,
  onToggleMenu,
  onCloseMenu,
}: {
  mobileMenuOpen: boolean;
  activeSection: string;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 70;
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top, behavior: "smooth" });
  }

  function handleMobileNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) {
    e.preventDefault();
    scrollToSection(sectionId); // scroll first
    onCloseMenu();              // then close menu
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a
          href="#home"
          className="font-mono text-xl font-black uppercase tracking-[0.2em] text-white"
        >
          <span className="inline-flex items-center border border-yellow-400/45 bg-[#111]/90 px-3 py-1 font-mono text-sm tracking-[0.35em] text-yellow-400">
            HKS
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {sections.map((item) => {
            const isActive = activeSection === item.toLowerCase();
            return (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ color: "#facc15" }}
                transition={{ duration: 0.15 }}
                className={`relative font-mono text-xs uppercase tracking-[0.2em] transition-colors ${isActive ? "text-yellow-400" : "text-zinc-400"
                  }`}
              >
                {item}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute -bottom-1 left-0 h-px w-full bg-yellow-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.a>
            );
          })}
        </div>

        <button
          type="button"
          className="text-zinc-400 transition-colors hover:text-yellow-400 md:hidden"
          aria-label="Toggle navigation menu"
          onClick={onToggleMenu}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-800 bg-[#111] md:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {sections.map((item) => {
                const sectionId = item.toLowerCase();
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={item}
                    href={`#${sectionId}`}
                    className={`block border-b border-zinc-800 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors last:border-b-0 ${
                      isActive ? "text-yellow-400" : "text-zinc-400"
                    }`}
                    style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                    onClick={(e) => handleMobileNavClick(e, sectionId)}
                  >
                    {item}
                  </a>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

// Fix #1: Accept isLoading to delay TypewriterText until loading screen exits
function HeroSection({ isLoading }: { isLoading: boolean }) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,204,21,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          WebkitMaskImage:
            "radial-gradient(ellipse 38% 52% at 73% 38%, transparent 0%, transparent 40%, rgba(0,0,0,0.2) 58%, rgba(0,0,0,0.7) 72%, #000 88%)",
          maskImage:
            "radial-gradient(ellipse 38% 52% at 73% 38%, transparent 0%, transparent 40%, rgba(0,0,0,0.2) 58%, rgba(0,0,0,0.7) 72%, #000 88%)",
        }}
      />

      {/* Corner bracket markers */}
      <div className="absolute left-8 top-28 z-10 h-8 w-8 border-l-2 border-t-2 border-yellow-400/60" />
      <div className="absolute right-8 top-28 z-10 h-8 w-8 border-r-2 border-t-2 border-yellow-400/60" />
      <div className="absolute bottom-8 left-8 z-10 h-8 w-8 border-b-2 border-l-2 border-yellow-400/60" />
      <div className="absolute bottom-8 right-8 z-10 h-8 w-8 border-b-2 border-r-2 border-yellow-400/60" />

      {/* Portrait — behind content */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full md:w-[62%]"
        aria-hidden="true"
      >
        <Image
          src="/profile.png"
          alt=""
          fill
          priority
          className="h-full w-full object-cover"
          style={{
            opacity: 0.75,
            objectPosition: "70% 18%",
            filter: "grayscale(90%) sepia(10%) brightness(1) contrast(1.08)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #0a0a0a 0%, #0a0a0a 14%, rgba(10,10,10,0.88) 24%, rgba(10,10,10,0.60) 38%, rgba(10,10,10,0.20) 58%, rgba(10,10,10,0.04) 76%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "18%",
            background: "linear-gradient(to bottom, #0a0a0a 0%, rgba(10,10,10,0.50) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "18%",
            background: "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.50) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: "20%",
            background: "linear-gradient(to left, rgba(10,10,10,0.50) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 80% at 65% 38%, transparent 42%, rgba(10,10,10,0.30) 70%, rgba(10,10,10,0.70) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 62% 40%, rgba(250,204,21,0.04) 0%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-6">
        <div className="w-full text-center md:w-1/2 md:text-left">

          {/* Operator badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 inline-flex items-center gap-3 border border-yellow-400/40 bg-yellow-400/5 px-4 py-1.5"
          >
            <span className="h-2 w-2 bg-yellow-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
              Operator Online — HKS Studio
            </span>
            <span className="h-2 w-2 bg-yellow-400" />
          </motion.div>

          {/* Name block */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-5xl font-black uppercase leading-none sm:text-7xl md:text-8xl"
            style={{
              fontFamily: '"Rajdhani", "Segoe UI", sans-serif',
              letterSpacing: "0.22em",
            }}
          >
            <span className="block text-white" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
              HEMANT
            </span>
            <span
              className="relative inline-block pt-2 text-yellow-400"
              style={{ letterSpacing: "0.28em", textShadow: "0 2px 12px rgba(250,204,21,0.18)" }}
            >
              SHARMA
              <span className="absolute left-1/2 top-full mt-2 block h-px w-[78%] -translate-x-1/2 bg-yellow-400/60" />
            </span>
          </motion.h1>

          {/* Role tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
          >
            {["Full Stack Dev", "ML Engineer", "Designer", "Gamer"].map((role) => (
              <span
                key={role}
                className="border border-zinc-600 bg-zinc-900/80 px-3 py-1 font-mono text-xs uppercase tracking-widest text-zinc-300"
              >
                {role}
              </span>
            ))}
          </motion.div>

          {/* Fix #1: Only render TypewriterText after loading screen is gone */}
          {!isLoading && (
            <TypewriterText text="Building digital experiences and intelligent systems" />
          )}

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mx-auto mt-8 h-px w-64 origin-left bg-yellow-400/50 md:mx-0"
          />

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start"
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-yellow-400 px-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-yellow-300"
            >
              ▶ View My Work
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border border-zinc-500 bg-transparent px-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-yellow-400 hover:text-yellow-400"
            >
              ⬡ Get In Touch
            </motion.a>
          </motion.div>

          {/* Fix #8: Hide scroll indicator on mobile — it competes with portrait bleed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-14 hidden flex-col items-start gap-2 md:flex"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              Scroll
            </span>
            <motion.div
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="h-10 w-px origin-top bg-yellow-400"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─── TypewriterText ───────────────────────────────────────────────────────────

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  // Fix #1: No animation delay — starts immediately since isLoading gate controls timing
  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index += 1;
      } else {
        window.clearInterval(interval);
      }
    }, 40);
    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <p className="mt-5 min-h-7 font-mono text-sm text-zinc-400 sm:text-base">
      &gt;_ {displayedText}
      <span className="animate-pulse text-yellow-400">█</span>
    </p>
  );
}

// ─── SectionShell ─────────────────────────────────────────────────────────────

// Fix #7: Added scroll-mt-20 so fixed nav doesn't cover section anchors
function SectionShell({
  id,
  title,
  accent,
  children,
}: Readonly<{
  id: string;
  title: string;
  accent: string;
  children: ReactNode;
}>) {
  return (
    <motion.section
      id={id}
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="mb-14">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-8 bg-yellow-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-yellow-400">
            {id}
          </span>
        </div>
        <h2 className="text-4xl font-black uppercase text-white sm:text-5xl">
          {title} <span className="text-yellow-400">{accent}</span>
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

// ─── AboutSection ─────────────────────────────────────────────────────────────

function AboutSection() {
  const stats = [
    { icon: Code2, label: "Projects", count: "25+" },
    { icon: Brain, label: "ML Models", count: "10+" },
    { icon: Palette, label: "Designs", count: "20+" },
    { icon: Gamepad2, label: "Competitions", count: "30+" },
  ];

  return (
    <SectionShell id="about" title="About" accent="Me">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-5 text-base leading-8 text-zinc-400"
        >
          <p>
            I&apos;m a{" "}
            <span className="font-semibold text-white">multi-disciplinary creator</span> blending
            software, machine learning, design, and gaming culture into immersive digital work.
          </p>
          <p>
            My approach mixes{" "}
            <span className="font-semibold text-yellow-400">algorithmic thinking</span> with creative
            problem-solving — whether I&apos;m building intelligent systems or polishing user
            interfaces.
          </p>
          <p>
            I&apos;m currently pursuing a B.Tech in Computer Science while shipping projects that
            stretch across web, data, and interactive product design.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="border border-zinc-800 bg-[#111] p-6 text-center transition-colors hover:border-yellow-400/40"
            >
              <item.icon className="mx-auto mb-3 h-7 w-7 text-yellow-400" />
              <div className="text-3xl font-black text-white">{item.count}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

// ─── SkillsSection ────────────────────────────────────────────────────────────

function SkillsSection() {
  const groups = [
    {
      category: "Frontend",
      skills: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"],
    },
    {
      category: "Backend",
      skills: ["Python", "FastAPI", "Node.js", "SQL", "REST APIs"],
    },
    {
      category: "Machine Learning",
      skills: ["TensorFlow", "Scikit-learn", "NLP", "Computer Vision", "Deep Learning"],
    },
    {
      category: "Design & Gaming",
      skills: ["Figma", "UI/UX Design", "Game Design", "Prototyping", "Design Systems"],
    },
  ];

  return (
    <SectionShell id="skills" title="Technical" accent="Skills">
      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((group, index) => (
          <motion.div
            key={group.category}
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            viewport={{ once: true }}
            className="border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/40"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-4 w-0.5 bg-yellow-400" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                {group.category}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.04 }}
                  className="border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-yellow-400/50 hover:text-yellow-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

// ─── ProjectsSection ──────────────────────────────────────────────────────────

// Fix #3: Expanded descriptions + corrected GitHub links for all projects
function ProjectsSection() {
  const projects = [
    {
      title: "Video Game Sales Intelligence",
      description:
        "Full-stack ML dashboard for gaming market analytics. Integrates sales forecasting, genre trend analysis, and interactive Chart.js visualisations backed by a FastAPI data layer.",
      tech: ["React", "FastAPI", "Scikit-Learn", "Chart.js"],
      link: "https://vgsi.vercel.app",
      github: "https://github.com/artist-hks/Video-games-sales-intelligence",
      index: "01",
    },
    {
      title: "Neural Networks From Scratch",
      description:
        "Deep learning library built from first principles using only NumPy — no frameworks. Implements backpropagation, activation functions, and gradient descent with full math derivations.",
      tech: ["Python", "NumPy", "Jupyter", "Mathematics"],
      github: "https://github.com/artist-hks/Neural-Networks-From-Scratch",
      index: "02",
    },
    {
      title: "Diabetes Risk Prediction",
      description:
        "End-to-end ML pipeline for early diabetes risk assessment. Covers feature engineering, SMOTE oversampling, model comparison, and a clean classification report with 87%+ accuracy.",
      tech: ["Scikit-Learn", "Pandas", "Python", "Classification"],
      github: "https://github.com/artist-hks/Diabetes-Risk-Prediction",
      index: "03",
    },
    {
      title: "Game Addiction Detection",
      description:
        "Behavioural analysis model that identifies high-risk gaming patterns from user activity data. Combines NLP on session logs with a deep learning classifier for real-time risk scoring.",
      tech: ["TensorFlow", "NLP", "Deep Learning", "Analytics"],
      github: "https://github.com/artist-hks/Game-Addiction-Detection",
      index: "04",
    },
    {
      title: "Skin Disease Classification",
      description:
        "CNN-based medical imaging classifier trained on dermoscopy datasets. Achieves multi-class disease detection using transfer learning with MobileNetV2 and Grad-CAM explainability.",
      tech: ["TensorFlow", "Keras", "Computer Vision", "Medical AI"],
      github: "https://github.com/artist-hks/Skin-Disease-Classification",
      index: "05",
    },
    {
      title: "Portfolio Website",
      description:
        "This site — a military-tactical single-page portfolio with a custom cursor, particle grid, framer motion transitions, a live contact API, and a gaming-inspired loading sequence.",
      tech: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript"],
      github: "https://github.com/artist-hks/portfolio",
      index: "06",
    },
  ];

  return (
    <SectionShell id="projects" title="Featured" accent="Projects">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.06 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="flex flex-col border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/40"
          >
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              Mission {project.index}
            </div>
            <h3 className="mb-2 text-lg font-black uppercase text-white">{project.title}</h3>
            <p className="mb-5 flex-1 text-sm leading-6 text-zinc-400">{project.description}</p>

            <div className="mb-5 flex flex-wrap gap-2">
              {project.tech.map((item) => (
                <span
                  key={item}
                  className="border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-zinc-400"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-auto flex gap-5 border-t border-zinc-800 pt-4 text-xs">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wide text-yellow-400 transition-colors hover:text-yellow-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live
                </a>
              ) : null}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wide text-zinc-400 transition-colors hover:text-white"
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionShell>
  );
}

// ─── ExperienceSection ────────────────────────────────────────────────────────

// Fix #4: Removed duplicate Codolio stats block — those now live only in ResumeSection
function ExperienceSection() {
  const entries = [
    {
      role: "UI/UX Designer",
      company: "EUONUS IT",
      period: "Jan 2025 – Nov 2025",
      description:
        "Designed web and mobile interfaces, built component systems, and improved usability through prototyping.",
      skills: ["Figma", "UI Design", "User Research", "Design Systems"],
    },
    {
      role: "Web Developer & ML Engineer",
      company: "Freelancer",
      period: "Jan 2023 – Present",
      description:
        "Built client-facing web products and machine learning workflows spanning dashboards, APIs, and predictions.",
      skills: ["React", "Python", "FastAPI", "Machine Learning"],
    },
    {
      role: "Student & Creator",
      company: "Poornima Institute of Engineering & Technology",
      period: "2022 – Present",
      description:
        "Pursuing B.Tech in Computer Science while shipping side projects and participating in coding competitions.",
      skills: ["Full-Stack Dev", "AI/ML", "Game Design", "Competitive Programming"],
    },
  ];

  return (
    <SectionShell id="experience" title="Experience" accent="& Work">
      <div className="relative space-y-6 pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-zinc-800">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.role}
            initial={{ x: -16, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/30"
          >
            <div className="absolute -left-[1.375rem] top-6 h-2.5 w-2.5 border border-yellow-400 bg-[#0a0a0a]" />
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black uppercase text-white">{entry.role}</h3>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.15em] text-yellow-400">
                  {entry.company}
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-500">{entry.period}</span>
            </div>
            <p className="mb-4 text-sm leading-7 text-zinc-400">{entry.description}</p>
            <div className="flex flex-wrap gap-2">
              {entry.skills.map((skill) => (
                <span
                  key={skill}
                  className="border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

// ─── ResumeSection ────────────────────────────────────────────────────────────

// Fix #4: Codolio stats now only appear here — removed from ExperienceSection
function ResumeSection({ codolioStats }: { codolioStats: CodolioStats | null }) {
  return (
    <SectionShell id="resume" title="Resume" accent="& Downloads">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/30"
        >
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="text-xl font-black uppercase text-white">Professional Resume</h3>
          </div>
          <p className="mb-5 text-sm leading-7 text-zinc-400">
            A concise recruiter-friendly resume covering projects, skills, experience, and achievements.
          </p>
          <div className="mb-6 space-y-2.5 text-sm text-zinc-500">
            {[
              "ATS-friendly summary and role highlights",
              "Technical stack grouped by domain",
              "Certifications and major achievements",
            ].map((line) => (
              <p key={line} className="flex items-center gap-2">
                <span className="text-yellow-400">▸</span>
                {line}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.a
              href="/Resume.pdf"
              download="resume.pdf"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-yellow-400 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-yellow-300"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </motion.a>
            <motion.a
              href="https://drive.google.com/file/d/1PZw82Wzvlljq_tu1sgXjYJsyyZRqYBZW/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 border border-zinc-600 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-yellow-400/50 hover:text-yellow-400"
            >
              <ExternalLink className="h-4 w-4" />
              View Full
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/30"
        >
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900">
              <Code2 className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="text-xl font-black uppercase text-white">Codolio Profile</h3>
          </div>
          <p className="mb-5 text-sm leading-7 text-zinc-400">
            Competitive programming profile with coding activity, contests, and performance snapshots.
          </p>
          {codolioStats ? (
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { label: "Problems", value: codolioStats.problemsSolved },
                { label: "Rating", value: codolioStats.rating },
                { label: "Contests", value: codolioStats.contests },
                { label: "Streak", value: codolioStats.streak },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border border-zinc-800 bg-zinc-900 p-4 text-center"
                >
                  <div className="text-2xl font-black text-yellow-400">{stat.value}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <motion.a
            href="https://codolio.com/profile/artist_hks"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex w-full items-center justify-center gap-2 bg-yellow-400 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-yellow-300"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Profile
          </motion.a>
        </motion.div>
      </div>
    </SectionShell>
  );
}

// ─── AchievementsSection ──────────────────────────────────────────────────────

// Fix #9: Added specifics to all achievement descriptions
function AchievementsSection() {
  const achievements = [
    {
      icon: Trophy,
      title: "National Level Medals",
      description:
        "Gold and silver medals in national-level taekwondo and creative arts competitions across multiple years.",
      category: "Sports & Creative",
    },
    {
      icon: Award,
      title: "Technical Certifications",
      description:
        "Certified in Agentic AI (Anthropic), ML fundamentals (Google), and completed hands-on deep learning workshops.",
      category: "Certifications",
    },
    {
      icon: Star,
      title: "Open Source Projects",
      description:
        "6+ production-grade public repositories with documented codebases, clean architecture, and real-world impact.",
      category: "Open Source",
    },
    {
      icon: Code2,
      title: "Competitive Programming",
      description:
        "150+ problems solved on Codolio and LeetCode, 30+ contests entered, with a consistent improvement streak.",
      category: "Competitive",
    },
  ];

  return (
    <SectionShell id="achievements" title="Achievements" accent="& Awards">
      <div className="grid gap-6 md:grid-cols-2">
        {achievements.map((achievement, index) => (
          <motion.article
            key={achievement.title}
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="border border-zinc-800 bg-[#111] p-6 transition-colors hover:border-yellow-400/30"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900">
              <achievement.icon className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="mb-1.5 text-lg font-black uppercase text-white">{achievement.title}</h3>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-400">
              {achievement.category}
            </p>
            <p className="text-sm leading-6 text-zinc-400">{achievement.description}</p>
          </motion.article>
        ))}
      </div>
    </SectionShell>
  );
}

// ─── ContactSection ───────────────────────────────────────────────────────────

// Fix #5: formSubmitted / onReset props added for locked confirmation state
function ContactSection({
  formData,
  formStatus,
  formStatusType,
  formErrors,
  onChange,
  onSubmit,
  isSubmitting,
  formSubmitted,
  onReset,
}: {
  formData: ContactForm;
  formStatus: string;
  formStatusType: "success" | "error" | "idle";
  formErrors: Partial<Record<keyof ContactForm, string>>;
  onChange: (field: keyof ContactForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  formSubmitted: boolean;
  onReset: () => void;
}) {
  const contacts = [
    {
      icon: Mail,
      label: "Email",
      value: "artist.hks.dev@gmail.com",
      link: "mailto:artist.hks.dev@gmail.com",
    },
    {
      icon: BriefcaseBusiness,
      label: "LinkedIn",
      value: "linkedin.com/in/artisthks",
      link: "https://linkedin.com/in/artisthks",
    },
    {
      icon: Globe,
      label: "GitHub",
      value: "github.com/artist-hks",
      link: "https://github.com/artist-hks",
    },
    {
      icon: AtSign,
      label: "Codolio",
      value: "codolio.com/profile/artist_hks",
      link: "https://codolio.com/profile/artist_hks",
    },
  ];

  return (
    <SectionShell id="contact" title="Let's" accent="Connect">
      <div className="grid gap-12 md:grid-cols-2">
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className="text-base leading-7 text-zinc-400">
            Have an interesting project? Let&apos;s build something sharp, useful, and memorable
            together.
          </p>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <motion.a
                key={contact.label}
                href={contact.link}
                target={contact.link.startsWith("mailto:") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                whileHover={{ x: 6 }}
                transition={{ duration: 0.15 }}
                className="group flex items-center gap-4 border border-zinc-800 bg-[#111] px-4 py-3 transition-colors hover:border-yellow-400/40"
              >
                <contact.icon className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {contact.label}
                  </div>
                  <div className="text-sm font-medium text-zinc-300 group-hover:text-white">
                    {contact.value}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Fix #5: Show confirmation state when form submitted successfully */}
        <motion.div
          initial={{ x: 16, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <AnimatePresence mode="wait">
            {formSubmitted ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col items-center justify-center gap-6 border border-zinc-800 bg-[#111] p-10 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-yellow-400" />
                <div>
                  <h3 className="mb-2 text-xl font-black uppercase text-white">
                    Message Received
                  </h3>
                  <p className="text-sm leading-7 text-zinc-400">
                    Thanks for reaching out. I&apos;ll get back to you shortly.
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={onReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-zinc-600 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-yellow-400/50 hover:text-yellow-400"
                >
                  Send Another
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={onSubmit}
                className="space-y-4 border border-zinc-800 bg-[#111] p-6"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  required
                  className="w-full border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-400/60"
                />
                {formErrors.name ? (
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-400">
                    {formErrors.name}
                  </p>
                ) : null}
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(event) => onChange("email", event.target.value)}
                  required
                  className="w-full border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-400/60"
                />
                {formErrors.email ? (
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-400">
                    {formErrors.email}
                  </p>
                ) : null}
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={formData.message}
                  onChange={(event) => onChange("message", event.target.value)}
                  required
                  className="w-full resize-none border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-yellow-400/60"
                />
                {formErrors.message ? (
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-400">
                    {formErrors.message}
                  </p>
                ) : null}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 bg-yellow-400 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
                {formStatus && formStatusType === "error" ? (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center font-mono text-xs uppercase tracking-widest text-red-400"
                  >
                    Alert: {formStatus}
                  </motion.p>
                ) : null}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </SectionShell>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// Fix #6: Corrected icon mapping — Github for GitHub, Code2 for Codolio
function Footer() {
  const socials = [
    { icon: Code2, link: "https://github.com/artist-hks", label: "GitHub" },
    { icon: BriefcaseBusiness, link: "https://linkedin.com/in/artisthks", label: "LinkedIn" },
    { icon: Globe, link: "https://codolio.com/profile/artist_hks", label: "Codolio" },
    { icon: Mail, link: "mailto:artist.hks.dev@gmail.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-zinc-800 bg-[#0a0a0a] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">
            HKS Studio
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-zinc-600">
            Crafted by{" "}
            <span className="font-mono font-semibold text-yellow-400">Hemant Sharma (HKS)</span>{" "}
            with Next.js, Tailwind, and Framer Motion.
          </p>
          <div className="flex items-center gap-0.5">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.link}
                target={social.link.startsWith("mailto:") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#facc15" }}
                transition={{ duration: 0.15 }}
                className="p-3 text-zinc-600 transition-colors hover:text-yellow-400"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </div>

        <p className="mt-6 border-t border-zinc-900 pt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-700">
          © 2026 HKS Studio — Building intelligent experiences from Jaipur.
        </p>
      </div>
    </footer>
  );
}