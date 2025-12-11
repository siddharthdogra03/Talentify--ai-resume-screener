import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';

const Globe = () => {
    const globeRef = useRef<any>(null);

    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group rotation={[0, 0, 0.35]}>
            {/* Wireframe Globe */}
            <Sphere ref={globeRef} args={[1.5, 32, 32]}>
                <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
            </Sphere>

            {/* Inner Core */}
            <Sphere args={[1.4, 32, 32]}>
                <meshBasicMaterial color="#1e3a8a" transparent opacity={0.5} />
            </Sphere>

            {/* Rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.8, 1.85, 64]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} side={2} />
            </mesh>

            <mesh rotation={[Math.PI / 2.2, 0, 0]}>
                <ringGeometry args={[2.2, 2.22, 64]} />
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} side={2} />
            </mesh>
        </group>
    );
};

const Globe3D: React.FC = () => {
    return (
        <div className="w-full h-[250px] lg:h-[300px] bg-transparent">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <Globe />
                <Stars radius={50} depth={20} count={1000} factor={2} saturation={0} fade />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
        </div>
    );
};

export default Globe3D;
