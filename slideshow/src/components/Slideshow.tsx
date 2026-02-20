"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SlideWrapper from "./SlideWrapper";
import GridBackground from "./GridBackground";
import { colors } from "@/lib/theme";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

// --- Slides ---
import TitleSlide from "@/slides/01_TitleSlide";
import SommaireSlide from "@/slides/02_SommaireSlide";
import CircuitsRLCSlide from "@/slides/03_ContexteSlide";
import ImpedanceSlide from "@/slides/03b_ImpedanceSlide";
import ProblematiqueSlide from "@/slides/04_ProblematiqueSlide";
import DefiSlide from "@/slides/04b_DefiSlide";
import CahierDesChargesSlide from "@/slides/05_CahierDesChargesSlide";
import MethodologieSlide from "@/slides/06_MethodologieSlide";
import GanttSlide from "@/slides/07_GanttSlide";
import RisquesSlide from "@/slides/08_RisquesSlide";
import SperSlide from "@/slides/09_SperSlide";
import ExplorationsSlide from "@/slides/10_ExplorationsSlide";
import GenerateurSlide from "@/slides/12a_GenerateurSlide";
import PourquoiTemplatesSlide from "@/slides/12a2_PourquoiTemplatesSlide";
import TopologiesSlide from "@/slides/12ab_TopologiesSlide";
import RepresentationSlide from "@/slides/12b_RepresentationSlide";
import RepresentationTokensSlide from "@/slides/12b2_RepresentationTokensSlide";
import PipelineMNASlide from "@/slides/12c_PipelineMNASlide";
import EncodageCourbeSlide from "@/slides/12d_EncodageCourbeSlide";
import DiagrammeClasseSlide from "@/slides/12e_DiagrammeClasseSlide";
import ArchitectureModelSlide from "@/slides/12_ArchitectureModelSlide";
import DatasetsSlide from "@/slides/13_DatasetsSlide";
import EvolutionModeleSlide from "@/slides/13b_EvolutionModeleSlide";
import ResultatsSlide from "@/slides/14_ResultatsSlide";
import ExperimentationsSlide from "@/slides/14b_ExperimentationsSlide";
import OptimisationsSlide from "@/slides/15_GpuOptimSlide";
import BackendSlide from "@/slides/16_BackendSlide";
import FrontendSlide from "@/slides/17_FrontendSlide";
import ProblemesSlide from "@/slides/18_ProblemesSlide";
import BilanSlide from "@/slides/19_BilanSlide";
import AmeliorationsSlide from "@/slides/20_AmeliorationsSlide";
import DemoSlide from "@/slides/21_DemoSlide";
import MerciSlide from "@/slides/22_MerciSlide";
import { Transition01, Transition02, Transition03, Transition04 } from "@/slides/TransitionSlide";

const slides = [
  TitleSlide,
  SommaireSlide,
  // --- Section 01 : Contexte ---
  Transition01,
  CircuitsRLCSlide,
  ImpedanceSlide,
  ProblematiqueSlide,
  DefiSlide,
  CahierDesChargesSlide,
  // --- Section 02 : Gestion de projet ---
  Transition02,
  MethodologieSlide,
  GanttSlide,
  RisquesSlide,
  SperSlide,
  // --- Section 03 : Réalisation technique ---
  Transition03,
  GenerateurSlide,          // ① Générateur random + problèmes
  PourquoiTemplatesSlide,   // ② Pourquoi des templates
  TopologiesSlide,          // ③ Les 5 topologies
  RepresentationSlide,      // ③ Représentation 1/2 (matrice → échec)
  RepresentationTokensSlide,// ④ Représentation 2/2 (tokens séquentiels)
  PipelineMNASlide,         // ⑤ Pipeline MNA
  EncodageCourbeSlide,      // ⑥ Encodage courbe
  ExplorationsSlide,        // ⑦ Approches explorées (déplacé)
  ArchitectureModelSlide,   // ⑧ Architecture modèle
  DiagrammeClasseSlide,     // ⑨ Diagramme classes + légende
  EvolutionModeleSlide,     // ⑩ Évolution V1→V5
  DatasetsSlide,            // ⑪ Datasets (après modèles)
  ResultatsSlide,           // ⑫ Résultats
  ExperimentationsSlide,    // ⑬ Expérimentations post-V5
  OptimisationsSlide,       // ⑭ Optimisations
  BackendSlide,             // ⑮ Backend
  FrontendSlide,            // ⑯ Frontend
  DemoSlide,                // ⑰ Démo (avant bilan)
  // --- Section 04 : Bilan ---
  Transition04,
  ProblemesSlide,
  BilanSlide,
  AmeliorationsSlide,
  MerciSlide,
];

