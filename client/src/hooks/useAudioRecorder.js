import { useRef, useState } from "react";


const [ isRecording, setIsRecording ] = useState(false);
const [ audioBlob, setAudioBlob ] = useState(null);
const [ duration, setDuration ] = useState(0);