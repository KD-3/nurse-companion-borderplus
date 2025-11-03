import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, userResponse, isAudio, conversationHistory } = await req.json();
    
    console.log("Processing conversation practice:", { scenario, isAudio });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let transcript = userResponse;

    // Step A: Speech-to-Text using Whisper if audio is provided
    if (isAudio && OPENAI_API_KEY) {
      console.log("Transcribing audio with Whisper...");
      
      // Remove data URL prefix if present
      const base64Audio = userResponse.includes(',') 
        ? userResponse.split(',')[1] 
        : userResponse;
      
      // Convert base64 to binary
      const binaryAudio = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      
      // Create form data for Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const errorText = await whisperResponse.text();
        console.error("Whisper API error:", whisperResponse.status, errorText);
        throw new Error("Failed to transcribe audio");
      }

      const whisperData = await whisperResponse.json();
      transcript = whisperData.text;
      console.log("Transcription:", transcript);
    }

    // Build conversation context
    // Get the current prompt from conversation history
    const currentPrompt = conversationHistory.length > 0 
      ? conversationHistory[conversationHistory.length - 1].content 
      : "How are you feeling today?";

    // Step B: AI Evaluation with structured prompt
    const messages = [
      {
        role: "system",
        content: `You are an AI language coach. A relocating professional is practicing a "${scenario}" scenario.

The scenario prompt given to the user was: "${currentPrompt}"
The user's spoken response was: "${transcript}"

Your task is to evaluate this response and provide feedback.

1. Analyze the user's response for relevance, politeness, and naturalness.
2. Generate a relevance score from 0 to 100. (e.g., A simple "fine" is 60, "I'm good, how are you?" is 95).
3. Write a short improvement tip (max 2 sentences) that is encouraging and actionable.
4. Provide a "sample better reply" that demonstrates a more natural or professional way to respond.
5. Continue the conversation naturally with a follow-up question or statement.

Respond using EXACTLY this structure:

[FEEDBACK]
Score: [number 0-100]
Tip: [encouraging, actionable tip]
Sample: [better example response]
[/FEEDBACK]

[NEXT]
[Your natural conversational follow-up]
[/NEXT]`
      },
      {
        role: "user",
        content: transcript
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment." 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add credits to your workspace." 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("AI response received:", aiResponse.substring(0, 200));

    // Parse AI response to extract feedback and next prompt
    const feedbackMatch = aiResponse.match(/\[FEEDBACK\](.*?)\[\/FEEDBACK\]/s);
    const nextPromptMatch = aiResponse.match(/\[NEXT\](.*?)\[\/NEXT\]/s);

    let feedback = {
      transcript: transcript,
      score: 75,
      tip: "Great response! Keep practicing to build confidence.",
      sampleReply: "That's a good point. Let me think about how to approach that."
    };

    // Extract structured feedback from AI response
    if (feedbackMatch) {
      const feedbackText = feedbackMatch[1].trim();
      const scoreMatch = feedbackText.match(/Score:\s*(\d+)/i);
      const tipMatch = feedbackText.match(/Tip:\s*(.+?)(?=Sample:|$)/is);
      const sampleMatch = feedbackText.match(/Sample:\s*(.+?)$/is);

      if (scoreMatch) feedback.score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
      if (tipMatch) feedback.tip = tipMatch[1].trim();
      if (sampleMatch) feedback.sampleReply = sampleMatch[1].trim();
    }

    const nextPrompt = nextPromptMatch 
      ? nextPromptMatch[1].trim() 
      : aiResponse;

    return new Response(
      JSON.stringify({
        feedback,
        nextPrompt: nextPrompt || "That's interesting! Could you tell me more about that?",
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in conversation-practice:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
