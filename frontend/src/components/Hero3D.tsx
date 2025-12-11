import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';

const AnimatedSphere = () => {
    const sphereRef = useRef<any>(null);

    useFrame(({ clock }) => {
        if (sphereRef.current) {
            sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2.4}>
                <MeshDistortMaterial
                    color="#4f46e5"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
            <group rotation={[0, 0, Math.PI / 4]}>
                <Sphere args={[1, 64, 64]} scale={3.2}>
                    <meshStandardMaterial color="#8b5cf6" wireframe transparent opacity={0.1} />
                </Sphere>
            </group>
        </Float>
    );
};

const Hero3D: React.FC = () => {
    return (
        <div className="w-full h-[500px] lg:h-[600px] relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={1} color="#ec4899" />

                <AnimatedSphere />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default Hero3D;
