import { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Mic as MicIcon, Cancel as CancelIcon, Send as SendIcon } from '@mui/icons-material';
import { ChatContext } from '../../types/ChatContext';

export default function AudioRecorder({
  recording,
  setRecording,
  disabled,
  onSend,
}: {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  disabled: boolean;
  onSend: (message: string | object, uploadedFiles?: { [x: string]: string }) => void;
}): React.JSX.Element {
  const state = useContext(ChatContext);
  const [audioData, setAudioData] = useState(null);
  const mediaRecorder = useRef(null);
  const startRecording = (): void => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event): void => {
          setAudioData(event.data);
        };
        mediaRecorder.current.start();
        setRecording(true);
        return true;
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });
  };

  const finishRecording = (): void => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const sendAudio = useCallback(() => {
    if (audioData) {
      const reader = new FileReader();
      reader.readAsDataURL(audioData); // Use readAsDataURL for base64 conversion
      reader.onloadend = (): void => {
        const base64Audio = reader.result as string; // Format looks like: data:audio/webm;codecs=opus;base64,GkXfo59ChoEBQveBAU...
        const response = {
          type: 'audio_url',
          audio_url: {
            url: base64Audio,
          },
        };

        setAudioData(null);
        onSend(response);
      };
    }
  }, [audioData, onSend]);

  useEffect(() => {
    if (audioData) {
      if (process.env.NEXT_PUBLIC_MODE === 'development') {
        console.log('Audio: ', audioData);
      }
      sendAudio();
    }
  }, [audioData, sendAudio]);

  const cancelRecording = (): void => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      setAudioData(null);
      state.mutate((oldState) => {
        return {
          ...oldState,
          chatState: { ...oldState.chatState, isLoading: false },
        };
      });
    }
  };

  return !recording ? (
    <Tooltip title='Record Audio'>
      <IconButton color='primary' disabled={disabled} onClick={startRecording}>
        <MicIcon />
      </IconButton>
    </Tooltip>
  ) : (
    <>
      <Tooltip title='Cancel Recording'>
        <IconButton color='error' onClick={cancelRecording}>
          <CancelIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Send Audio'>
        {/* Finish recording triggers data as soon as audio data is available */}
        <IconButton color='primary' onClick={finishRecording}>
          <SendIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}