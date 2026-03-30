import { useRef, useState } from "react";



export function useAudioRecorder() {
    const [ isRecording, setIsRecording ] = useState(false);
    const [ audioBlob, setAudioBlob ] = useState(null);
    const [ duration, setDuration ] = useState(0);
    const [ error, setError ] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);


    async function startRecording() {
     try {
    // 1. Ask browser for mic access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Create the recorder attached to the stream
    const recorder = new MediaRecorder(stream);

    // 3. Reset chunks to empty array
    chunksRef.current = [];

    // 4. Every time a chunk arrives, push it to chunksRef
    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data); 
    };

     // 5. When recording stops, combine chunks into one blob
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach(track => track.stop());
    };

    // 6. Save recorder to ref and start it
    mediaRecorderRef.current = recorder;
    recorder.start(250);
    setIsRecording(true);

    //7. Start counting seconds
    timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
    }, 1000);



  } catch (err) {
    setError("Microphone access denied. Please allow mic access.");
  }
}

    async function stopRecording() {
        if(mediaRecorderRef.current){
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            setDuration(0);
        }
    }

    function resetRecording(){
        setAudioBlob(null);
        setDuration(0);
        setError(null);
    }

       return{
        isRecording,
        audioBlob, 
        duration,
        error,
        startRecording,
        stopRecording,
        resetRecording,
    }


    
}


 
