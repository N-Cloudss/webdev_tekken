"use client"

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Materials() {
    const materials = [
        {
            name: "PLA",
            description: "Easy to print and ideal for prototypes.",
        },
        {
            name: "PETG",
            description: "Strong, durable, and moisture resistant.",
        },
        {
            name: "ABS",
            description: "Tough and heat-resistant for functional parts.",
        },
        {
            name: "TPU",
            description: "Flexible and impact-resistant material.",
        },
        {
            name: "Nylon",
            description: "Lightweight, durable, and wear-resistant.",
        },
        {
            name: "ASA",
            description: "UV and weather resistant for outdoor use."
        },
    ];

    const [selectedMaterial, setSelectedMaterial] = useState<{
        name: string;
        description: string;
    } | null>(null);

    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        show: {
            opacity: 1,
            y: 0,
        },
    };

    return (
        <section
            id="materials"
            className="bg-[#F6F4EB] py-10 scroll-mt-20"
        >
            <div className="mx-auto max-w-7xl px-8">
                <h2 className="text-center text-4xl font-semibold text-[#4682A9]">
                    Materials
                </h2>
                <p className="text-center mt-1 text-base text-gray-600">
                    All materials we have.
                </p>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false }}
                    className="mt-12 flex flex-wrap justify-center gap-4"
                >
                    {materials.map((material) => (
                        <motion.span
                            key={material.name}
                            variants={item}
                            onMouseEnter={() => setSelectedMaterial(material)}
                            onMouseLeave={() => setSelectedMaterial(null)}
                            whileHover={{
                                scale:1.08,
                                y: -3,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 250,
                                damping: 15,
                            }}
                            className={`
                                inline-flex
                                cursor-pointer
                                items-center
                                rounded-full
                                bg-[#4682A9]/10
                                px-5
                                py-2
                                text-sm
                                font-medium
                                text-[#4682A9]
                                ring-1
                                ring-inset
                                ring-[#4682A9]/20
                                transition-all
                                duration-200
                                hover:bg-[#4682A9]
                                hover:text-white
                                hover:ring-[#4682A9]
                            `}
                        >
                            {material.name}
                        </motion.span>
                    ))}
                </motion.div>
                
                <div className="mt-10 flex min-h-[100px] items-center justify-center">
                    <AnimatePresence mode="wait">
                        {selectedMaterial ? (
                            <motion.div
                                key={selectedMaterial.name}
                                initial={{ opacity:0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="text-center"
                            >
                                <h3 className="text-xl font-semibold text-[#4682A9]">
                                    {selectedMaterial.name}
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    {selectedMaterial.description}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-10 text-center text-gray-400"
                            >
                                Hover over a material to learn more.
                            </motion.p>
                        )}
                        
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}