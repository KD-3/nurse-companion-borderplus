import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Briefcase, Users, ArrowLeft } from "lucide-react";

const scenarios = [
  {
    id: "small-talk",
    title: "Small Talk with a Colleague",
    description: "Practice casual workplace conversations and build rapport",
    icon: MessageSquare,
    initialPrompt: "Hey! How's your week going so far?",
    color: "from-primary/20 to-primary-glow/20"
  },
  {
    id: "explaining-task",
    title: "Explaining a Task",
    description: "Learn to clearly communicate work instructions and requirements",
    icon: Briefcase,
    initialPrompt: "Could you walk me through what you're working on?",
    color: "from-secondary/20 to-secondary/30"
  },
  {
    id: "responding-question",
    title: "Responding to a Question",
    description: "Practice giving clear, confident answers in professional settings",
    icon: Users,
    initialPrompt: "I have a quick question about the project timeline. Do you have a moment?",
    color: "from-accent/20 to-accent/30"
  }
];

const Scenarios = () => {
  const navigate = useNavigate();

  const handleScenarioSelect = (scenario: typeof scenarios[0]) => {
    // Only pass serializable data (exclude icon component)
    const { icon, ...serializableScenario } = scenario;
    navigate("/practice", { state: { scenario: serializableScenario } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Choose a Scenario</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            What would you like to practice?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a professional scenario to start building your conversational confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Card
                key={scenario.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-1 overflow-hidden"
                onClick={() => handleScenarioSelect(scenario)}
              >
                <div className={`bg-gradient-to-br ${scenario.color} p-8 flex items-center justify-center`}>
                  <Icon className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {scenario.description}
                  </p>
                  <Button className="w-full mt-4" variant="default">
                    Start Practice
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-card shadow-soft max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold text-foreground">Choose</h4>
                <p className="text-sm text-muted-foreground">Select a scenario you want to practice</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h4 className="font-semibold text-foreground">Respond</h4>
                <p className="text-sm text-muted-foreground">Speak or type your response naturally</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h4 className="font-semibold text-foreground">Improve</h4>
                <p className="text-sm text-muted-foreground">Get instant AI feedback and tips</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Scenarios;
