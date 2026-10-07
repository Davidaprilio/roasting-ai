"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Flame } from 'lucide-react'
import ThreeDotsWave from '@/components/ui/dot-wave'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import type { RoastStreamEvent } from '@/app/api/github/roast/route'
import type { RateLimitInfo } from '@/lib/github'
import RestBadge, { pickRestMessage, type RestMessage } from './RestBadge'

export default function AppContent() {
    const [username, setUsername] = useState('')
    const [roastResult, setRoastResult] = useState<{
        user: {
            name: string | null
            avatar: string | null
        }
        roast: string
    }>()
    const [isRoasting, setIsRoasting] = useState(false)
    const [status, setStatus] = useState<string>()
    const [rest, setRest] = useState<{ message: RestMessage, resetAt?: number }>()

    const showRest = (limit: RateLimitInfo) => {
        setRest({ message: pickRestMessage(limit.source), resetAt: limit.resetAt })
    }

    // Show the badge right away if GitHub's quota is already used up
    useEffect(() => {
        fetch('/api/github/status')
            .then((res) => res.json())
            .then((data) => {
                if (data?.limited) setRest({ message: pickRestMessage(data.source === 'ai' ? 'ai' : 'github'), resetAt: data.resetAt })
            })
            .catch(() => {})
    }, [])

    // Hide the badge once the limit resets
    useEffect(() => {
        if (!rest?.resetAt) return
        const timer = setTimeout(() => setRest(undefined), Math.max(rest.resetAt - Date.now(), 0) + 1000)
        return () => clearTimeout(timer)
    }, [rest])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsRoasting(true)
        setRoastResult(undefined)
        setStatus(`Lagi nyari akun ${username}...`)

        const handleEvent = (event: RoastStreamEvent) => {
            switch (event.type) {
                case 'status':
                    setStatus(event.message)
                    break
                case 'user':
                    setRoastResult({ user: event.user, roast: '' })
                    break
                case 'chunk':
                    setStatus(undefined)
                    setRest(undefined)
                    setRoastResult((prev) => prev && { ...prev, roast: prev.roast + event.text })
                    break
                case 'rate_limited':
                    showRest(event.limit)
                    break
                case 'not_found':
                    toast.warning('Username nya gak ada!, cek lagi yang bener')
                    break
                case 'error':
                    toast.error(event.message)
                    break
            }
        }

        try {
            const res = await fetch('/api/github/roast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            })
            if (res.status === 400) {
                toast.warning('Username nya gak valid!, cek lagi yang bener')
                return
            }
            if (!res.ok || !res.body) {
                throw new Error(`Request failed with status ${res.status}`)
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? ''
                for (const line of lines) {
                    if (line.trim()) handleEvent(JSON.parse(line))
                }
            }
            if (buffer.trim()) handleEvent(JSON.parse(buffer))
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsRoasting(false)
            setStatus(undefined)
        }
    }

    return (
        <main className="max-w-2xl mx-auto z-10 relative w-full">
            {rest && <RestBadge message={rest.message} resetAt={rest.resetAt} />}
            <Card className='mb-8 dark:bg-[#161b22] dark:border-github-secondary bg-white border-[#e1e4e8] border shadow-sm transition-colors duration-20'>
                <CardContent className="p-6">
                    <div className="rounded-t-2xl p-4 -mx-6 -mt-6 mb-4 border-b dark:border-github-secondary transition-colors duration-200">
                        <div className="w-16 h-1 bg-gray-400 rounded-full mx-auto"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                placeholder="Username github"
                                value={username}
                                required
                                onChange={(e) => setUsername(e.target.value.trim())}
                                className='py-6 text-lg sm:pr-24 dark:bg-github-dark dark:border-github-secondary dark:text-[#c9d1d9] dark:focus:border-[#58a6ff]border-[#e1e4e8] focus:border-[#0366d6] focus:ring-[#0366d6] transition-colors duration-200 select-all'
                            />
                            <Button
                                type="submit"
                                className='sm:absolute sm:right-1.5 sm:top-1.5 mt-4 sm:mt-[1px] w-full sm:w-auto dark:bg-[#238636] dark:hover:bg-[#2ea043] bg-[#2ea44f] hover:bg-[#2c974b] text-white focus:outline-none focus:ring-2 focus:ring-[#2ea44f] focus:ring-offset-2 transition-colors duration-200'
                                disabled={isRoasting}
                            >
                                {isRoasting ? 'Roasting...' : 'Roast gue    !'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {status && (
                <div className='mt-24 mb-8 text-center'>
                    <ThreeDotsWave />
                    <p className='mt-16 dark:text-[#8b949e] text-[#586069]'>{status}</p>
                </div>
            )}
            {roastResult && roastResult.roast && (
                <motion.div
                    initial={{ opacity: 0.5, scale: .95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: "spring",
                        duration: 0.5,
                        stiffness: 100
                    }}
                >
                    <Card className='dark:bg-[#161b22] dark:border-[#30363d] bg-white border-[#e1e4e8] border shadow-sm transition-colors duration-200'>
                        <CardContent className="p-2 sm:p-5 pb-3">
                            <div className='flex flow-row justify-between p-1'>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
                                    <img
                                        src={roastResult.user.avatar ?? 'https://avatars.githubusercontent.com/u/10000000?v=4'}
                                        alt="github avatar"
                                        className='w-8 h-8 mr-2 rounded-full'
                                    />
                                    {roastResult.user.name}
                                </h2>
                                <Flame className='mr-2 dark:text-[#8b949e] text-[#6f42c1]' />
                            </div>
                            <div className='dark:bg-github-dark dark:border-[#30363d] bg-[#f1f8ff] border-[#c8e1ff] border rounded p-4 transition-colors duration-200'>
                                <ReactMarkdown className='dark:text-[#c9d1d9] text-[#24292e] font-normal'>{roastResult.roast}</ReactMarkdown> 
                            </div>

                            <p className='mt-2 dark:text-[#8b949e] text-[#6f42c1] text-center text-xs'>jangan baper</p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </main>
    )
}
