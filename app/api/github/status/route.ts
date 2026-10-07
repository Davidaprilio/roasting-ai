import { getGithubRateLimit } from "@/lib/github"
import { getAiLimitedUntil } from "@/lib/rest-state"

export const dynamic = 'force-dynamic'

export async function GET() {
    const aiLimitedUntil = getAiLimitedUntil()
    if (aiLimitedUntil) {
        return Response.json({ limited: true, source: 'ai', resetAt: aiLimitedUntil })
    }

    try {
        const { remaining, resetAt } = await getGithubRateLimit()
        return Response.json({ limited: remaining <= 0, source: 'github', resetAt })
    } catch {
        return Response.json({ limited: false })
    }
}
