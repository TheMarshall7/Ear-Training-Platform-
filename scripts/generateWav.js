import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple WAV header generator
function writeWav(samples, sampleRate = 44100) {
    const buffer = Buffer.alloc(44 + samples.length * 2);

    // RIFF chunk
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + samples.length * 2, 4);
    buffer.write('WAVE', 8);

    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34); // 16-bit

    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(samples.length * 2, 40);

    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2);
    }

    return buffer;
}

// Generate Middle C (approx 261.63 Hz)
const sampleRate = 44100;
const duration = 2.0; // 2 seconds
const frequency = 261.63;
const samples = new Float32Array(sampleRate * duration);

for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    // Decay envelope
    const envelope = Math.exp(-3 * t);
    samples[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
}

const wavBuffer = writeWav(samples);

const outputDir = path.resolve(__dirname, '../public/samples/piano');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'C4.wav'), wavBuffer);
console.log('Generated C4.wav');
