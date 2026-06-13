import { processScientificText } from './modules/ai/scientific-tts.js';
import { preprocessTextForTTS } from './modules/ai/text-utils.js';

const text = 'Comparing Ey = 5 cos(2π × × 10⁶)t − (π × × 10⁻²)x with the standard wave equation E = E0 cos(ωt − kx), we identify ω = 2π × × 10⁶ and k = π × × 10⁻². The frequency is f = ω/(2π) = 10⁶ Hz. The wavelength is λ = 2π/k = 200 m. Since the phase is (ωt − kx), the wave propagates in the positive x direction.';
console.log(preprocessTextForTTS(text));
