"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type STLViewerProps = {
    url: string;
    grid?: boolean;
    axes?: boolean;
    wireframe?: boolean;
    autoRotate?: boolean;
};

export default function STLViewer({
    url,
    grid = false,
    axes = false,
    wireframe = false,
    autoRotate = false,

}: STLViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#0F172A");

        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        camera.position.set(100, 100, 100);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            1.5
        );

        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            0xffffff,
            2
        );

        directionalLight.position.set(100, 100, 100);

        scene.add(directionalLight);

        if (grid) {
            const gridHelper = new THREE.GridHelper(200, 20);
            scene.add(gridHelper);
        };

        if (axes) {
            const axesHelper = new THREE.AxesHelper(100);
            scene.add(axesHelper);
        };

        const loader = new STLLoader();

        loader.load(
            url,
            (geometry) => {
                geometry.computeVertexNormals();

                const material = new THREE.MeshStandardMaterial({
                    color: 0x4682a9,
                    metalness: 0.1,
                    roughness: 0.7,
                    wireframe,
                });

                const mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                geometry.center();

                const box = new THREE.Box3().setFromObject(
                    mesh
                );

                const size = box.getSize(
                    new THREE.Vector3()
                );

                const maxDimension = Math.max(
                    size.x,
                    size.y,
                    size.z
                );

                const distance = maxDimension * 2;

                camera.position.set(
                    distance,
                    distance,
                    distance
                );

                camera.lookAt(0, 0, 0);

                controls.target.set(0, 0, 0);
                controls.update();

                scene.add(mesh);
            },
            undefined,
            (error) => {
                console.error(
                    "Failed to load STL:",
                    error
                );
            }
        );

        const handleResize = () => {
            if (!containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        let animationFrameId: number;


        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (autoRotate) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 2;
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);

            window.removeEventListener(
                "resize",
                handleResize
            );

            controls.dispose();

            renderer.dispose();

            scene.traverse((object) => {
                if (
                    object instanceof THREE.Mesh
                ) {
                    object.geometry.dispose();

                    if (
                        Array.isArray(object.material)
                    ) {
                        object.material.forEach(
                            (material) =>
                                material.dispose()
                        );
                    } else {
                        object.material.dispose();
                    }
                }
            });

            if (
                renderer.domElement.parentNode ===
                container
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }
        };
    }, [url, grid, axes, wireframe, autoRotate]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full"
        />
    );
}