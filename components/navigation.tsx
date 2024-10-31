'use client'

import { Button } from "@/components/ui/button"
import { FileText, Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

interface NavigationProps {
  theme: string
  toggleTheme: () => void
}

export function Navigation({ theme, toggleTheme }: NavigationProps) {
  return (
    <motion.header 
      className="border-b"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>AI Summarizer</span>
          </span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </motion.header>
  )
} 