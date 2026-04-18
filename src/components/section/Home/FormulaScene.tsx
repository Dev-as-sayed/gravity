// components/FormulaScene.tsx (same as before, keep unchanged)
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Text3D,
  Float,
  Sparkles,
  MeshDistortMaterial,
} from "@react-three/drei";
import * as THREE from "three";

interface FormulaSceneProps {
  formula: {
    id: string;
    label: string;
    description: string;
    icon: string;
    equation: string;
    color: string;
    gradient: string[];
    latex: string;
    position: [number, number, number];
    rotationSpeed: number;
  };
  isVisible: boolean;
}

export default function FormulaScene({
  formula,
  isVisible,
}: FormulaSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const ringGeometry = useMemo(() => {
    const geometry = new THREE.TorusGeometry(1.8, 0.08, 64, 200);
    return geometry;
  }, []);

  const orbitRingGeometry = useMemo(() => {
    const geometry = new THREE.TorusGeometry(2.4, 0.04, 64, 200);
    return geometry;
  }, []);

  const satellites = useMemo(() => {
    const symbols = ["⚛️", "∑", "∫", "∇", "∞", "Ψ", "Ω", "λ"];
    return symbols.map((symbol, i) => ({
      symbol,
      angle: (i / symbols.length) * Math.PI * 2,
      radius: 2.8,
      speed: 0.5 + Math.random() * 0.5,
      size: 0.4 + Math.random() * 0.3,
    }));
  }, []);

  useFrame((state) => {
    timeRef.current += 0.01;

    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      groupRef.current.rotation.y =
        state.clock.getElapsedTime() * formula.rotationSpeed;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.03;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const primaryColor = new THREE.Color(formula.color);
  const secondaryColor = new THREE.Color(formula.gradient[1]);

  return (
    <group ref={groupRef} position={formula.position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh geometry={orbitRingGeometry} rotation={[Math.PI / 3, 0.5, 0]}>
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh geometry={orbitRingGeometry} rotation={[-Math.PI / 4, 0.8, 0.3]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
          metalness={0.5}
          roughness={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 1.9;
        return (
          <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.5}>
            <mesh
              position={[
                Math.cos(angle + timeRef.current * 2) * radius,
                Math.sin(angle + timeRef.current * 2) * radius,
                0,
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </Float>
        );
      })}

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[0, 0, 0]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.65}
            height={0.08}
            curveSegments={8}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelSegments={5}
          >
            {formula.equation}
            <MeshDistortMaterial
              color={formula.color}
              emissive={formula.color}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.2}
              distort={0.15}
              speed={2}
            />
          </Text3D>

          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.65}
            height={0.05}
            curveSegments={8}
            position={[0, -0.03, -0.1]}
          >
            {formula.equation}
            <meshBasicMaterial color={primaryColor} transparent opacity={0.2} />
          </Text3D>
        </group>
      </Float>

      {satellites.map((sat, idx) => {
        const angle = sat.angle + timeRef.current * sat.speed;
        const x = Math.cos(angle) * sat.radius;
        const z = Math.sin(angle) * sat.radius;
        return (
          <Float key={idx} speed={1} floatIntensity={0.8}>
            <html
              position={[x, Math.sin(angle * 2) * 0.3, z]}
              center
              transform
              style={{
                fontSize: `${sat.size * 2}rem`,
                filter: "drop-shadow(0 0 10px rgba(59,130,246,0.5))",
                pointerEvents: "none",
              }}
            >
              <div className="animate-pulse">{sat.symbol}</div>
            </Html>
          </Float>
        );
      })}

      <Sparkles
        count={80}
        scale={[4, 4, 4]}
        size={0.08}
        speed={0.5}
        color={formula.color}
        opacity={0.6}
      />

      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 2.2;
        return (
          <Float
            key={`orb-${i}`}
            speed={1.5}
            rotationIntensity={0}
            floatIntensity={0.3}
          >
            <mesh
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.5,
                0,
              ]}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={secondaryColor}
                emissive={secondaryColor}
                emissiveIntensity={0.6}
              />
            </mesh>
          </Float>
        );
      })}

      <RotatingBeams color={primaryColor} />
    </group>
  );
}

function RotatingBeams({ color }: { color: THREE.Color }) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      beamRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={beamRef}>
      {[...Array(3)].map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3.2, 0, Math.sin(angle) * 3.2]}
            rotation={[0, angle, 0]}
          >
            <cylinderGeometry args={[0.03, 0.08, 1.5, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}
