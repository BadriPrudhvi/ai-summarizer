import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    try {
        const ctx = getRequestContext()
        if (!ctx?.env?.AI || !ctx?.env?.CLOUDFLARE_GATEWAY_ID) {
            throw new Error('Required environment variables are not set')
        }

        const ai = ctx.env.AI
        const gateway_id = ctx.env.CLOUDFLARE_GATEWAY_ID
        
        let { userInput, format, tone } = await request.json() as { 
            userInput: string;
            format: 'paragraph' | 'bullets' | 'numbered' | 'outline';
            tone: 'casual' | 'professional' | 'academic';
        }

        const formatInstructions = {
            paragraph: "Format the response as a continuous flowing paragraph.",
            bullets: "Format the response as bullet points, with each key point on a new line starting with '• '.",
            numbered: "Format the response as a numbered list, with each point numbered sequentially.",
            outline: "Format the response as an outline with main points and sub-points using appropriate indentation."
        }

        const toneInstructions = {
            casual: "Use a conversational and friendly tone, as if explaining to a friend.",
            professional: "Use a clear, concise, and business-appropriate tone.",
            academic: "Use a formal, scholarly tone with precise language."
        }
      
        const systemPrompt = `You are a text summarization assistant. Your task is to create clear, effective summaries while maintaining the key points and meaning of the original text. Follow these guidelines:

- Maintain the main ideas and crucial details
- Use clear, straightforward language
- Keep the summary length as requested by the user
- Ensure the summary is coherent and flows well
- ${formatInstructions[format]}
- ${toneInstructions[tone]}

The summary should strictly follow the requested format and tone while preserving the essential information.`

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput },
        ]

        const response = await ai.run("@cf/meta/llama-3.1-70b-instruct",
            { 
                messages, 
                temperature: 0.7,
                max_tokens: 2048,
            }, 
            {
                gateway: {
                    id: gateway_id,
                    skipCache: false,
                    cacheTtl: 3600000,
                },
            },
        )

        if (!response?.response) {
            throw new Error('No response received from AI')
        }

        return new Response(JSON.stringify({ aiResponse: response.response }), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('Error in generate-chat:', error)
        return new Response(
            JSON.stringify({ 
                error: 'Failed to generate response', 
                details: error instanceof Error ? error.message : 'Unknown error'
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
    }
}
