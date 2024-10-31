'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  Loader2, FileText, FilesIcon, FileStack,
  ListIcon, Text, MessageSquare, Presentation, GraduationCap
} from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Navigation } from "./navigation"
import { Footer } from "./footer"

type SummaryFormat = 'paragraph' | 'bullets'
type SummaryTone = 'casual' | 'professional' | 'academic'

interface SummaryOption {
  value: string
  label: string
  icon: any
  description?: string
}

const lengthOptions: SummaryOption[] = [
  { value: "25", label: "Concise", icon: FileText, description: "25 words" },
  { value: "50", label: "Balanced", icon: FilesIcon, description: "50 words" },
  { value: "100", label: "Detailed", icon: FileStack, description: "100 words" }
]

const formatOptions: SummaryOption[] = [
  { value: "paragraph", label: "Paragraph", icon: Text, description: "Flowing text" },
  { value: "bullets", label: "Bullets", icon: ListIcon, description: "Key points" }
]

const toneOptions: SummaryOption[] = [
  { value: "casual", label: "Casual", icon: MessageSquare, description: "Friendly" },
  { value: "professional", label: "Professional", icon: Presentation, description: "Business" },
  { value: "academic", label: "Academic", icon: GraduationCap, description: "Formal" }
]

const calculateTokens = (text: string): number => {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.round(words / 0.75);
};

export function Summarizer() {
  const [text, setText] = useState("")
  const [summaryLength, setSummaryLength] = useState(25)
  const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>('paragraph')
  const [summaryTone, setSummaryTone] = useState<SummaryTone>('professional')
  const [theme, setTheme] = useState("light")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    document.documentElement.classList.toggle("dark")
  }

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
          userInput: `Please summarize the following text in approximately ${summaryLength} words. 
          Format the summary in ${summaryFormat} style with a ${summaryTone} tone:\n\n${text}`,
          format: summaryFormat,
          tone: summaryTone
        }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')

      const data = await response.json() as { aiResponse: string }
      setSummary(data.aiResponse)
      
      const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2)
      toast({
        title: "Summary Generated",
        description: `Completed in ${timeTaken} seconds`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummary('Failed to generate summary. Please try again.')
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

  return (
    <div className={`min-h-screen flex flex-col ${theme}`}>
      <Navigation theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
            {/* Left Column - Options Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:sticky lg:top-6 space-y-6"
            >
              <Card className="p-4">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Summary Options</h2>
                    
                    {/* Length Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Length</Label>
                      <RadioGroup
                        defaultValue={summaryLength.toString()}
                        onValueChange={(value) => setSummaryLength(Number(value))}
                        className="grid grid-cols-3 gap-2"
                      >
                        {lengthOptions.map(option => (
                          <Label
                            key={option.value}
                            htmlFor={`length-${option.value}`}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-all hover:border-primary hover:bg-primary/10 ${
                              summaryLength.toString() === option.value ? 'border-primary/50 bg-primary/10' : ''
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`length-${option.value}`}
                              className="sr-only"
                            />
                            <option.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{option.label}</span>
                            <span className="text-[10px] text-muted-foreground">{option.description}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3 mt-6">
                      <Label className="text-sm font-medium">Format</Label>
                      <RadioGroup
                        defaultValue={summaryFormat}
                        onValueChange={(value) => setSummaryFormat(value as SummaryFormat)}
                        className="grid grid-cols-2 gap-2"
                      >
                        {formatOptions.map(option => (
                          <Label
                            key={option.value}
                            htmlFor={`format-${option.value}`}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-all hover:border-primary hover:bg-primary/10 ${
                              summaryFormat === option.value ? 'border-primary/50 bg-primary/10' : ''
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`format-${option.value}`}
                              className="sr-only"
                            />
                            <option.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Tone Selection */}
                    <div className="space-y-3 mt-6">
                      <Label className="text-sm font-medium">Tone</Label>
                      <RadioGroup
                        defaultValue={summaryTone}
                        onValueChange={(value) => setSummaryTone(value as SummaryTone)}
                        className="grid grid-cols-3 gap-2"
                      >
                        {toneOptions.map(option => (
                          <Label
                            key={option.value}
                            htmlFor={`tone-${option.value}`}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 cursor-pointer transition-all hover:border-primary hover:bg-primary/10 ${
                              summaryTone === option.value ? 'border-primary/50 bg-primary/10' : ''
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`tone-${option.value}`}
                              className="sr-only"
                            />
                            <option.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Summarize Button */}
                  <Button 
                    onClick={handleSummarize} 
                    disabled={isLoading}
                    className="w-full transition-all hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Summarizing...</span>
                      </motion.div>
                    ) : (
                      'Generate Summary'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Right Column - Input and Output */}
            <div className="space-y-6">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 transition-all hover:shadow-md">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Input Text</h2>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[300px] border-0 focus-visible:ring-0 transition-colors"
                      placeholder="Enter or paste your text here..."
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="text-xs">Words: {text.split(/\s+/).filter(Boolean).length}</span>
                      <span className="text-xs text-orange-500">~{calculateTokens(text)} tokens</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Output Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-4 transition-all hover:shadow-md">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    {isLoading ? (
                      <div className="min-h-[300px] space-y-4">
                        {[92, 96, 88, 94, 90, 85, 89].map((width, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.1 }}
                          >
                            <Skeleton className={`h-[24px] w-[${width}%]`} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        className="min-h-[300px] border-0 focus-visible:ring-0 transition-colors"
                        placeholder="Your summary will appear here..."
                        value={summary}
                        readOnly
                      />
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="text-xs">Words: {summary.split(/\s+/).filter(Boolean).length}</span>
                      <span className="text-xs text-orange-500">~{calculateTokens(summary)} tokens</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}