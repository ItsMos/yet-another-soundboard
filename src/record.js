//http://typedarray.org/wp-content/projects/WebAudioRecorder/
import { resample } from 'wave-resampler';

export const recorder =(function (){

let leftchannel=[],recorder=null,recording=!1,recordingLength=0,volume=null,audioInput=null,sampleRate=44100,audioContext=null,context=null;

navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } }).then(success)

function startRecording(){
  recording = true;
  leftchannel.length = 0;
  recordingLength = 0;
} // end startRecording()

function stopRecording(callBack){
  recording = false;

  // we flat the left channel down
  const leftBuffer = mergeBuffers ( leftchannel, recordingLength );

  // resample audio to 16 kHz
  const resampled = resample(leftBuffer, sampleRate, 16000);

  // we create our wav file
  const buffer = new ArrayBuffer(44 + resampled.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 44 + resampled.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  // stereo (2 channels)
  view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 32000, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, resampled.length * 2, true);

  // write the PCM samples
  let lng = resampled.length;
  let index = 44;
  let volume = 1;
  for (let i = 0; i < lng; i++){
    view.setInt16(index, resampled[i] * (0x7FFF * volume), true);
    index += 2;
  }

  // our final binary blob
  let blob = new Blob ( [ view ], { type : 'audio/wav' } );

  callBack(blob);
}//end stopRecording()

function mergeBuffers(channelBuffer, recordingLength){
  let result = new Float32Array(recordingLength);
  let offset = 0;
  let lng = channelBuffer.length;
  for (let i = 0; i < lng; i++){
    let buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string){ 
  let lng = string.length;
  for (let i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function success(stream){
  // creates the audio context
  audioContext = window.AudioContext || window.webkitAudioContext;
  context = new audioContext();

  // creates a gain node
  volume = context.createGain();

  // creates an audio node from the microphone incoming stream
  audioInput = context.createMediaStreamSource(stream);

  // connect the stream to the gain node
  audioInput.connect(volume);

  /* From the spec: This value controls how frequently the audioprocess event is 
  dispatched and how many sample-frames need to be processed each call. 
  Lower values for buffer size will result in a lower (better) latency. 
  Higher values will be necessary to avoid audio breakup and glitches */
  let bufferSize = 2048;
  recorder = context.createScriptProcessor(bufferSize, 1, 1);

  recorder.onaudioprocess = function(stream){
    if (!recording) return;
    let left = stream.inputBuffer.getChannelData(0);
    // we clone the samples
    leftchannel.push (new Float32Array (left));
    recordingLength += bufferSize;
  }

  // we connect the recorder
  volume.connect (recorder);
  recorder.connect (context.destination); 
}

return {
  start: startRecording,
  stop: stopRecording	
};

}());