const slideLabels = [
  "Titre",
  "Sommaire",
  // 01
  "Contexte & Probl.",
  "Circuits RLC",
  "Impédance Z(f)",
  "Problème inverse",
  "Le défi",
  "Cahier des charges",
  // 02
  "Gestion de projet",
  "M\u00e9thodologie",
  "Planning",
  "Risques",
  "SPER",
  // 03
  "Réalisation",
  "Générateur random",
  "Pourquoi templates",
  "Les 5 topologies",
  "Représentation 1/2",
  "Tokens séquentiels",
  "Pipeline MNA",
  "Encodage courbe",
  "Approches explorées",
  "Architecture IA",
  "Diagramme classes",
  "Évolution V1→V5",
  "Datasets",
  "Résultats",
  "Expérimentations",
  "Optimisations",
  "Backend",
  "Frontend",
  "D\u00e9mo",
  // 04
  "Bilan & Conclusion",
  "Probl\u00e8mes",
  "Bilan",
  "Am\u00e9liorations",
  "Merci",
];

// Section boundaries for color-coding dots
const sectionColors = [
  { start: 0, end: 1, color: colors.blue },       // Intro
  { start: 2, end: 7, color: colors.blue },        // Transition01 + Contexte
  { start: 8, end: 12, color: colors.cyan },       // Transition02 + Gestion
  { start: 13, end: 31, color: colors.green },     // Transition03 + Réalisation + Démo
  { start: 32, end: 36, color: colors.purple },    // Transition04 + Bilan
];

function getDotColor(index: number, isCurrent: boolean): string {
  if (isCurrent) return colors.blue;
  for (const sec of sectionColors) {
    if (index >= sec.start && index <= sec.end) return `${sec.color}40`;
  }
  return "rgba(255,255,255,0.15)";
}

export default function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, slides.length - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  const exportPDF = useCallback(async () => {
    if (exporting || !slideRef.current) return;
    setExporting(true);
    setExportProgress(0);

    const savedSlide = current;
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1920, 1080] });

    for (let i = 0; i < slides.length; i++) {
      setCurrent(i);
      setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      // Wait for slide render + animations to settle
      await new Promise((r) => setTimeout(r, 3500));

      const canvas = await html2canvas(slideRef.current!, {
        backgroundColor: colors.bg,
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
    }

    pdf.save("Circuit_Synthesis_AI_Slides.pdf");
    setCurrent(savedSlide);
    setExporting(false);
    setExportProgress(0);
  }, [current, exporting]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "Backspace":
          e.preventDefault();
          prev();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "p":
        case "P":
          exportPDF();
          break;
        case "Home":
          setCurrent(0);
          break;
        case "End":
          setCurrent(slides.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen, exportPDF]);

  const CurrentSlide = slides[current];

  return (
    <div
      ref={slideRef}
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ background: colors.bg }}
      onClick={(e) => { if (!exporting) next(); }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!exporting) prev();
      }}
    >
      <GridBackground />

      <AnimatePresence mode="wait">
        <SlideWrapper slideKey={current}>
          <CurrentSlide />
        </SlideWrapper>
      </AnimatePresence>

      {/* Progress bar */}
      <div data-export-ignore className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 z-50">
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${colors.blue}, ${colors.cyan})` }}
          initial={false}
          animate={{ width: `${((current + 1) / slides.length) * 100}%` }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      </div>

      {/* Progress dots */}
      <div data-export-ignore className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
            className="group relative"
          >
            <motion.div
              className="w-[6px] h-[6px] rounded-full transition-colors"
              style={{ backgroundColor: getDotColor(i, i === current) }}
              animate={i === current ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] bg-black/90 text-white px-2 py-1 rounded pointer-events-none">
              {slideLabels[i]}
            </div>
          </button>
        ))}
      </div>

      {/* Slide number */}
      <div
        data-export-ignore
        className="absolute top-4 right-6 font-mono text-sm z-50"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        {current + 1} / {slides.length}
      </div>

      {/* PDF export button */}
      {!exporting && (
        <button
          data-export-ignore
          onClick={(e) => { e.stopPropagation(); exportPDF(); }}
          className="absolute top-4 left-6 z-50 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all hover:opacity-100 opacity-20"
          style={{ background: `${colors.blue}20`, color: colors.blue, border: `1px solid ${colors.blue}30` }}
        >
          PDF
        </button>
      )}

      {/* Export progress overlay */}
      {exporting && (
        <div data-export-ignore className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-mono" style={{ color: colors.cyan }}>
              Export PDF en cours...
            </div>
            <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: `${colors.blue}20` }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%`, background: colors.cyan }}
              />
            </div>
            <div className="text-xs font-mono" style={{ color: colors.gray }}>
              {exportProgress}% — slide {Math.ceil(exportProgress / 100 * slides.length)} / {slides.length}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <motion.div
        data-export-ignore
        className="absolute bottom-12 right-6 text-[10px] font-mono z-50"
        style={{ color: "rgba(255,255,255,0.15)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 5, duration: 2 }}
      >
        {"\u2190"} {"\u2192"} naviguer {"\u00b7"} F plein {"\u00e9"}cran {"\u00b7"} P export PDF
      </motion.div>
    </div>
  );
}
