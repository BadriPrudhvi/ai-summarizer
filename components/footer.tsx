import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer 
      className="border-t py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground">
          Powered by{' '}
          <a 
            href="https://developers.cloudflare.com/workers-ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            Cloudflare Workers AI
          </a>
          {' '}using{' '}
          <a 
            href="https://developers.cloudflare.com/workers-ai/models/llama-3.1-70b-instruct/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            Meta Llama 3.1
          </a>
        </p>
      </div>
    </motion.footer>
  )
} 