"use client"

import { motion } from 'framer-motion'
import type { RateLimitInfo } from '@/lib/github'

const GITHUB_MESSAGES = [
    { emoji: '🔥', title: 'Kompor roasting lagi didinginin', body: 'Kebanyakan yang minta dipanggang, GitHub sampe ngos-ngosan ngasih datanya.', hideReset: true },
    { emoji: '☕', title: 'Tukang roasting lagi ngopi dulu', body: 'Lidahnya kepanasan abis nyinyirin banyak profil. Sabar, bentar lagi pedes lagi.' },
    { emoji: '😮‍💨', title: 'Kuota nyinyir lagi mentok', body: 'GitHub bilang "udah dulu ya, kasian orangnya". Padahal kita belum puas.' },
]

const AI_MESSAGES = [
    { emoji: '🧠', title: 'Otak roasting-nya lagi overheat', body: 'AI-nya kebanyakan mikirin kata-kata nyelekit, sekarang lagi ngadem di kulkas.' },
    { emoji: '🤐', title: 'Mulut pedes lagi dikunci sementara', body: 'Jatah ngomong AI hari ini lagi abis. Simpen dulu mental lu buat nanti.' },
]

type Message = { emoji: string, title: string, body: string, hideReset?: boolean }

export function pickRestMessage(source: RateLimitInfo['source']): Message {
    const list: Message[] = source === 'ai' ? AI_MESSAGES : GITHUB_MESSAGES
    return list[Math.floor(Math.random() * list.length)]
}

export type RestMessage = ReturnType<typeof pickRestMessage>

export default function RestBadge({ message, resetAt }: { message: RestMessage, resetAt?: number }) {
    const resetTime = resetAt
        ? new Date(resetAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : null

    return (
        <motion.div
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 bg-[#fff8c5] border-[#d4a72c66] text-[#4d2d00] dark:bg-[#bb800926] dark:border-[#bb800966] dark:text-[#e3b341] transition-colors duration-200'
        >
            <span className='text-2xl leading-none animate-pulse' aria-hidden>{message.emoji}</span>
            <div className='text-sm'>
                <p className='font-semibold'>
                    <span className='mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#d4a72c33] dark:bg-[#bb800940]'>lagi istirahat</span>
                    {message.title}
                </p>
                <p className='mt-1 opacity-90'>
                    {message.body}
                    {!message.hideReset && (
                        resetTime ? ` Balik lagi sekitar jam ${resetTime} ya.` : ' Coba lagi beberapa saat lagi ya.'
                    )}
                </p>
            </div>
        </motion.div>
    )
}
