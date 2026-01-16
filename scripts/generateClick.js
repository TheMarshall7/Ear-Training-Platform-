/**
 * Generate a simple metronome click sound using Web Audio API
 * Run with: node scripts/generateClick.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple WAV file generator
function generateClickWav() {
    const sampleRate = 44100;
    const duration = 0.05; // 50ms click
    const numSamples = Math.floor(sampleRate * duration);
    
    // Generate click sound (short burst of noise with envelope)
    const samples = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Exponential decay envelope
        const envelope = Math.exp(-t * 100);
        // Mix of sine wave (for pitch) and noise (for click character)
        const sine = Math.sin(2 * Math.PI * 1000 * t);
        const noise = Math.random() * 2 - 1;
        samples[i] = (sine * 0.7 + noise * 0.3) * envelope;
    }
    
    // Convert to 16-bit PCM
    const pcmData = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Create WAV file
    const wavHeader = createWavHeader(numSamples, sampleRate);
    const wavData = new Uint8Array(wavHeader.length + pcmData.byteLength);
    wavData.set(wavHeader, 0);
    wavData.set(new Uint8Array(pcmData.buffer), wavHeader.length);
    
    return Buffer.from(wavData.buffer);
}

function createWavHeader(numSamples, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = numSamples * blockAlign;
    
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // "RIFF" chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    return new Uint8Array(header);
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Generate and save the click sound
const clickWav = generateClickWav();
const outputPath = path.join(__dirname, '..', 'public', 'samples', 'click.wav');

fs.writeFileSync(outputPath, clickWav);
console.log(`✓ Generated metronome click sound: ${outputPath}`);
console.log(`  Duration: 50ms`);
console.log(`  Sample rate: 44100 Hz`);
console.log(`  Format: 16-bit PCM mono WAV`);
