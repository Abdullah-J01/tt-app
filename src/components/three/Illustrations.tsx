"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * ─────────────────────────────────────────────────────────────
 * Shared bounce-on-hover helper
 * ─────────────────────────────────────────────────────────────
 */
function useBounce(baseSpeed = 1) {
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const speedRef = useRef(baseSpeed);
  // Monotonic animation clock. We accumulate `delta * speed` here instead of
  // letting each component read `clock.getElapsedTime() * speed`. Multiplying
  // the ever-growing absolute elapsed time by a changing speed makes the phase
  // of every `sin(t)` jump the instant speed changes on hover (e.g. at t=100s,
  // 1x -> 2.5x snaps the phase forward by 150s), which reads as a lurch/jitter.
  // Integrating the rate keeps the motion continuous: a speed change only
  // affects how fast time advances from now on, never retroactively.
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    // Clamp delta to protect against frame skips (tab refocus, GC pauses).
    const safeDelta = Math.min(delta, 0.1);

    // Frame-rate independent exponential smoothing. Lower factor = slower,
    // silkier glide toward the target.
    const scaleLerpFactor = 1 - Math.exp(-9 * safeDelta);
    const speedLerpFactor = 1 - Math.exp(-4 * safeDelta);

    const targetScale = hovered ? 1.15 : 1;
    const targetSpeed = hovered ? baseSpeed * 1.8 : baseSpeed;

    scaleRef.current += (targetScale - scaleRef.current) * scaleLerpFactor;
    speedRef.current += (targetSpeed - speedRef.current) * speedLerpFactor;

    // Advance the shared clock by the (smoothly changing) current speed.
    timeRef.current += safeDelta * speedRef.current;
  });

  return {
    hovered,
    scaleRef,
    speedRef,
    timeRef,
    handlers: {
      onPointerOver: (e: any) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      },
      onPointerOut: (e: any) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      },
    },
  };
}

/**
 * Shared cute face with individual asynchronous blinking logic.
 */
