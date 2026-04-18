"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Check WebGL support
  useEffect(() => {
    setIsMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
      }
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  // ===================== THREE JS EARTH & GRAVITY ANIMATION =====================
  useEffect(() => {
    if (!isMounted || !webglSupported) return;
    if (!canvasRef.current) return;

    // Scene setup with error handling
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 12);

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // Transparent background

      // Earth Texture Loading with fallbacks
      const textureLoader = new THREE.TextureLoader();

      // Use high-quality textures with fallbacks
      const earthMap = textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      );
      const earthSpecularMap = textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
      );
      const earthNormalMap = textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
      );
      const cloudMap = textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
      );

      // Earth Sphere
      const earthGeometry = new THREE.SphereGeometry(3, 128, 128);
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        specularMap: earthSpecularMap,
        specular: new THREE.Color("grey"),
        shininess: 5,
        normalMap: earthNormalMap,
        normalScale: new THREE.Vector2(0.8, 0.8),
      });

      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earth);

      // Clouds Layer
      const cloudGeometry = new THREE.SphereGeometry(3.01, 128, 128);
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.add(clouds);

      // Starfield Background
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 2000; // Reduced for better performance
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
      }
      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3),
      );
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // Orbiting Particles
      const orbitParticles: THREE.Mesh[] = [];
      const orbitCount = 150; // Reduced for performance
      const orbitRadius = 4.5;
      for (let i = 0; i < orbitCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const particleMat = new THREE.MeshStandardMaterial({
          color: 0x4f46e5,
          emissive: 0x1e1b4b,
          emissiveIntensity: 0.3,
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        scene.add(particle);
        orbitParticles.push(particle);
      }

      // Gravity Particles
      const gravityParticles: THREE.Mesh[] = [];
      const gravityCount = 80; // Reduced for performance
      for (let i = 0; i < gravityCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const particleMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.2,
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        particle.userData = {
          angle: Math.random() * Math.PI * 2,
          radius: 5 + Math.random() * 3,
          speed: 0.002 + Math.random() * 0.003,
          falling: false,
          fallSpeed: 0,
        };
        scene.add(particle);
        gravityParticles.push(particle);
      }

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404060);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      const backLight = new THREE.PointLight(0x4f46e5, 0.4);
      backLight.position.set(-3, 0, -5);
      scene.add(backLight);

      const fillLight = new THREE.PointLight(0x06b6d4, 0.3);
      fillLight.position.set(2, 1, 3);
      scene.add(fillLight);

      // Mouse interaction
      let targetRotationX = 0;
      let targetRotationY = 0;
      let currentRotationX = 0;
      let currentRotationY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        targetRotationY = (event.clientX / window.innerWidth - 0.5) * 0.5;
        targetRotationX = (event.clientY / window.innerHeight - 0.5) * 0.3;
      };

      window.addEventListener("mousemove", handleMouseMove);

      // Animation variables
      let time = 0;

      // Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!scene || !camera || !renderer) return;

        time += 0.005;

        // Smooth rotation interpolation
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;

        earth.rotation.y = currentRotationY + time * 0.2;
        earth.rotation.x = currentRotationX;
        clouds.rotation.y = currentRotationY + time * 0.21;
        clouds.rotation.x = currentRotationX;

        // Rotate stars slowly
        stars.rotation.y += 0.0002;
        stars.rotation.x += 0.0001;

        // Update orbiting particles
        orbitParticles.forEach((particle, idx) => {
          const angle = (idx / orbitCount) * Math.PI * 2 + time;
          particle.position.x = Math.cos(angle) * orbitRadius;
          particle.position.z = Math.sin(angle) * orbitRadius;
          particle.position.y = Math.sin(angle * 2) * 0.5;
        });

        // Update gravity particles
        gravityParticles.forEach((particle) => {
          const data = particle.userData;
          if (!data.falling) {
            data.angle += data.speed;
            const x = Math.cos(data.angle) * data.radius;
            const z = Math.sin(data.angle) * data.radius;
            particle.position.set(x, Math.sin(data.angle * 2) * 0.8, z);

            if (Math.random() < 0.001) {
              data.falling = true;
              data.fallSpeed = 0.02;
            }
          } else {
            const direction = particle.position.clone().normalize();
            particle.position.sub(direction.multiplyScalar(data.fallSpeed));
            data.fallSpeed += 0.003;

            if (particle.position.length() < 3.2) {
              data.falling = false;
              data.radius = 5 + Math.random() * 3;
              data.angle = Math.random() * Math.PI * 2;
              data.speed = 0.002 + Math.random() * 0.003;
              const angle = data.angle;
              particle.position.set(
                Math.cos(angle) * data.radius,
                Math.sin(angle * 2) * 0.8,
                Math.sin(angle) * data.radius,
              );
            }
          }
        });

        renderer.render(scene, camera);
      };

      animate();

      // Resize handler
      const handleResize = () => {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }
        if (scene) {
          scene.clear();
        }
      };
    } catch (error) {
      console.error("WebGL initialization error:", error);
      setWebglSupported(false);
      return () => {};
    }
  }, [isMounted, webglSupported]);

  // ===================== GSAP ANIMATIONS =====================
  useEffect(() => {
    if (!isMounted) return;

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from(".hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "power3.out",
      });

      gsap.from(".hero-scroll", {
        opacity: 0,
        y: -20,
        duration: 1,
        delay: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Fade up animations for sections
      gsap.utils.toArray(".fade-up").forEach((el: any) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
        });
      });

      // Scale animations for stat cards
      gsap.utils.toArray(".stat-card").forEach((card: any) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
        });
      });

      // Timeline items
      gsap.utils.toArray(".timeline-item").forEach((item: any, i: number) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
          x: i % 2 === 0 ? -50 : 50,
          opacity: 0,
          duration: 0.7,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted]);

  // Don't render on server
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative text-white overflow-hidden">
      {/* THREE JS CANVAS - Only render if WebGL is supported */}
      {webglSupported && (
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-full h-full -z-10"
          style={{ opacity: 0.8 }}
        />
      )}

      {/* Fallback gradient background if WebGL is not supported */}
      {!webglSupported && (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}

      {/* Gradient Overlay */}
      <div className="fixed top-0 left-0 w-full h-full -z-5 bg-gradient-to-b from-transparent via-background/20 to-background/80 pointer-events-none" />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome to Gravity
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Where Physics Comes to Life Through 3D Visualization, AI-Powered
            Learning, and Interactive Simulations
          </p>
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Start Learning
            </Link>
            <Link
              href="#mission"
              className="px-8 py-3 border border-primary/50 rounded-full font-semibold hover:bg-primary/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
          <div className="hero-scroll absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-primary rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MISSION SECTION ===================== */}
      <section id="mission" className="section py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-up space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <span>Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Revolutionizing{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Physics Education
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To transform complex physics concepts into intuitive, visual
                experiences that spark curiosity and deepen understanding. We
                believe every student deserves to see the beauty in physics.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">3D Visualizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-sm">AI-Powered Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm">Interactive Simulations</span>
                </div>
              </div>
            </div>
            <div className="fade-up bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 rounded-2xl border border-primary/20 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4">Why We Exist</h3>
              <p className="text-muted-foreground leading-relaxed">
                Traditional physics education relies heavily on memorization and
                static diagrams. Students struggle to visualize abstract
                concepts like quantum mechanics, electromagnetism, and
                relativity. We're changing that by bringing physics to life
                through real-time 3D simulations and interactive experiments.
              </p>
              <div className="mt-6 flex items-center gap-2 text-primary">
                <span>Join the revolution</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS SECTION ===================== */}
      <section className="section py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-muted-foreground">
              Making physics education accessible to everyone
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Active Students",
                value: "50,000+",
                icon: "👨‍🎓",
                description: "And growing daily",
              },
              {
                label: "Physics Courses",
                value: "250+",
                icon: "📚",
                description: "From basics to advanced",
              },
              {
                label: "Expert Teachers",
                value: "100+",
                icon: "👨‍🏫",
                description: "PhD holders & researchers",
              },
              {
                label: "Success Rate",
                value: "94%",
                icon: "🎯",
                description: "Student satisfaction",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-2xl border border-primary/10 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-primary">
                  {stat.value}
                </h3>
                <p className="font-semibold mt-2">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHAT MAKES US UNIQUE ===================== */}
      <section className="section py-24 px-6 bg-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Makes Gravity Different?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with proven pedagogical
              approaches
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌍",
                title: "3D Earth & Space Simulations",
                description:
                  "Visualize planetary motion, gravitational fields, and orbital mechanics in real-time 3D.",
                color: "primary",
              },
              {
                icon: "🤖",
                title: "AI-Powered Personal Tutor",
                description:
                  "Get instant feedback and personalized learning paths powered by advanced AI algorithms.",
                color: "secondary",
              },
              {
                icon: "🎮",
                title: "Gamified Learning",
                description:
                  "Learn through interactive challenges, quizzes, and physics puzzles that make learning fun.",
                color: "accent",
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description:
                  "Track your progress with detailed insights and performance metrics.",
                color: "primary",
              },
              {
                icon: "👥",
                title: "Peer Learning Community",
                description:
                  "Join study groups, discuss concepts, and collaborate with fellow learners.",
                color: "secondary",
              },
              {
                icon: "📱",
                title: "Multi-platform Access",
                description:
                  "Learn anytime, anywhere on web, tablet, or mobile devices.",
                color: "accent",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="fade-up bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FOUNDER SECTION ===================== */}
      <section className="section py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-up order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
                <span>Founder's Vision</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From Passion to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Revolution
                </span>
              </h2>
              <div className="relative">
                <svg
                  className="absolute -top-6 -left-6 w-12 h-12 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-xl text-muted-foreground leading-relaxed relative z-10">
                  "Education shouldn't be about memorizing formulas. It should
                  be about understanding the universe around us. At Gravity,
                  we're building a platform where students can see, touch, and
                  experience physics in ways never possible before."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                  DR
                </div>
                <div>
                  <p className="font-semibold">Dr. Rahul Sharma</p>
                  <p className="text-sm text-muted-foreground">
                    Founder & CEO, Former CERN Researcher
                  </p>
                </div>
              </div>
            </div>
            <div className="fade-up order-1 md:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl border border-primary/20">
                  <h3 className="text-2xl font-semibold mb-4">
                    Our Core Values
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        value: "Innovation First",
                        description: "Always pushing boundaries",
                      },
                      {
                        value: "Student-Centric",
                        description: "Every decision serves learners",
                      },
                      {
                        value: "Excellence",
                        description: "Quality education for all",
                      },
                      {
                        value: "Community",
                        description: "Collaborative learning environment",
                      },
                    ].map((val, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle
                          size={18}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium">{val.value}</p>
                          <p className="text-sm text-muted-foreground">
                            {val.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TIMELINE SECTION ===================== */}
      <section className="section py-24 px-6 bg-primary/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">
              The story of Gravity's evolution
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                year: "2021",
                title: "The Beginning",
                description: "Started as a research project at IIT Bombay",
                icon: "🌱",
                color: "primary",
              },
              {
                year: "2022",
                title: "First Prototype",
                description: "Launched 3D physics visualization engine",
                icon: "🔬",
                color: "secondary",
              },
              {
                year: "2023",
                title: "Beta Launch",
                description: "Onboarded first 1000 students for testing",
                icon: "🚀",
                color: "accent",
              },
              {
                year: "2024",
                title: "AI Integration",
                description: "Launched AI-powered personalized learning",
                icon: "🤖",
                color: "primary",
              },
              {
                year: "2025",
                title: "Global Expansion",
                description: "Reached 50,000+ students worldwide",
                icon: "🌍",
                color: "secondary",
              },
              {
                year: "2026",
                title: "Future Ready",
                description: "AR/VR physics labs coming soon",
                icon: "✨",
                color: "accent",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="timeline-item flex gap-6 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 text-center">
                  <div
                    className={`w-16 h-16 rounded-full bg-${item.color}/10 flex items-center justify-center text-2xl`}
                  >
                    {item.icon}
                  </div>
                  <div
                    className="mt-2 text-sm font-bold"
                    style={{ color: `var(--${item.color})` }}
                  >
                    {item.year}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS SECTION ===================== */}
      <section className="section py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Students Say
            </h2>
            <p className="text-muted-foreground">
              Join thousands of satisfied learners
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Mehta",
                role: "JEE Advanced Aspirant",
                quote:
                  "The 3D visualizations completely changed how I understand physics concepts. Gravity made the impossible possible!",
                rating: 5,
                avatar: "PM",
              },
              {
                name: "Aditya Kumar",
                role: "B.Tech Physics",
                quote:
                  "Best physics learning platform I've ever used. The AI tutor is incredibly helpful for complex problems.",
                rating: 5,
                avatar: "AK",
              },
              {
                name: "Dr. Sarah Chen",
                role: "Physics Professor",
                quote:
                  "I recommend Gravity to all my students. It bridges the gap between theory and visualization perfectly.",
                rating: 5,
                avatar: "SC",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="fade-up bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="text-warning fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="section py-32 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <div className="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ready to Experience Physics Like Never Before?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 50,000+ students already learning with Gravity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-lg"
              >
                Start Your Journey
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border border-primary/50 rounded-xl font-semibold hover:bg-primary/10 transition-all duration-300 text-lg"
              >
                Talk to an Advisor
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              ✨ Free trial available • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const CheckCircle = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Star = ({ size, className }: { size: number; className?: string }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

export default AboutPage;
