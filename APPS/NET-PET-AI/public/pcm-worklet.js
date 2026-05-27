// PCM Worklet — captures raw audio and downsamples to 16kHz Int16 PCM
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.inputRate = sampleRate; // provided by AudioContext
    this.ratio = this.inputRate / this.targetRate;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const channelData = input[0]; // Float32Array mono
    const outLength = Math.round(channelData.length / this.ratio);
    const pcm16 = new Int16Array(outLength);

    for (let i = 0; i < outLength; i++) {
      const start = Math.floor(i * this.ratio);
      const end = Math.min(Math.floor((i + 1) * this.ratio), channelData.length);
      let sum = 0;
      for (let j = start; j < end; j++) sum += channelData[j];
      const avg = sum / (end - start);
      const s = Math.max(-1, Math.min(1, avg));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
