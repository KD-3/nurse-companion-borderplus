import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Target, TrendingUp, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDR2NGgtNHpNNiAzNGg0djRINnptMjQgMGg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Conversation Practice</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build Your Speaking
              <br />
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Practice real professional conversations with instant AI feedback. 
              Perfect for relocating professionals ready to speak confidently.
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate("/scenarios")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-glow hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Practicing Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Nurse Assist?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bridge the gap between understanding and speaking with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-card">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Realistic Scenarios
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice conversations that matter—small talk, explaining tasks, and professional responses
              </p>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-card">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Instant Feedback
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Get real-time relevance scores, improvement tips, and sample responses to guide your progress
              </p>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow transition-all duration-300 bg-gradient-card">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Build Confidence
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice in a safe, judgment-free environment designed to boost your speaking confidence
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Simple, Effective Practice
              </h2>
              <p className="text-lg text-muted-foreground">
                Your journey to confident speaking starts here
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Choose Your Scenario
                  </h3>
                  <p className="text-muted-foreground">
                    Select from professional contexts like small talk, task explanations, or responding to questions
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Speak or Type Naturally
                  </h3>
                  <p className="text-muted-foreground">
                    Respond to AI prompts using your voice or keyboard—practice the way that works for you
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Get Instant Feedback
                  </h3>
                  <p className="text-muted-foreground">
                    Receive immediate scoring, improvement tips, and sample replies to refine your responses
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={() => navigate("/scenarios")}
                className="shadow-soft hover:shadow-glow transition-all duration-300"
              >
                Ready to Begin?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-hero shadow-glow max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Speaking with Confidence Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join professionals who are bridging the confidence gap and speaking naturally in their workplace
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/scenarios")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-xl hover:scale-105 transition-all duration-300"
          >
            Begin Your Practice
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
