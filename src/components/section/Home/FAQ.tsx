// components/FAQ.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ChevronDown,
  HelpCircle,
  BookOpen,
  Users,
  CreditCard,
  Clock,
  Award,
  MessageCircle,
  FileText,
  Video,
  GraduationCap,
  Sparkles,
  Search,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const faqCategories = [
  { id: "general", label: "General", icon: HelpCircle },
  { id: "courses", label: "Courses & Batches", icon: BookOpen },
  { id: "payment", label: "Payment & Pricing", icon: CreditCard },
  { id: "support", label: "Support & Community", icon: Users },
];

const faqs = {
  general: [
    {
      question: "What is Gravity and how does it work?",
      answer:
        "Gravity is a comprehensive physics learning platform that offers structured batches, expert faculty, and interactive learning materials. Students can enroll in batches, access recorded lectures, attend live sessions, practice with problems, and track their progress through our learning management system.",
    },
    {
      question: "Who are the instructors at Gravity?",
      answer:
        "Our faculty includes PhD holders from top institutions like IIT, MIT, and CERN, along experienced educators with 10+ years of teaching experience. Each instructor specializes in their respective physics domain.",
    },
    {
      question: "Is Gravity suitable for beginners?",
      answer:
        "Absolutely! We offer batches for all levels - from high school students to advanced learners. Our curriculum is structured to take you from fundamentals to advanced concepts at your own pace.",
    },
    {
      question: "Can I access the content on mobile devices?",
      answer:
        "Yes, our platform is fully responsive and works seamlessly on smartphones, tablets, and desktops. You can learn anytime, anywhere.",
    },
  ],
  courses: [
    {
      question: "What batches do you offer?",
      answer:
        "We offer batches for JEE Advanced, NEET, IIT JAM, CUET, and fundamental physics courses. Each batch includes recorded lectures, live sessions, practice problems, and weekly tests.",
    },
    {
      question: "How long is each batch?",
      answer:
        "Batch durations vary from 3 months to 1 year, depending on the course. We have foundation batches (1 year), crash courses (3-6 months), and topic-specific modules (4-8 weeks).",
    },
    {
      question: "Can I switch batches if I find the level too easy/difficult?",
      answer:
        "Yes, we offer flexible batch switching within the first 15 days. Our academic counselors will help you find the right batch based on your learning needs.",
    },
    {
      question: "Are the recorded lectures downloadable?",
      answer:
        "Yes, all recorded lectures are available for download through our mobile app. You can watch them offline at your convenience.",
    },
  ],
  payment: [
    {
      question: "What are the payment options?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and EMI options. We also offer partial payment plans for long-duration batches.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes, we offer a 7-day no-questions-asked money-back guarantee. If you're not satisfied, we'll refund your full course fee.",
    },
    {
      question: "Do you offer scholarships or discounts?",
      answer:
        "We offer merit-based scholarships up to 50% for deserving students. Early bird discounts and group enrollment discounts are also available.",
    },
    {
      question: "Are there any hidden costs?",
      answer:
        "No, the price you see is the price you pay. All study materials, tests, and support are included in the course fee.",
    },
  ],
  support: [
    {
      question: "How do I get my doubts cleared?",
      answer:
        "You can post doubts in our community forum, attend live doubt-clearing sessions, or schedule 1-on-1 sessions with faculty. Average response time is under 2 hours.",
    },
    {
      question: "Is there a community of learners?",
      answer:
        "Yes, you'll get access to our exclusive student community where you can discuss concepts, share resources, and collaborate with peers.",
    },
    {
      question: "What if I miss a live class?",
      answer:
        "All live sessions are recorded and uploaded within 24 hours. You can watch them anytime in your course dashboard.",
    },
    {
      question: "How can I track my progress?",
      answer:
        "Our analytics dashboard shows your performance in tests, time spent learning, strengths/weaknesses, and improvement areas.",
    },
  ],
};

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeCategory, setActiveCategory] = useState("general");
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Category buttons animation
      gsap.from(".category-btn", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // FAQ items animation
      gsap.from(".faq-item", {
        x: -50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory, searchQuery]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [`${activeCategory}-${index}`]: !prev[`${activeCategory}-${index}`],
    }));
  };

  // Filter FAQs based on search
  const filteredFaqs = faqs[activeCategory as keyof typeof faqs].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.05) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${10 + i * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto mb-16">
          {/* Eyebrow text */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">FAQ</span>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Frequently Asked
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400">
              Questions
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400">
            Everything you need to know about Gravity. Can't find what you're
            looking for? Feel free to contact our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-btn relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group ${
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openItems[`${activeCategory}-${index}`];

              return (
                <div key={index} className="faq-item group mb-4">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isOpen ? "!opacity-100" : ""}`}
                    />

                    <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                      {/* Question */}
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg font-medium text-white pr-8">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Answer */}
                      <div
                        className={`px-6 overflow-hidden transition-all duration-300 ${
                          isOpen ? "pb-4" : "max-h-0"
                        }`}
                      >
                        <p className="text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>

                        {/* Related links (optional) */}
                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-500">
                              Still have questions?{" "}
                              <button className="text-purple-400 hover:text-purple-300 transition-colors">
                                Contact Support
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                No FAQs found matching your search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Still have questions? */}
        <div className="text-center mt-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                  Contact Support
                </button>
                <button className="group px-8 py-3 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  Visit Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
