# Adding Instruments

## How It Works

The app uses a **single-sample approach**: one C4.wav file per instrument that gets pitch-shifted to play all notes. This keeps file sizes small and loading fast.

## Adding a New Instrument

### Option 1: Local File (Recommended)

1. Create a folder in `public/samples/` with your instrument name:
   ```
   public/samples/grandPiano/C4.wav
   ```

2. Add the instrument to `src/config/instruments.ts`:
   ```typescript
   {
       id: 'grandPiano',
       name: 'Grand Piano',
       sampleUrl: '/samples/grandPiano/C4.wav',
       description: 'Rich grand piano sound'
   }
   ```

3. Use it in your code:
   ```typescript
   await loadInstrument('grandPiano');
   ```

### Option 2: CDN URL (For External Samples)

You can load samples from any URL:

```typescript
{
    id: 'grandPiano',
    name: 'Grand Piano',
    sampleUrl: 'https://cdn.example.com/piano-c4.wav',
    description: 'CDN-hosted grand piano'
}
```

## Finding Free Piano Samples

### Recommended Sources:

1. **Freesound.org** - Search for "piano C4" or "piano middle C"
   - Filter by: WAV format, CC0 or CC-BY license
   - Good quality, free samples

2. **Pixabay** - Free music and sound effects
   - Search: "piano note C4"

3. **Sample Libraries:**
   - **PianoBook** (pianobook.co.uk) - Free piano samples
   - **Spitfire LABS** - Free instruments (requires download)

### Sample Requirements:

- **Format**: WAV (preferred) or MP3
- **Note**: C4 (Middle C, ~261.63 Hz)
- **Duration**: 1-3 seconds is usually enough
- **Quality**: 44.1kHz, 16-bit or 24-bit
- **License**: Make sure it's free to use commercially

## Quick Setup for Grand Piano

1. Download a free C4.wav sample from Freesound.org or similar
2. Place it at: `public/samples/grandPiano/C4.wav`
3. The instrument is already configured in `src/config/instruments.ts`!

## Testing

After adding an instrument, test it:

```typescript
import { loadInstrument, getInstrumentSampleId } from './audio/sampleLoader';
import { audioEngine } from './audio/audioEngine';

// Load the instrument
await loadInstrument('grandPiano');

// Play a note
const sampleId = getInstrumentSampleId('grandPiano');
audioEngine.playNote(sampleId, 60, 60); // Plays C4
```

## Current Instruments

- `piano` - Default piano (local file)
- `grandPiano` - Grand piano (add your sample file)

## Tips

- **File Size**: Keep samples under 500KB for fast loading
- **Quality**: 44.1kHz, 16-bit is usually sufficient
- **Pitch Shifting**: The engine can shift ±2 octaves, but quality degrades at extremes
- **Multiple Samples**: For better quality, you could add more samples (C3, C5) and switch between them, but that requires code changes
