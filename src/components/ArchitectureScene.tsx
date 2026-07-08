import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Point3 = [number, number, number];

const layerPlates = [
  { width: 4.9, depth: 1.28, y: -1.12, color: "#0f766e", opacity: 0.22 },
  { width: 4.35, depth: 1.18, y: -0.74, color: "#2563eb", opacity: 0.2 },
  { width: 3.75, depth: 1.06, y: -0.36, color: "#0891b2", opacity: 0.2 },
  { width: 3.1, depth: 0.95, y: 0.02, color: "#14b8a6", opacity: 0.22 },
  { width: 2.45, depth: 0.82, y: 0.4, color: "#f59e0b", opacity: 0.18 },
];

const flowPaths: { from: Point3; via: Point3; to: Point3; color: string; phase: number }[] = [
  { from: [-2.7, -1.12, 0.54], via: [-1.1, -0.38, 0.86], to: [0.28, 0.58, 0.2], color: "#5eead4", phase: 0 },
  { from: [-2.2, -0.72, -0.58], via: [-0.55, -0.1, -0.92], to: [1.78, 0.18, -0.46], color: "#60a5fa", phase: 0.18 },
  { from: [-1.55, 0.02, 0.74], via: [0.18, 0.72, 0.92], to: [2.18, 0.78, 0.34], color: "#fbbf24", phase: 0.35 },
  { from: [-2.52, -1.12, -0.08], via: [-0.4, -0.88, 0.2], to: [2.36, -0.42, 0.56], color: "#22c55e", phase: 0.52 },
];

function makeCurve(from: Point3, via: Point3, to: Point3) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(...from),
    new THREE.Vector3(...via),
    new THREE.Vector3(...to),
  ]);
}

function FlowLine({ from, via, to, color }: { from: Point3; via: Point3; to: Point3; color: string }) {
  const line = useMemo(() => {
    const curve = makeCurve(from, via, to);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.52 });
    return new THREE.Line(geometry, material);
  }, [from, via, to, color]);

  return <primitive object={line} />;
}

function DataPulse({ from, via, to, color, phase }: { from: Point3; via: Point3; to: Point3; color: string; phase: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => makeCurve(from, via, to), [from, via, to]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const point = curve.getPoint((clock.elapsedTime * 0.1 + phase) % 1);
    mesh.current.position.copy(point);
    const material = mesh.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.44 + Math.sin(clock.elapsedTime * 3.1 + phase * 8) * 0.24;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

function LayerPlate({
  width,
  depth,
  y,
  color,
  opacity,
}: {
  width: number;
  depth: number;
  y: number;
  color: string;
  opacity: number;
}) {
  return (
    <group position={[-0.15, y, 0]}>
      <mesh>
        <boxGeometry args={[width, 0.035, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          metalness={0.08}
          opacity={opacity}
          roughness={0.32}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[width * 0.96, 0.012, depth * 0.82]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function DecisionPanel() {
  const panel = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!panel.current) return;
    panel.current.position.y = 0.34 + Math.sin(clock.elapsedTime * 0.9) * 0.035;
  });

  return (
    <group ref={panel} position={[1.92, 0.34, 0.2]} rotation={[0.02, -0.22, 0.02]}>
      <mesh>
        <boxGeometry args={[1.42, 0.84, 0.035]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#0f766e"
          emissiveIntensity={0.08}
          opacity={0.72}
          roughness={0.3}
          transparent
        />
      </mesh>
      {[0.23, 0.05, -0.13, -0.31].map((y, index) => (
        <mesh key={y} position={[-0.2, y, 0.04]}>
          <boxGeometry args={[0.76 + index * 0.08, 0.045, 0.02]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#5eead4" : "#60a5fa"}
            transparent
            opacity={0.72}
          />
        </mesh>
      ))}
      {[0.23, 0.05, -0.13, -0.31].map((y) => (
        <mesh key={`dot-${y}`} position={[-0.58, y, 0.045]}>
          <boxGeometry args={[0.08, 0.045, 0.02]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function AICore() {
  const core = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!core.current) return;
    core.current.rotation.y = clock.elapsedTime * 0.28;
    core.current.rotation.x = Math.sin(clock.elapsedTime * 0.42) * 0.16;
  });

  return (
    <group ref={core} position={[0.12, 0.66, 0.04]}>
      <mesh>
        <octahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0ea5e9"
          emissiveIntensity={0.58}
          metalness={0.16}
          opacity={0.9}
          roughness={0.26}
          transparent
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.012, 12, 96]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[0.82, 0, 0.35]}>
        <torusGeometry args={[0.78, 0.008, 12, 96]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function DataColumns() {
  return (
    <group position={[-2.38, -0.84, 0.08]}>
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh key={index} position={[index * 0.22, index * 0.07, (index % 2) * 0.18 - 0.1]}>
          <boxGeometry args={[0.08, 0.34 + index * 0.11, 0.08]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#5eead4" : "#60a5fa"}
            emissive={index % 2 === 0 ? "#0f766e" : "#2563eb"}
            emissiveIntensity={0.28}
            opacity={0.66}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function ArchitectureObject() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = -0.18 + Math.sin(clock.elapsedTime * 0.22) * 0.08;
    group.current.rotation.x = -0.08 + Math.sin(clock.elapsedTime * 0.18) * 0.035;
  });

  return (
    <group ref={group} position={[0.35, -0.02, 0]}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[2.7, 3.4, 4]} intensity={1.65} />
      <pointLight position={[-3.8, -1.2, 2.4]} intensity={0.72} color="#5eead4" />
      <pointLight position={[2.8, 1.6, 2]} intensity={0.58} color="#fbbf24" />

      <mesh position={[0, -1.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 2.1, 1, 1]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.16} />
      </mesh>

      {layerPlates.map((layer) => (
        <LayerPlate key={`${layer.color}-${layer.y}`} {...layer} />
      ))}

      {flowPaths.map((path) => (
        <FlowLine key={`${path.color}-${path.phase}`} {...path} />
      ))}
      {flowPaths.map((path) => (
        <DataPulse key={`pulse-${path.color}-${path.phase}`} {...path} />
      ))}

      <DataColumns />
      <AICore />
      <DecisionPanel />
    </group>
  );
}

export function ArchitectureScene() {
  return (
    <Canvas
      camera={{ position: [0.2, 0.02, 6.1], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <ArchitectureObject />
    </Canvas>
  );
}
