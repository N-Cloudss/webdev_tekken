import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

const PRINTER_PROFILE = "Creality Ender-3 (0.4 mm nozzle)";
const PRINT_PROFILE = "0.20 mm NORMAL (0.4 mm nozzle) @CREALITY";
const NOZZLE_DIAMETER = 0.4;

const ALLOWED_LAYER_HEIGHTS = [
    0.12,
    0.16,
    0.20,
    0.24,
    0.28,
];

const ALLOWED_WALL_THICKNESSES = [
    0.4,
    0.8,
    1.2,
    1.6,
    2.0,
];

const FILAMENT_PROFILES: Record<string, string> = {
    PLA: "Generic PLA @CREALITY",
    PETG: "Generic PETG @CREALITY",
    ABS: "Generic ABS @CREALITY",
};

const FILAMENT_PRICES: Record<string, number> = {
    PLA: 300,
    PETG: 400,
    ABS: 450,
};

const PRINTING_FEE = 5000;

export async function POST(request: Request) {
    let tempDir: string | undefined;

    try {
        const formData = await request.formData();

        const file = formData.get("file");
        const infill = Number(formData.get("infill"));
        const layerHeight = Number(formData.get("layerHeight"));
        const wallThickness = Number(formData.get("wallThickness"));
        const filament = formData.get("filament");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No STL file provided",
                },
                { status: 400 }
            );
        }

        if (!file.name.toLowerCase().endsWith(".stl")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only STL files are allowed",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(infill) ||
            infill < 10 ||
            infill > 95 ||
            infill % 5 !== 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Infill must be between 10% and 95% in increments of 5%",
                },
                { status: 400 }
            );
        }

        if (!ALLOWED_LAYER_HEIGHTS.includes(layerHeight)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid layer height",
                },
                { status: 400 }
            );
        }

        if (!ALLOWED_WALL_THICKNESSES.includes(wallThickness)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid wall thickness",
                },
                { status: 400 }
            );
        }

        if (typeof filament !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Filament is required",
                },
                { status: 400 }
            );
        }

        const materialProfile = FILAMENT_PROFILES[filament];

        if (!materialProfile) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Unsupported filament: ${filament}`,
                },
                { status: 400 }
            );
        }

        const perimeters = Math.max(
            1,
            Math.round(wallThickness / NOZZLE_DIAMETER)
        );

        tempDir = await fs.mkdtemp(
            path.join(os.tmpdir(), "3d-posm-")
        );

        const inputPath = path.join(tempDir, file.name);
        const outputPath = path.join(tempDir, "output.gcode");

        await fs.writeFile(
            inputPath,
            Buffer.from(await file.arrayBuffer())
        );

        await execFileAsync(
            process.env.PRUSA_SLICER_PATH!,
            [
                "--printer-profile",
                PRINTER_PROFILE,

                "--print-profile",
                PRINT_PROFILE,

                "--material-profile",
                materialProfile,

                "--fill-density",
                `${infill}%`,

                "--layer-height",
                `${layerHeight}`,

                "--perimeters",
                `${perimeters}`,

                "--export-gcode",

                "--output",
                outputPath,

                inputPath,
            ]
        );

        const gcode = await fs.readFile(
            outputPath,
            "utf-8"
        );

        const filamentGramsMatch = gcode.match(
            /filament used \[g\]\s*=\s*(.+)/i
        );

        const filamentUsedGrams = filamentGramsMatch
            ? parseFloat(filamentGramsMatch[1])
            : null;

        if (filamentUsedGrams === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Could not determine filament usage",
                },
                { status: 500 }
            );
        }

        const filamentPricePerGram = FILAMENT_PRICES[filament];

        const filamentCost = 
            Math.ceil(filamentUsedGrams * filamentPricePerGram);

        const totalPrice =
            filamentCost + PRINTING_FEE;

        return NextResponse.json({
            success: true,

            fileName: file.name,

            configuration: {
                filament,
                infill,
                layerHeight,
                wallThickness,
                nozzleDiameter: NOZZLE_DIAMETER,
                perimeters,
            },

            filamentUsedGrams,

            pricing: {
                filamentPricePerGram,
                filamentCost,
                printingFee: PRINTING_FEE,
                totalPrice,
            }
        });

    } catch (error: unknown) {
        console.error(error);

        const err = error as {
            message?: string;
            code?: string | number;
        };

        return NextResponse.json(
            {
                success: false,
                error: err.message ?? "Failed to slice STL",
                code: err.code,
            },
            { status: 500 }
        );
    } finally {
        if (tempDir) {
            await fs.rm(tempDir, {
                recursive: true,
                force: true,
            });
        }
    }
}