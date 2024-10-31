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
        
        let { userInput } = await request.json() as { userInput: string }
      
        const systemPrompt = `You are a text summarization assistant. Your task is to create clear, concise summaries while maintaining the key points and meaning of the original text. Follow these guidelines:

- Maintain the main ideas and crucial details
- Use clear, straightforward language
- Keep the summary length as requested by the user
- Ensure the summary is coherent and flows well
- Preserve the tone of the original text where appropriate

Format your response as a simple paragraph without any markdown or special formatting.`

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