function Face({
  eyeSpacing = 0.16,
  eyeY = 0,
  eyeZ = 0.3,
  eyeSize = 0.055,
  mouthY = -0.14,
  mouthZ = 0.3,
  mouthRadius = 0.13,
  mouthArc = Math.PI * 0.75,
  color = "#2A2A2A",
}: {
  eyeSpacing?: number;
  eyeY?: number;
  eyeZ?: number;
  eyeSize?: number;
  mouthY?: number;
  mouthZ?: number;
  mouthRadius?: number;
  mouthArc?: number;
  color?: string;
}) {
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const blinkT = useRef(Math.random() * 3);

  useFrame((_, delta) => {
    blinkT.current += delta;
    const cycle = blinkT.current % 4.0;
    const s = cycle > 3.8 ? 0.1 : 1;
    if (leftEye.current) leftEye.current.scale.y = s;
    if (rightEye.current) rightEye.current.scale.y = s;
  });

  return (
    <group>
      <mesh ref={leftEye} position={[-eyeSpacing, eyeY, eyeZ]}>
        <sphereGeometry args={[eyeSize, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh ref={rightEye} position={[eyeSpacing, eyeY, eyeZ]}>
        <sphereGeometry args={[eyeSize, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, mouthY, mouthZ]} rotation={[0, 0, -Math.PI / 2 - mouthArc / 2]}>
        <torusGeometry args={[mouthRadius, 0.018, 8, 24, mouthArc]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * FloatingShard — Rocket Ship
 * Animation Style: High-energy aerodynamics. Banks dynamically into arcs,
 * shakes micro-reactively from propulsion, and extends its exhaust plume.
 */
export function FloatingShard() {
  const group = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const flameMat = useRef<any>(null);
  const { scaleRef, timeRef, handlers } = useBounce(1.2);

  useFrame(() => {
    const t = timeRef.current;
    if (group.current) {
      // Rocket aerodynamic swaying and banking
      group.current.rotation.z = Math.sin(t * 1.5) * 0.25;
      group.current.rotation.x = Math.cos(t * 1.2) * 0.12;
      group.current.rotation.y = Math.sin(t * 0.8) * 0.2;
      // High frequency rocket jitter
      group.current.position.y = Math.sin(t * 8) * 0.02;
      group.current.scale.setScalar(scaleRef.current);
    }
    if (flame.current) {
      const flicker = 1.0 + Math.sin(t * 22) * 0.2;
      flame.current.scale.set(flicker, flicker * 1.3, flicker);
    }
    if (flameMat.current) {
      flameMat.current.emissiveIntensity = 0.6 + Math.sin(t * 18) * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.5}>
      <group ref={group} {...handlers}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <coneGeometry args={[0.32, 0.5, 24]} />
          <meshStandardMaterial color="#8B72E8" roughness={0.25} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.9, 24]} />
          <meshStandardMaterial
            color="#9C85F0"
            roughness={0.2}
            metalness={0.3}
            emissive="#6C4CE3"
            emissiveIntensity={0.12}
          />
        </mesh>
        <mesh position={[0, 0.15, 0.3]} scale={[1, 1, 0.4]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial
            color="#CFE0FF"
            emissive="#8FAEFF"
            emissiveIntensity={0.25}
            roughness={0.15}
          />
        </mesh>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <RoundedBox
              key={i}
              args={[0.09, 0.42, 0.28]}
              radius={0.02}
              position={[Math.sin(angle) * 0.28, -0.4, Math.cos(angle) * 0.28]}
              rotation={[0, -angle, 0]}
              castShadow
            >
              <meshStandardMaterial color="#6C4CE3" roughness={0.3} metalness={0.2} />
            </RoundedBox>
          );
        })}
        <mesh ref={flame} position={[0, -0.68, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.36, 16]} />
          <meshStandardMaterial
            ref={flameMat}
            color="#FFC94A"
            emissive="#F4A93B"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * FloatingBook — Storybook Catalog
 * Animation Style: Whimsical flutter/rocking. The book sways back and forth
 * along its spine like wings flapping, while auxiliary elements orbit elliptically.
 */
export function FloatingBook() {
  const group = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const ribbon = useRef<THREE.Mesh>(null);
  const orbitA = useRef<THREE.Group>(null);
  const orbitB = useRef<THREE.Group>(null);
  const { scaleRef, timeRef, handlers } = useBounce(1);

  useFrame(() => {
    const t = timeRef.current;
    if (group.current) group.current.scale.setScalar(scaleRef.current);

    if (cover.current) {
      // Flapping/opening book illusion using rolling tilt motions
      cover.current.rotation.y = Math.sin(t * 1.2) * 0.15;
      cover.current.rotation.z = Math.cos(t * 0.8) * 0.08;
    }
    if (ribbon.current) {
      ribbon.current.rotation.x = Math.sin(t * 2.5) * 0.12;
    }
    // Complex asynchronous non-circular orbits for the companion books
    if (orbitA.current) {
      orbitA.current.position.set(Math.cos(t) * 1.15, Math.sin(t * 1.8) * 0.3, Math.sin(t) * 0.8);
      orbitA.current.rotation.y = t * 1.5;
    }
    if (orbitB.current) {
      const t2 = t + Math.PI;
      orbitB.current.position.set(
        Math.cos(t2) * 0.85,
        Math.sin(t2 * 1.4) * -0.25,
        Math.sin(t2) * 1.1,
      );
      orbitB.current.rotation.x = t2 * 0.8;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1.0}>
      <group ref={group} {...handlers}>
        <group ref={cover} rotation={[0.1, 0.3, 0]}>
          <RoundedBox args={[1.3, 1.65, 0.34]} radius={0.09} castShadow receiveShadow>
            <meshStandardMaterial color="#2F8F4E" roughness={0.45} />
          </RoundedBox>
          <RoundedBox args={[0.14, 1.5, 0.3]} radius={0.03} position={[0.66, 0, 0]} castShadow>
            <meshStandardMaterial color="#F2ECD8" roughness={0.6} />
          </RoundedBox>
          <mesh ref={ribbon} position={[-0.35, 0.78, 0.18]}>
            <planeGeometry args={[0.22, 0.6]} />
            <meshStandardMaterial color="#F4A93B" side={THREE.DoubleSide} roughness={0.4} />
          </mesh>
          <group position={[0, -0.05, 0.18]}>
            <Face
              eyeSpacing={0.19}
              eyeY={0.12}
              eyeZ={0}
              eyeSize={0.07}
              mouthY={-0.14}
              mouthZ={0}
              mouthRadius={0.15}
              color="#F4A93B"
            />
          </group>
        </group>

        <group ref={orbitA}>
          <RoundedBox args={[0.5, 0.66, 0.14]} radius={0.05} castShadow>
            <meshStandardMaterial color="#5FC486" roughness={0.5} />
          </RoundedBox>
        </group>
        <group ref={orbitB}>
          <RoundedBox args={[0.44, 0.58, 0.12]} radius={0.05} castShadow>
            <meshStandardMaterial color="#DCEFE2" roughness={0.5} />
          </RoundedBox>
        </group>
      </group>
    </Float>
  );
}

/**
 * FloatingRings — Gyroscopic Rings
 * Animation Style: Infinite planetary precession. Rotates along multiple axes
 * continuously while following a smooth infinity loop pattern path.
 */
export function FloatingRings() {
  const group = useRef<THREE.Group>(null);
  const { scaleRef, speedRef, timeRef, handlers } = useBounce(1);

  useFrame((_, delta) => {
    const t = timeRef.current;
    if (group.current) {
      // Elegant nested tumbling rotation
      group.current.rotation.y += delta * 0.4 * speedRef.current;
      group.current.rotation.x = Math.sin(t * 0.7) * 0.3;
      group.current.rotation.z = Math.cos(t * 0.5) * 0.2;
      group.current.scale.setScalar(scaleRef.current);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.4}>
      <group ref={group} rotation={[0.5, 0, 0]} {...handlers}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.85, 0.22, 32, 64]} />
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

/**
 * FloatingPrism — Rewards Trophy
 * Animation Style: Majestic, proud levitation. It slowly presents itself
 * by tilting slightly toward the viewer while the star gleams and spins quickly above.
 */
export function FloatingPrism() {
  const group = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const cupMat = useRef<any>(null);
  const { scaleRef, speedRef, timeRef, handlers } = useBounce(0.95);

  useFrame((_, delta) => {
    const t = timeRef.current;
    if (group.current) {
      // Gentle exhibition-style slow panning rotation
      group.current.rotation.y = Math.sin(t * 0.4) * 0.4;
      group.current.rotation.x = 0.1 + Math.cos(t * 0.6) * 0.06;
      group.current.scale.setScalar(scaleRef.current);
    }
    if (star.current) {
      // Star spins fast and hovers perfectly over the base cup
      star.current.rotation.y += delta * 2.8 * speedRef.current;
      star.current.position.y = 0.68 + Math.sin(t * 3.5) * 0.04;
    }
    if (cupMat.current) {
      cupMat.current.distort = 0.12 + Math.sin(t * 2.2) * 0.06;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.9}>
      <group ref={group} {...handlers}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.22, 0.65, 24]} />
          <MeshDistortMaterial
            ref={cupMat}
            color="#5FC486"
            roughness={0.2}
            metalness={0.35}
            emissive="#43A863"
            emissiveIntensity={0.15}
            speed={1.5}
          />
        </mesh>
        <mesh position={[-0.56, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.16, 0.045, 12, 24]} />
          <meshStandardMaterial color="#3E8C5C" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0.56, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.16, 0.045, 12, 24]} />
          <meshStandardMaterial color="#3E8C5C" roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.35, 16]} />
          <meshStandardMaterial color="#3E8C5C" roughness={0.35} metalness={0.2} />
        </mesh>
        <RoundedBox args={[0.85, 0.16, 0.85]} radius={0.04} position={[0, -0.56, 0]} castShadow>
          <meshStandardMaterial color="#2F7A4A" roughness={0.4} metalness={0.15} />
        </RoundedBox>
        <mesh ref={star} position={[0, 0.66, 0]} castShadow>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial
            color="#FFD65C"
            emissive="#F4A93B"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * FloatingStack — Buddy Spheres Group
 * Animation Style: Squash and stretch group dynamics. The individual spheres
 * bounce on alternate rhythms, slightly morphing their scale.
 */
export function FloatingStack() {
  const group = useRef<THREE.Group>(null);
  const buddyRefs = [
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
  ];
  const { scaleRef, timeRef, handlers } = useBounce(1.1);
  const buddies = [
    { color: "#7C60EA", pos: [0, -0.15, 0.35] as const, scale: 1, delay: 0 },
    { color: "#9C85F0", pos: [-0.5, 0.12, -0.18] as const, scale: 0.78, delay: 1.5 },
    { color: "#6C4CE3", pos: [0.5, 0.12, -0.18] as const, scale: 0.78, delay: 3.0 },
  ];

  useFrame(() => {
    const t = timeRef.current;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.3) * 0.25;
      group.current.scale.setScalar(scaleRef.current);
    }
    buddyRefs.forEach((ref, i) => {
      const buddy = buddies[i];
      if (!ref.current || !buddy) return;

      const offsetT = t * 2.2 + buddy.delay;
      // Jumpy bouncy height movement
      ref.current.position.y = buddy.pos[1] + Math.max(0, Math.sin(offsetT)) * 0.18;

      // Dynamic rubberized Squash and Stretch based on landing timeline
      const squash = 1 + Math.sin(offsetT * 2) * 0.06;
      if (Math.sin(offsetT) < 0) {
        ref.current.scale.set(buddy.scale * squash, buddy.scale / squash, buddy.scale);
      } else {
        ref.current.scale.set(buddy.scale, buddy.scale * squash, buddy.scale);
      }
    });
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1.1}>
      <group ref={group} {...handlers}>
        {buddies.map((b, i) => (
          <group key={b.color} ref={buddyRefs[i]} position={b.pos}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.42, 24, 24]} />
              <meshStandardMaterial color={b.color} roughness={0.35} metalness={0.15} />
            </mesh>
            <Face
              eyeSpacing={0.14}
              eyeY={0.06}
              eyeZ={0.36}
              eyeSize={0.06}
              mouthY={-0.1}
              mouthZ={0.36}
              mouthRadius={0.12}
              color="#2A2145"
            />
          </group>
        ))}
      </group>
    </Float>
  );
}

