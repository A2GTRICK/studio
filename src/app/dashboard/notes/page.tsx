import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const notes = [
  {
    title: "Quantum Mechanics Fundamentals",
    subject: "Physics",
    snippet: "An introduction to the core principles of quantum mechanics, including wave-particle duality, superposition, and quantum entanglement...",
    isPremium: true,
  },
  {
    title: "The Causes of World War I",
    subject: "History",
    snippet: "Exploring the complex web of alliances, imperialism, militarism, and nationalism that led to the outbreak of the Great War...",
    isPremium: false,
  },
  {
    title: "Introduction to JavaScript Promises",
    subject: "Computer Science",
    snippet: "A deep dive into asynchronous JavaScript, focusing on the Promise object for handling deferred and asynchronous computations...",
    isPremium: false,
  },
    {
    title: "Cellular Respiration Explained",
    subject: "Biology",
    snippet: "A breakdown of the metabolic pathways involved in cellular respiration, including glycolysis, the Krebs cycle, and oxidative phosphorylation...",
    isPremium: false,
  },
  {
    title: "Shakespeare's 'Hamlet'",
    subject: "Literature",
    snippet: "An analysis of the major themes in 'Hamlet,' including revenge, madness, and mortality, through its key characters and soliloquies...",
    isPremium: true,
  },
    {
    title: "Fundamentals of Microeconomics",
    subject: "Economics",
    snippet: "Covering supply and demand, market structures, and the principles of consumer choice and firm behavior...",
    isPremium: false,
  },
];

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Notes</h1>
        <p className="text-muted-foreground">
          All your generated notes in one place.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.title} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-headline text-xl pr-2">{note.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{note.subject}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{note.snippet}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button variant="outline" size="sm">Read More</Button>
              {note.isPremium && (
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                  <Star className="mr-1 h-3 w-3 text-accent" />
                  Premium
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
