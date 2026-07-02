"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/** Floating faceted crystal-like shard, representing "bite-sized" insight */
export function FloatingShard() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.z += delta * 0.15;
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} castShadow receiveShadow>
        <octahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          color="#8B72E8"
          roughness={0.15}
          metalness={0.35}
          emissive="#6C4CE3"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

/** Open book, representing the studybooks catalog */
export function FloatingBook() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2;
  });
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.1}>
      <group ref={group} rotation={[0.15, 0.4, 0]}>
        <RoundedBox
          args={[1.1, 1.5, 0.12]}
          radius={0.06}
          position={[-0.56, 0, 0]}
          rotation={[0, 0.35, 0]}
          castShadow
        >
          <meshStandardMaterial color="#DCEFE2" roughness={0.6} />
        </RoundedBox>
        <RoundedBox
          args={[1.1, 1.5, 0.12]}
          radius={0.06}
          position={[0.56, 0, 0]}
          rotation={[0, -0.35, 0]}
          castShadow
        >
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </RoundedBox>
        <RoundedBox
          args={[0.14, 1.55, 0.24]}
          radius={0.04}
          position={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#2F8F4E" roughness={0.4} />
        </RoundedBox>
      </group>
    </Float>
  );
}

/** Glowing torus ring, representing an unbroken daily streak (amber token) */
export function FloatingRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <group ref={group} rotation={[0.5, 0, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.85, 0.22, 24, 64]} />
          <meshStandardMaterial
            color="#F4A93B"
            roughness={0.25}
            metalness={0.3}
            emissive="#D98A1F"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

/** Faceted dodecahedron gem, representing rewards / achievements (brand-green token) */
export function FloatingPrism() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.15;
      mesh.current.rotation.y += delta * 0.2;
    }
  });
  return (
    <Float speed={1.9} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#5FC486"
          roughness={0.2}
          metalness={0.3}
          emissive="#43A863"
          emissiveIntensity={0.18}
        />
      </mesh>
    </Float>
  );
}

/** Stacked cards, representing shared decks / learning together (violet token ramp) */
export function FloatingStack() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2;
  });
  const shades = ["#9C85F0", "#7C60EA", "#6C4CE3"];
  return (
    <Float speed={2.1} rotationIntensity={0.5} floatIntensity={1.2}>
      <group ref={group} rotation={[0.1, 0.3, 0]}>
        {shades.map((color, i) => (
          <RoundedBox
            key={color}
            args={[1.4, 0.3, 1]}
            radius={0.08}
            position={[0, (i - 1) * 0.42, 0]}
            rotation={[0, i * 0.14, 0]}
            castShadow
          >
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
          </RoundedBox>
        ))}
      </group>
    </Float>
  );
}

/** Rounded device / phone-tablet duo, representing "any device" */
export function FloatingDevices() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });
  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.3}>
      <group ref={group}>
        <RoundedBox
          args={[0.85, 1.5, 0.1]}
          radius={0.12}
          position={[0.35, -0.15, 0.2]}
          rotation={[0, -0.3, 0.05]}
          castShadow
        >
          <meshStandardMaterial color="#483666" roughness={0.3} metalness={0.2} />
        </RoundedBox>
        <RoundedBox
          args={[1.3, 0.85, 0.08]}
          radius={0.1}
          position={[-0.4, 0.25, -0.15]}
          rotation={[0, 0.25, -0.04]}
          castShadow
        >
          <meshStandardMaterial color="#7A6A9E" roughness={0.3} metalness={0.2} />
        </RoundedBox>
      </group>
    </Float>
  );
}
