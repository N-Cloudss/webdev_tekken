"use client"

import { motion } from "framer-motion"

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="bg-[#F6F4EB] py-10 scroll-mt-20"
        >
            <div className="mx-auto max-w-7xl px-8">
                <h2 className="text-center text-4xl font-semibold text-[#4682A9]">
                    How It Works
                </h2>
                <p className="text-center mt-1 text-base text-gray-600">
                    Upload to delivery in just 4 simple steps.
                </p>

                <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y:40 }}
                        whileInView={{ opacity:1, y:0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: false }}
                        className="flex flex-col p-5 items-center rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center text-3xl font-bold text-[#4682A9]">
                            1
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-gray-800">
                            Upload STL
                        </h3>

                        <p className="mt-2 text-center text-base text-gray-500">
                            Upload by drag and drop your 3D file (.STL).
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y:40 }}
                        whileInView={{ opacity:1, y:0 }}
                        transition={{ duration: 1, delay:0.2 }}
                        viewport={{ once: false }}
                        className="flex flex-col p-5 items-center rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center text-3xl font-bold text-[#4682A9]">
                            2
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-gray-800">
                            Configure
                        </h3>

                        <p className="mt-2 text-center text-base text-gray-500">
                            Choose your filament type, infill, layer height, and color.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y:40 }}
                        whileInView={{ opacity:1, y:0 }}
                        transition={{ duration: 1, delay:0.4 }}
                        viewport={{ once: false }}
                        className="flex flex-col p-5 items-center rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center text-3xl font-bold text-[#4682A9]">
                            3
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-gray-800">
                            Track Order
                        </h3>

                        <p className="mt-2 text-center text-base text-gray-500">
                            Monitor your order status and printing progress in real time.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y:40 }}
                        whileInView={{ opacity:1, y:0 }}
                        transition={{ duration: 1, delay:0.6 }}
                        viewport={{ once: false }}
                        className="flex flex-col p-5 items-center rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center text-3xl font-bold text-[#4682A9]">
                            4
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-gray-800">
                            Receive Print
                        </h3>

                        <p className="mt-2 text-center text-base text-gray-500">
                            Track your order status and printing progress in real time.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}