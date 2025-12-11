import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const Bar = ({ position, height, color, label }: { position: [number, number, number], height: number, color: string, label: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Gentle pulsing animation
            meshRef.current.scale.y = THREE.MathUtils.lerp(
                meshRef.current.scale.y,
                hovered ? 1.2 : 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1,
                0.1
            );
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                position={[0, height / 2, 0]}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={[0.8, height, 0.8]} />
                <meshStandardMaterial color={hovered ? '#fbbf24' : color} transparent opacity={0.9} />
            </mesh>
            <Text
                position={[0, -0.5, 0.5]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
};

const Dashboard3D: React.FC = () => {
    return (
        <div className="w-full h-[300px] bg-transparent">
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 5, 0]} intensity={0.5} color="#4f46e5" />

                <group position={[0, -1, 0]} rotation={[0, -0.2, 0]}>
                    <Bar position={[-2, 0, 0]} height={3} color="#60a5fa" label="Speed" />
                    <Bar position={[0, 0, 0]} height={4.5} color="#818cf8" label="Accuracy" />
                    <Bar position={[2, 0, 0]} height={2.5} color="#c084fc" label="Cost" />

                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                        <mesh position={[0, 4, 0]}>
                            <sphereGeometry args={[0.3, 32, 32]} />
                            <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2} />
                        </mesh>
                    </Float>
                </group>

                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
            </Canvas>
        </div>
    );
};

export default Dashboard3D;
