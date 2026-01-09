import { audioEngine } from './audioEngine';

// Map of note names to likely file paths or creating a chromatic map
// For MVP we might just use one sample (Middle C) and pitch shift it
// as permitted by the audio engine logic.

export const loadInstrument = async (instrument: string = 'piano') => {
    // We will assume a single sample "C4.wav" exists for the instrument
    // and we will pitch shift it for other notes.
    // This reduces the number of files needed for the MVP.

    const sampleUrl = `/samples/${instrument}/C4.wav`;
    await audioEngine.loadSample(sampleUrl, `${instrument}_C4`);
};