/**
 * FloatingDevices — Tablet & Phone
 * Animation Style: Robotic scanning & parallax sliding. The phone slides out from
 * behind the tablet sequentially, mimicking digital layers or a user shifting devices.
 */
export function FloatingDevices() {
  const group = useRef<THREE.Group>(null);
  const mobilePhone = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.Group>(null);
  const antennaTip = useRef<any>(null);
  const { scaleRef, timeRef, handlers } = useBounce(1);

  useFrame(() => {
    const t = timeRef.current;
    if (group.current) {
      // Tech gadget "tilting/scanning" observation loop
      group.current.rotation.y = Math.sin(t * 0.8) * 0.18;
      group.current.rotation.x = Math.cos(t * 0.5) * 0.1;
      group.current.scale.setScalar(scaleRef.current);
    }
    if (mobilePhone.current) {
      // Phone slides smoothly outward and inward on its own layout track
      const slideOffset = Math.sin(t * 1.4) * 0.15;
      mobilePhone.current.position.x = 0.5 + slideOffset;
      mobilePhone.current.position.z = -0.3 - slideOffset * 0.5;
    }
    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 3.5) * 0.22;
    }
    if (antennaTip.current) {
      antennaTip.current.emissiveIntensity = 0.4 + Math.cos(t * 4) * 0.3;
    }
  });

  return (
    <Float speed={2.0} rotationIntensity={0.3} floatIntensity={1.2}>
      <group ref={group} {...handlers}>
        {/* Phone node */}
        <group ref={mobilePhone}>
          <RoundedBox
            args={[0.85, 1.5, 0.1]}
            radius={0.12}
            position={[0, -0.2, 0]}
            rotation={[0, -0.3, 0.05]}
            castShadow
          >
            <meshStandardMaterial color="#483666" roughness={0.3} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, -0.2, 0.06]} rotation={[0, -0.3, 0.05]}>
            <planeGeometry args={[0.62, 1.22]} />
            <meshStandardMaterial color="#B9A9FF" emissive="#8B72E8" emissiveIntensity={0.25} />
          </mesh>
        </group>

        {/* Tablet main console */}
        <group position={[-0.05, 0.15, 0.3]} rotation={[0, 0.25, -0.04]}>
          <RoundedBox args={[1.3, 0.85, 0.08]} radius={0.1} castShadow>
            <meshStandardMaterial color="#7A6A9E" roughness={0.3} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[1.06, 0.63]} />
            <meshStandardMaterial color="#D6CCFF" emissive="#8B72E8" emissiveIntensity={0.3} />
          </mesh>
          <group position={[0, 0, 0.05]}>
            <Face
              eyeSpacing={0.16}
              eyeY={0.08}
              eyeZ={0}
              eyeSize={0.06}
              mouthY={-0.1}
              mouthZ={0}
              mouthRadius={0.13}
              color="#3B2E5C"
            />
          </group>
          <group ref={antenna} position={[0, 0.42, 0]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
              <meshStandardMaterial color="#7A6A9E" roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.19, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                ref={antennaTip}
                color="#B9A9FF"
                emissive="#8B72E8"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        </group>
      </group>
    </Float>
  );
}
