"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function MouseParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!group.current) return;
    const x = (state.pointer.x * viewport.width) / 40;
    const y = (state.pointer.y * viewport.height) / 40;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x,
      0.04
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -y,
      0.04
    );
  });

  return <group ref={group}>{children}</group>;
}

export default function Scene({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} castShadow />
      <pointLight position={[-3, -2, -2]} intensity={0.5} color="#ffffff" />
      <pointLight position={[2, -3, 2]} intensity={0.3} color="#9c85f0" />
      <Suspense fallback={null}>
        <MouseParallaxRig>{children}</MouseParallaxRig>
      </Suspense>
    </Canvas>
  );
}
