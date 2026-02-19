import { Jimp } from 'jimp';

export interface SoilAnalysis {
  type: string;
  color: string;
}

export interface ErosionMetrics {
  vegetation: number;
  edge_density: number;
  line_count: number;
  darkness: number;
}

export interface ErosionResult {
  prediction: string;
  confidence: number;
  soil_analysis: SoilAnalysis;
  metrics: ErosionMetrics;
  reasoning: string[];
}

export async function classifyErosion(imageSource: string | Buffer): Promise<ErosionResult | { error: string }> {
  try {
    // Read the image
    const image = await Jimp.read(imageSource as any);
    image.resize(500, 500);

    let greenPixels = 0;
    let darkPixels = 0;
    let rSum = 0, gSum = 0, bSum = 0, soilPixels = 0;
    const totalPixels = 500 * 500;

    // Scan pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (this: any, x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // A. Vegetation Coverage (Greenery)
      // Heuristic: Green is dominant
      const isGreen = g > r && g > b && g > 50;

      if (isGreen) {
        greenPixels++;
      } else {
        rSum += r;
        gSum += g;
        bSum += b;
        soilPixels++;
      }

      // D. "Dark Cavity" Detection (Gullies) - Shadows/Voids
      const brightness = (r + g + b) / 3;
      if (brightness < 60) {
        darkPixels++;
      }
    });

    const vegRatio = greenPixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;

    // Soil Type Analysis
    const avgR = rSum / (soilPixels || 1);
    const avgG = gSum / (soilPixels || 1);
    const avgB = bSum / (soilPixels || 1);

    let soilColor = "Brown";
    let soilType = "Alluvial / Loamy";

    if (avgR < 50 && avgG < 50 && avgB < 50) {
      soilColor = "Black";
      soilType = "Black Cotton Soil (Clay)";
    } else if (avgR > avgG * 1.5 && avgR > avgB * 1.5) {
      soilColor = "Red";
      soilType = "Laterite / Red Soil";
    } else if (avgR > 200 && avgG > 180 && avgB < 150) {
      soilColor = "Yellow";
      soilType = "Sandy / Desert Soil";
    }

    // Classification Logic
    let prediction = "Slight (Sheet)";
    let confidence = 0.5;
    let reasoning: string[] = [];

    if (vegRatio > 0.4) {
      prediction = "None";
      confidence = 0.8 + (vegRatio * 0.2);
      reasoning.push(`High vegetation coverage detected (${(vegRatio * 100).toFixed(1)}%) - protects soil`);
    } else if (darkRatio > 0.12) {
      prediction = "Severe (Gully)";
      confidence = 0.7 + (darkRatio * 0.3);
      reasoning.push(`Significant deep shadows/voids detected (${(darkRatio * 100).toFixed(1)}%) - indicates gullies`);
    } else if (darkRatio > 0.03) {
      prediction = "Moderate (Rill)";
      confidence = 0.6 + (darkRatio * 0.2);
      reasoning.push(`Visible drainage patterns or irregularities (${(darkRatio * 100).toFixed(1)}% dark areas)`);
    } else {
      prediction = "Slight (Sheet)";
      confidence = 0.6;
      reasoning.push("Minimal vegetation with mostly uniform soil surface texture");
    }

    // Cap confidence
    confidence = Math.min(confidence, 1.0);

    return {
      prediction,
      confidence,
      soil_analysis: { type: soilType, color: soilColor },
      metrics: {
        vegetation: vegRatio,
        edge_density: 0,
        line_count: 0,
        darkness: darkRatio
      },
      reasoning
    };

  } catch (err: any) {
    console.error("Processing Error:", err);
    return { error: err.message || "Unknown error during processing" };
  }
}
