import { audioEngine } from './audioEngine';
import { getInstrument, getDefaultInstrument, instruments } from '../config/instruments';

/**
 * Load an instrument by ID
 * Supports both local files and CDN URLs
 */
export const loadInstrument = async (instrumentId: string = 'piano') => {
    // Get instrument config, fallback to default if not found
    const instrument = getInstrument(instrumentId) || getDefaultInstrument();
    
    // Use the configured sample URL (can be local or CDN)
    const sampleId = `${instrument.id}_C4`;
    
    // Check if already loaded
    if (audioEngine.hasSample(sampleId)) {
        console.log(`Instrument ${instrument.id} already loaded`);
        return;
    }

    try {
        await audioEngine.loadSample(instrument.sampleUrl, sampleId);
        console.log(`Successfully loaded instrument: ${instrument.name}`);
    } catch (error) {
        console.error(`Failed to load instrument ${instrument.id}:`, error);
        // If custom instrument fails, try to fallback to default piano
        if (instrumentId !== 'piano') {
            console.log('Falling back to default piano');
            const defaultInst = getDefaultInstrument();
            if (!audioEngine.hasSample(`${defaultInst.id}_C4`)) {
                await audioEngine.loadSample(defaultInst.sampleUrl, `${defaultInst.id}_C4`);
            }
        } else {
            throw error;
        }
    }
};

/**
 * Get the sample ID for an instrument (used by audio engine)
 */
export const getInstrumentSampleId = (instrumentId: string = 'piano'): string => {
    const instrument = getInstrument(instrumentId) || getDefaultInstrument();
    return `${instrument.id}_C4`;
};

/**
 * Get available instruments
 */
export const getAvailableInstruments = () => {
    return instruments;
};

/**
 * Load the metronome click sound
 */
export const loadClickSound = async () => {
    const clickId = 'click';
    
    // Check if already loaded
    if (audioEngine.hasSample(clickId)) {
        return;
    }

    try {
        await audioEngine.loadSample('/samples/click.wav', clickId);
        console.log('Successfully loaded click sound');
    } catch (error) {
        console.error('Failed to load click sound:', error);
        throw error;
    }
};
