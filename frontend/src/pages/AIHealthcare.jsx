import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  FileText,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UploadCloud,
  Cpu,
  Database,
  X,
  Compass,
  Stethoscope,
  ChevronRight,
  Search,
} from "lucide-react";

const AIHealthcare = () => {
  const [activeModal, setActiveModal] = useState(null);

  // Live Symptom Checker state
  const [symptomsInput, setSymptomsInput] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomError, setSymptomError] = useState('');

  const handleOpenModal = (card) => {
    setSymptomsInput('');
    setSymptomResult(null);
    setSymptomError('');
    setActiveModal(card);
  };

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    setSymptomLoading(true);
    setSymptomError('');
    setSymptomResult(null);
    try {
      const res = await fetch('/api/ai/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsInput })
      });
      const data = await res.json();
      if (data.success) {
        setSymptomResult(data);
      } else {
        setSymptomError(data.message || "Failed to analyze symptoms. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSymptomError("A network error occurred. Please check your connection.");
    } finally {
      setSymptomLoading(false);
    }
  };

  const cardsData = [
    {
      id: "symptom-checker",
      title: "AI Symptom Checker",
      desc: "Analyze symptoms dynamically to get potential conditions, advice, and departments.",
      icon: Brain,
      longDesc:
        "Our AI-powered Symptom Checker guides patients in assessing physical symptoms. By mapping symptoms against clinical databases, it advises on next steps, home care, or specialized consultation.",
      howItWorks:
        "The patient selects or enters their current physical symptoms. The AI system runs cross-department diagnostics to categorize symptoms and evaluate potential health conditions.",
      inputExample: "fever, headache, vomiting",
      aiProcessing:
        "NLP-based symptom parsing, cross-referencing disease patterns, risk scoring, and triaging.",
      outputExample: {
        diseases: [
          "Viral Gastroenteritis (Common)",
          "Migraine (Moderate)",
          "Meningitis (Low probability but critical)",
        ],
        department: "General Medicine / Gastroenterology",
        homeCare:
          "Stay hydrated with ORS, rest, eat light foods (bananas, rice, applesauce), and monitor temperature.",
        emergency:
          "Seek immediate care if you experience a stiff neck, high fever over 103°F, or confusion.",
      },
      disclaimer:
        "This symptom assessment is not a formal diagnosis. It is intended for informational triaging only.",
    },
    {
      id: "report-summarizer",
      title: "Report Summarization",
      desc: "Translate complex medical lab reports into simple, layman-friendly summaries instantly.",
      icon: FileText,
      longDesc:
        "The Report Summarizer extracts clinical terminology from uploaded PDFs or images of lab reports (e.g. CBC, Lipid Profile, Thyroid tests) and explains abnormal values in plain language.",
      howItWorks:
        "OCR extracts clinical metrics, which are then analyzed against standard reference ranges to flag high/low metrics and output clear patient explanations.",
      inputExample:
        "CBC Report showing Hemoglobin 10.2 g/dL (Normal: 12-16) and WBC 12,500/mcL (Normal: 4,500-11,000)",
      aiProcessing:
        "Data extraction, reference range comparison, abnormal value classification, and vocabulary translation.",
      outputExample: {
        highlights: [
          {
            test: "Hemoglobin",
            value: "10.2 g/dL",
            status: "Low",
            explanation:
              "Hemoglobin carries oxygen. Low levels can lead to fatigue, shortness of breath, or anemia.",
          },
          {
            test: "WBC (White Blood Cells)",
            value: "12,500/mcL",
            status: "High",
            explanation:
              "White blood cells fight infection. An elevated count indicates your body is actively responding to an infection or inflammation.",
          },
        ],
        summary:
          "Your blood test suggests mild anemia (low hemoglobin) and a probable active infection/inflammation (high white blood cells).",
        doctorQuestions: [
          "What could be the source of my high white blood cell count?",
          "Do I need iron supplements or a dietary adjustment for my hemoglobin level?",
          "Should we repeat this CBC test in a couple of weeks?",
        ],
      },
      disclaimer:
        "Always verify flagged parameters with your doctor before starting any supplements or therapies.",
    },
    {
      id: "medical-chatbot",
      title: "Medical Chatbot",
      desc: "Ask health-related questions and get immediate answers with virtual assistant support.",
      icon: MessageSquare,
      longDesc:
        "The chatbot serves as an active 24/7 medical queries desk, helping patients resolve general health FAQs, understand wellness concepts, and find the appropriate department.",
      howItWorks:
        "Using medical dialogue tuning, the chatbot processes user queries and retrieves verified general health literature in real-time.",
      inputExample:
        '"What are the early signs of diabetes, and which doctor should I book?"',
      aiProcessing:
        "Intent classification, knowledge retrieval mapping, safety boundary validation, and response synthesis.",
      outputExample: {
        understanding:
          "Patient is asking for early warning indicators of Diabetes Mellitus and requesting a specialist department recommendation.",
        answer:
          "Early signs of diabetes include frequent urination, increased thirst, persistent fatigue, blurry vision, and slow-healing sores.",
        nextSteps:
          "It is recommended to consult an Endocrinologist or a General Physician for blood glucose screening (HbA1c / Fasting blood sugar).",
      },
      disclaimer:
        "The chatbot cannot prescribe medications or confirm critical diagnoses. If you have an emergency, please go to the nearest emergency room.",
    },
  ];

  const timelineSteps = [
    { label: "User", desc: "Identifies wellness concern" },
    { label: "Enter Symptoms", desc: "Inputs details into checker or chatbot" },
    {
      label: "AI Analysis",
      desc: "Evaluates metrics & matches medical databases",
    },
    {
      label: "Health Insights",
      desc: "Receives summary, suggestions, & guidelines",
    },
    {
      label: "Book Appointment",
      desc: "Selects the right department and books online",
    },
    {
      label: "Doctor Consultation",
      desc: "Shares AI report with physician for confirmation",
    },
  ];

  const benefits = [
    {
      title: "Saves Time",
      desc: "Get initial insights in seconds without waiting in queues.",
      icon: Clock,
    },
    {
      title: "Easy Understanding",
      desc: "Complex jargon is converted into simple, readable summaries.",
      icon: Compass,
    },
    {
      title: "Faster Consultation",
      desc: "Enter doctor meetings with pre-compiled summaries and prepared questions.",
      icon: Activity,
    },
    {
      title: "Better Patient Experience",
      desc: "Empower yourself with direct insights and customized department suggestions.",
      icon: Sparkles,
    },
    {
      title: "AI Assisted Healthcare",
      desc: "Access 24/7 triaging for general health queries anytime.",
      icon: Cpu,
    },
    {
      title: "Secure Data",
      desc: "Your medical entries and reports are handled with high encryption standards.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-main) font-sans pt-24 pb-16 relative overflow-x-hidden transition-colors duration-300">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200/30 dark:bg-primary-900/10 rounded-none mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-125 h-125 bg-primary-300/20 dark:bg-primary-900/10 rounded-none mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></div>

      {/* Hero Section (Replicated from Home page) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-8 lg:px-8 lg:pt-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-primary-100 shadow-xs mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-primary-700">
              AI Powered Healthcare
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 tracking-tight mb-4 leading-tight">
            Intelligent Care at Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-primary-300">
              Fingertips
            </span>
          </h1>
          <p className="text-base md:text-lg text-primary-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience intelligent healthcare assistance powered by Medicore AI.
            Get instant virtual symptom triage, automated medical report
            translation, and 24/7 virtual medical chat support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => handleOpenModal(cardsData[0])}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-primary-50 hover:bg-primary-650 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              Analyze Symptoms <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-primary-700 bg-white hover:bg-primary-50 border border-primary-200 transition-all duration-300"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* 3 AI CARDS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 mb-16 md:mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-(--text-main) mb-2">
            Our AI Suite
          </h2>
          <p className="text-sm text-(--text-muted) max-w-lg mx-auto">
            Explore the tools built to simplify clinical summaries and support
            patient inquiry.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {cardsData.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleOpenModal(card)}
                className="bg-(--bg-surface) p-6 rounded-none border border-(--border-color) shadow-xs hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white dark:hover:text-white hover:border-primary-600 dark:hover:border-primary-600 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white transition-all duration-300 shadow-3xs">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-base font-bold text-(--text-main) group-hover:text-white mb-2 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-xs text-(--text-muted) leading-relaxed mb-4 group-hover:text-primary-100 transition-colors duration-300 line-clamp-3">
                  {card.desc}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-300">
                  Learn More{" "}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-(--text-main) mb-2">
            Benefits
          </h2>
          <p className="text-sm text-(--text-muted) max-w-lg mx-auto">
            Why patients and doctors trust the Medicore virtual assistant layer.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-(--bg-surface)/60 p-5 rounded-2xl border border-(--border-color)/80 shadow-xs flex items-start gap-4 hover:bg-(--bg-surface) hover:shadow-md transition-all duration-300"
              >
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-(--text-main) text-sm mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-[11px] text-(--text-muted) leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE DETAIL MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white dark:bg-(--bg-page) w-full max-w-3xl rounded-4xl shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  {React.createElement(activeModal.icon, {
                    className: "w-6 h-6",
                  })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {activeModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    Feature Profile
                  </p>
                </div>
              </div>

              {/* Grid content */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 uppercase tracking-wide">
                    What it does
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeModal.longDesc}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 uppercase tracking-wide">
                    How it works
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeModal.howItWorks}
                  </p>
                </div>

                {/* Example Walkthrough Simulation */}
                <div className="bg-slate-50 dark:bg-primary-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                    Interactive Flow Simulation
                  </h4>

                  {activeModal.id === "symptom-checker" && (() => {
                    return (
                      <div className="space-y-6 text-sm">
                        <form onSubmit={handleSymptomCheck} className="space-y-4 text-left">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Describe your symptoms in detail:
                            </label>
                            <textarea
                              required
                              value={symptomsInput}
                              onChange={e => setSymptomsInput(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-300 outline-none text-sm text-gray-800 dark:text-white h-24"
                              placeholder="e.g. I have a throbbing headache on the left side, feeling nauseous and sensitive to light since morning."
                            />
                          </div>
                          
                          <button
                            type="submit"
                            disabled={symptomLoading}
                            className="w-full bg-primary-500 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                          >
                            {symptomLoading ? (
                              <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Analyzing symptoms with Gemini AI...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4.5 h-4.5" /> Run Diagnosis
                              </>
                            )}
                          </button>
                        </form>

                        {symptomError && (
                          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-xl text-xs font-semibold text-left">
                            {symptomError}
                          </div>
                        )}

                        {symptomResult && (
                          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-150 dark:border-slate-800 text-left space-y-4">
                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200/50 dark:border-slate-700 pb-2">
                              <Sparkles className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                              AI Diagnostic Report
                            </h5>
                            
                            <p className="text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm font-medium">
                              {symptomResult.analysis}
                            </p>

                            {(() => {
                              const regex = /\*\*(.*?)\*\*/g;
                              const match = regex.exec(symptomResult.analysis);
                              const recSpecialist = match ? match[1] : null;

                              if (recSpecialist) {
                                return (
                                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Recommended Specialist</p>
                                      <p className="text-sm font-black text-primary-750 dark:text-primary-400 mt-0.5">{recSpecialist}</p>
                                    </div>
                                    <Link
                                      to={`/doctors?speciality=${encodeURIComponent(recSpecialist)}`}
                                      className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-500 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
                                      onClick={() => setActiveModal(null)}
                                    >
                                      Book {recSpecialist} Appointment <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {activeModal.id === "report-summarizer" && (
                    <div className="space-y-4 text-sm">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center justify-center shrink-0 shadow-xs border border-slate-200 dark:border-slate-700">
                          IN
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Uploaded Lab Metrics:
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-white dark:bg-(--bg-page) p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            {activeModal.inputExample}
                          </p>
                        </div>
                      </div>

                      <div className="border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-3.5 pl-6 py-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          AI Parsing OCR & Reference Bounds...
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-500 text-xs font-bold text-white flex items-center justify-center shrink-0 shadow-xs">
                          AI
                        </div>
                        <div className="space-y-3 grow">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            AI Report Summarization:
                          </p>
                          <div className="bg-white dark:bg-(--bg-page) p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Abnormal Values Highlighted:
                              </p>
                              <div className="space-y-2">
                                {activeModal.outputExample.highlights.map(
                                  (h, i) => (
                                    <div
                                      key={i}
                                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-slate-700 dark:text-slate-300"
                                    >
                                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                                        <span>
                                          {h.test}: {h.value}
                                        </span>
                                        <span className="text-red-600 dark:text-red-400 uppercase tracking-wide font-black">
                                          {h.status}
                                        </span>
                                      </div>
                                      <p className="text-slate-650 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                                        {h.explanation}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Simple Explanation:
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                {activeModal.outputExample.summary}
                              </p>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg">
                              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                Recommended Doctor Questions:
                              </p>
                              <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                {activeModal.outputExample.doctorQuestions.map(
                                  (q, i) => (
                                    <li key={i}>{q}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModal.id === "medical-chatbot" && (
                    <div className="space-y-4 text-sm">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center justify-center shrink-0 shadow-xs border border-slate-200 dark:border-slate-700">
                          IN
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            User Asks Question:
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-white dark:bg-(--bg-page) p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 italic">
                            {activeModal.inputExample}
                          </p>
                        </div>
                      </div>

                      <div className="border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-3.5 pl-6 py-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          AI Retrieving Medical Knowledge Base...
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-600 text-xs font-bold text-white flex items-center justify-center shrink-0 shadow-xs">
                          AI
                        </div>
                        <div className="space-y-3 grow">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            AI Chatbot Answer:
                          </p>
                          <div className="bg-white dark:bg-(--bg-page) p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Intent Analysis:
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                {activeModal.outputExample.understanding}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Simple Answer:
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {activeModal.outputExample.answer}
                              </p>
                            </div>
                            <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-primary-800 dark:text-primary-300 text-xs rounded-lg">
                              <p className="font-bold flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />{" "}
                                Suggest Specialist Consultation
                              </p>
                              <p className="mt-0.5 text-slate-650 dark:text-slate-400">
                                {activeModal.outputExample.nextSteps}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-red-50/30 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 rounded-2xl text-xs text-red-750 dark:text-red-400">
                  <div className="font-bold mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Special Feature
                    Disclaimer
                  </div>
                  <p className="leading-relaxed">{activeModal.disclaimer}</p>
                </div>
              </div>

              {/* Close CTAs */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close Detail
                </button>
                <Link
                  to="/doctors"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 cursor-pointer flex items-center gap-1"
                >
                  Find a Doctor <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHealthcare;
