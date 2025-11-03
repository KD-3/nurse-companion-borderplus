import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Type, Send, ArrowLeft, Loader2, FileText, Lightbulb, MessageSquare, Shield, Info, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import confetti from "canvas-confetti";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface Feedback {
  transcript: string;
  score: number;
  tip: string;
  sampleReply: string;
}

const Practice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scenario = location.state?.scenario;
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: scenario?.initialPrompt || "How are you feeling today?" 
    }
  ]);
  const [inputMode, setInputMode] = useState<"type" | "speak">("type");
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechRecognitionSupported(!!SpeechRecognition);
  }, []);

  if (!scenario) {
    navigate("/scenarios");
    return null;
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start real-time transcription
      startRealtimeTranscription();
    } catch (error) {
      toast.error("Could not access microphone. Please check permissions.");
      console.error(error);
    }
  };

  const startRealtimeTranscription = () => {
    if (!speechRecognitionSupported) {
      console.log("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setLiveTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        console.log("No speech detected");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied. Please allow microphone access.");
      } else {
        console.log("Speech recognition error:", event.error);
      }
    };

    recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Stop real-time transcription
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setLiveTranscript("");
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert audio to base64 for sending to backend
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        await handleSubmit(base64Audio, true);
      };
    } catch (error) {
      toast.error("Error processing audio");
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (input?: string, isAudio: boolean = false) => {
    const messageContent = isAudio ? input : userInput;
    if (!messageContent?.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: isAudio ? "[Audio response]" : messageContent
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('conversation-practice', {
        body: {
          scenario: scenario.title,
          userResponse: messageContent,
          isAudio,
          conversationHistory: messages
        }
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (data.error.includes("Payment required")) {
          toast.error("AI service requires credits. Please add credits to your workspace.");
        } else {
          throw new Error(data.error);
        }
        return;
      }
      
      // Check if score improved for celebration
      if (previousScore !== null && data.feedback.score > previousScore && data.feedback.score >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      setPreviousScore(data.feedback.score);
      setCurrentFeedback(data.feedback);
      setMessages(prev => [...prev, { role: "assistant", content: data.nextPrompt }]);
      
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-secondary";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const handleRetry = () => {
    // Remove the last user message and AI response to allow retry
    if (messages.length >= 2) {
      setMessages(prev => prev.slice(0, -2));
    }
    setCurrentFeedback(null);
    setUserInput("");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Onboarding Overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md p-8 space-y-6 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setShowOnboarding(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <h2 className="text-2xl font-bold text-center">Welcome to Practice! 🎯</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold">Respond</h3>
                    <p className="text-sm text-muted-foreground">Type or speak your answer to the conversation prompt</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold">Get Feedback</h3>
                    <p className="text-sm text-muted-foreground">Receive a relevance score and personalized improvement tips</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold">Improve</h3>
                    <p className="text-sm text-muted-foreground">Learn from sample replies and try again to boost your score!</p>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setShowOnboarding(false)} className="w-full" size="lg">
                Start Practicing
              </Button>
            </Card>
          </div>
        )}

        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/scenarios")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Scenarios
            </Button>
            <h1 className="text-xl font-semibold text-foreground">{scenario.title}</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Shield className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">Your responses are processed securely and not stored permanently. Your privacy is protected.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Conversation History */}
          <Card className="p-6 space-y-4 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-4">Conversation</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Feedback Display */}
          {currentFeedback && (
            <Card className="p-6 space-y-6 shadow-soft animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Feedback</h2>
                <div className="flex items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <div className={`text-4xl font-bold ${getScoreColor(currentFeedback.score)}`}>
                          {currentFeedback.score}%
                        </div>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-sm">
                        <strong>Relevance Score:</strong> Measures how well your response matched the conversation context. 
                        80%+ is excellent, 60-79% is good, below 60% needs improvement.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
              
              {currentFeedback.transcript && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Transcript</span>
                  </div>
                  <p className="text-foreground">{currentFeedback.transcript}</p>
                </div>
              )}

              <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-accent">
                  <Lightbulb className="h-4 w-4" />
                  <span>Improvement Tip</span>
                </div>
                <p className="text-foreground">{currentFeedback.tip}</p>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <MessageSquare className="h-4 w-4" />
                  <span>Sample Reply</span>
                </div>
                <p className="text-foreground italic">&ldquo;{currentFeedback.sampleReply}&rdquo;</p>
              </div>
            </Card>
          )}

          {/* Input Section */}
          <Card className="p-6 space-y-4 shadow-soft">
            <div className="flex gap-2 mb-4">
              <Button
                variant={inputMode === "type" ? "default" : "outline"}
                onClick={() => setInputMode("type")}
                className="flex-1 gap-2"
              >
                <Type className="h-4 w-4" />
                Type
              </Button>
              <Button
                variant={inputMode === "speak" ? "default" : "outline"}
                onClick={() => setInputMode("speak")}
                className="flex-1 gap-2"
              >
                <Mic className="h-4 w-4" />
                Speak
              </Button>
            </div>

            {inputMode === "type" ? (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your response..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!userInput.trim() || isLoading}
                  size="icon"
                  className="h-[100px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className="h-24 w-24 rounded-full shadow-glow"
                >
                  <Mic className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                </p>
                {isRecording && speechRecognitionSupported && (
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Mic className="h-3 w-3 animate-pulse" />
                      <span>Live Transcript</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 min-h-[60px] animate-fade-in">
                      {liveTranscript ? (
                        <p className="text-sm text-foreground italic">&ldquo;{liveTranscript}&rdquo;</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Listening...</p>
                      )}
                    </div>
                  </div>
                )}
                {isRecording && !speechRecognitionSupported && (
                  <div className="w-full max-w-md">
                    <p className="text-xs text-muted-foreground">
                      Live transcription not available in this browser. Your audio will be transcribed after recording.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
    </TooltipProvider>
  );
};

export default Practice;
