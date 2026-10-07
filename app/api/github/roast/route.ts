import { findInformationGithubProfile, getReadmeGithubProfile, isExistsGithubProfile } from "@/lib/github"
import { modelFunRoaster } from "@/lib/model"

// Allow the AI more time; streaming keeps the connection alive meanwhile
export const maxDuration = 60

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/

export type RoastStreamEvent =
    | { type: 'status', message: string }
    | { type: 'user', user: { name: string | null, avatar: string | null } }
    | { type: 'chunk', text: string }
    | { type: 'not_found' }
    | { type: 'error', message: string }
    | { type: 'done' }

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}))
    const username = typeof body?.username === 'string' ? body.username.trim() : ''

    if (!USERNAME_PATTERN.test(username)) {
        return Response.json({ message: 'Username tidak valid' }, { status: 400 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            // Newline-delimited JSON, one event per line
            const send = (event: RoastStreamEvent) => {
                controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
            }

            try {
                console.log('GH Username:', username)
                send({ type: 'status', message: `Lagi nyari akun ${username}...` })
                if (!await isExistsGithubProfile(username)) {
                    send({ type: 'not_found' })
                    return
                }

                send({ type: 'status', message: `Lagi ngintip repo ${username}...` })
                const githubInfo = await findInformationGithubProfile(username).catch((err) => {
                    console.error('Failed fetching github profile:', err?.message)
                    return undefined
                })
                send({
                    type: 'user',
                    user: {
                        name: githubInfo?.user?.name ?? username,
                        avatar: githubInfo?.user?.avatar_url ?? null,
                    },
                })

                send({ type: 'status', message: `Lagi baca README ${username}...` })
                const mdProfile = await getReadmeGithubProfile(username)

                send({ type: 'status', message: `Lagi nyiapin roasting pedes buat ${username}...` })
                const prompt = [
                    `berikan roasting jangan terlalu singkat dan jangan terlalu panjang untuk profile github: ${username}.`,
                    `Berikut detailnya:\n${JSON.stringify(githubInfo)}`,
                    `Profile Markdown:\n${mdProfile}`,
                ].join('\n')

                const result = await modelFunRoaster.generateContentStream(prompt)
                for await (const chunk of result.stream) {
                    const text = chunk.text()
                    if (text) send({ type: 'chunk', text })
                }
                send({ type: 'done' })
            } catch (err) {
                console.error('Roast failed:', err instanceof Error ? err.message : err)
                send({ type: 'error', message: 'Something went wrong. Please try again.' })
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
        },
    })
}
