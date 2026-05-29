// PCM Worklet v2 — captures raw audio, downsamples to 16kHz Int16 PCM,
// computes RMS for VAD + visual level meter
// Messages: { type: 'pcm', buffer: ArrayBuffer } | { type: 'level', rms: number }
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.inputRate = sampleRate; // provided by AudioContext at runtime
    this.ratio = this.inputRate / this.targetRate;
    this.levelInterval = 800; // report RMS every ~50ms at 16kHz (800 output samples)
    this.samplesSinceLevel = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const channelData = input[0]; // Float32Array mono

    // Downsample to 16kHz Int16 PCM
    const outLength = Math.round(channelData.length / this.ratio);
    const pcm16 = new Int16Array(outLength);

    let sumSq = 0;
    for (let i = 0; i < outLength; i++) {
      const start = Math.floor(i * this.ratio);
      const end = Math.min(Math.floor((i + 1) * this.ratio), channelData.length);
      let sum = 0;
      for (let j = start; j < end; j++) sum += channelData[j];
      const avg = sum / (end - start);
      const s = Math.max(-1, Math.min(1, avg));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      sumSq += avg * avg;
    }

    // Send PCM chunk
    this.port.postMessage({ type: 'pcm', buffer: pcm16.buffer }, [pcm16.buffer]);

    // Compute and send RMS level periodically
    this.samplesSinceLevel += outLength;
    if (this.samplesSinceLevel >= this.levelInterval) {
      const rms = Math.sqrt(sumSq / outLength);
      this.port.postMessage({ type: 'level', rms });
      this.samplesSinceLevel = 0;
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
