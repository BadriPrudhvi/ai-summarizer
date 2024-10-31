'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Moon, Sun, Loader2, FileText, FilesIcon, FileStack } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Summarizer() {
  const [text, setText] = useState("")
  const [summaryLength, setSummaryLength] = useState(25)
  const [theme, setTheme] = useState("light")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "No text provided",
        description: "Please enter some text to summarize.",
        duration: 3000,
      })
      return
    }

    try {
        setIsLoading(true)
        setSummary("")
        const startTime = performance.now()
        
        const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userInput: `Please summarize the following text in approximately ${summaryLength} words:\n\n${text}`,
            }),
        });

        if (!response.ok) throw new Error('Failed to generate summary');

        const data = await response.json() as { aiResponse: string };
        setSummary(data.aiResponse);
        
        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2)
        toast({
          title: "Summary Generated",
          description: `Completed in ${timeTaken} seconds`,
          duration: 3000,
        })
    } catch (error) {
        console.error('Error generating summary:', error);
        setSummary('Failed to generate summary. Please try again.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate summary. Please try again.",
          duration: 3000,
        })
    } finally {
        setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme}`}>
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <FileText className="h-6 w-6" />
              <span>AI Summarizer</span>
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-text">Input Text</Label>
                  <Textarea
                    id="input-text"
                    className="min-h-[500px]"
                    placeholder="Enter or Paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Summary Length</Label>
                  <RadioGroup
                    defaultValue={summaryLength.toString()}
                    onValueChange={(value) => setSummaryLength(Number(value))}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {[
                      { value: "25", label: "Concise", icon: FileText },
                      { value: "50", label: "Balanced", icon: FilesIcon },
                      { value: "100", label: "Detailed", icon: FileStack }
                    ].map(({ value, label, icon: Icon }) => (
                      <div key={value} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value={value} id={label.toLowerCase()} />
                        <Label htmlFor={label.toLowerCase()} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{value} words</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Text length: {text.split(/\s+/).filter(Boolean).length} words
                  </div>
                  <Button onClick={handleSummarize} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      'Summarize'
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <Label htmlFor="summary-output">Summary</Label>
                {isLoading ? (
                  <div className="min-h-[500px] space-y-4 rounded-md border p-4">
                    {[92, 96, 88, 94, 90, 85, 89].map((width, i) => (
                      <Skeleton key={i} className={`h-[24px] w-[${width}%]`} />
                    ))}
                  </div>
                ) : (
                  <Textarea
                    id="summary-output"
                    className="min-h-[500px]"
                    placeholder="Your summary will appear here..."
                    value={summary}
                    readOnly
                  />
                )}
                <div className="text-sm text-muted-foreground">
                  Summary length: {summary.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Summarizer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}