var RingBuffer = require('ringbufferjs');

export default class Speakers {
    onBufferUnderrun: any;
    bufferSize:number;
    buffer: any;

    audioCtx: any;
    scriptNode: any;
    dest: any;

    constructor({onBufferUnderrun}) {
        this.bufferSize = 8192;
        this.buffer = new RingBuffer(this.bufferSize * 2);
        this.onBufferUnderrun = onBufferUnderrun;
    }

    getSampleRate() {
        return 44100;
        /*if (!window.AudioContext) {
          return 44100;
        }
        let myCtx = new window.AudioContext();
        let sampleRate = myCtx.sampleRate;
        myCtx.close();
        return sampleRate;*/
    }

    start() {
        let ctx = (window as any).AudioContext;
        
        // Audio is not supported
        if (!ctx) {
            console.log('Audio Is Not Supported!');
            return;
        }
        this.audioCtx = new ctx();

        //
        var myAudio:any = document.getElementById('jsnes-audio');
        this.dest = this.audioCtx.createMediaStreamDestination();
        //
        this.scriptNode = this.audioCtx.createScriptProcessor(1024, 0, 2);
        this.scriptNode.onaudioprocess = this.onaudioprocess;
        this.scriptNode.connect(this.dest);
        myAudio.srcObject = this.dest.stream;
    }

    stop() {
        if (this.scriptNode) {
            this.scriptNode.disconnect(this.dest);
            this.scriptNode.onaudioprocess = null;
        }
        if(this.dest) {
            this.dest.disconnect();
        }
        if (this.audioCtx) {
            this.audioCtx.close();
        }
    }

    writeSample = (left, right) => {
        if (this.buffer.size() / 2 >= this.bufferSize) {
            console.log(`Buffer overrun`);
            this.buffer.deqN(this.bufferSize / 2);
        }
        this.buffer.enq(left);
        this.buffer.enq(right);
    }

    onaudioprocess = (e) => {
        var left = e.outputBuffer.getChannelData(0);
        var right = e.outputBuffer.getChannelData(1);
        var size = left.length;

        // We're going to buffer underrun. Attempt to fill the buffer.
        if (this.buffer.size() < size * 2 && this.onBufferUnderrun) {
            this.onBufferUnderrun(this.buffer.size(), size * 2);
        }

        try {
            var samples = this.buffer.deqN(size * 2);
        } catch (e) {
            // onBufferUnderrun failed to fill the buffer, so handle a real buffer
            // underrun

            // ignore empty buffers... assume audio has just stopped
            var bufferSize = this.buffer.size() / 2;
            if (bufferSize > 0) {
                console.log(`Buffer underrun (needed ${size}, got ${bufferSize})`);
            }
            for (var j = 0; j < size; j++) {
                left[j] = 0;
                right[j] = 0;
            }
            return;
        }
        for (var i = 0; i < size; i++) {
            left[i] = samples[i * 2];
            right[i] = samples[i * 2 + 1];
        }
    };
}