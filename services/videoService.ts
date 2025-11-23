
/**
 * Takes an array of Canvas elements (frames) and compiles them into a WebM video blob.
 * @param frames Array of HTMLCanvasElements representing the slides
 * @param durationPerSlideMs How long each slide should be shown in milliseconds
 * @returns Promise<Blob> The video blob
 */
export const generateVideoFromFrames = async (
  frames: HTMLCanvasElement[], 
  durationPerSlideMs: number = 3000
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (frames.length === 0) {
      reject(new Error("No frames to record"));
      return;
    }

    // Create a destination canvas that matches the first frame's size
    const destCanvas = document.createElement('canvas');
    destCanvas.width = frames[0].width;
    destCanvas.height = frames[0].height;
    const ctx = destCanvas.getContext('2d');

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    // Create MediaRecorder stream (30fps)
    const stream = destCanvas.captureStream(30);
    const mimeType = 'video/webm; codecs=vp9';
    
    // Check support, fallback if needed (vp8 or default)
    const options = MediaRecorder.isTypeSupported(mimeType) 
      ? { mimeType } 
      : { mimeType: 'video/webm' };

    const recorder = new MediaRecorder(stream, options);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.start();

    // Async function to draw frames sequentially
    const playFrames = async () => {
      for (let i = 0; i < frames.length; i++) {
        // Draw the current slide frame onto the recording canvas
        ctx.drawImage(frames[i], 0, 0);
        
        // Wait for the duration of the slide
        await new Promise(r => setTimeout(r, durationPerSlideMs));
      }
      recorder.stop();
    };

    playFrames().catch(reject);
  });
};
