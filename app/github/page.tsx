"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Flame, GitBranch, GitFork, Moon, Sun } from 'lucide-react'
import ThreeDotsWave from '@/components/ui/dot-wave'
import GridPattern from '@/components/ui/grid-pattern'
import { motion } from 'framer-motion'
import { generateGithubRoast, isExistGithubUsername } from './actions'
import { toast } from 'sonner'
import { findInformationGithubProfile } from '@/lib/github'
import { Toaster } from '@/components/ui/sonner'

export default function Page() {
    const [username, setUsername] = useState('')
    const [roastResult, setRoastResult] = useState<{
        user: {
            name: string|null
            avatar: string|null
        }
        roast: string
    }>()
    const [isRoasting, setIsRoasting] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }, [])

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkMode])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsRoasting(true)
        // Simulate API call

        try {
            const exists = await isExistGithubUsername(username)
            if (!exists) {  
                toast.warning('Username nya gak ada!, cek lagi yang bener')
                setIsRoasting(false)
                return
            }
        } catch {
            toast.error('Sorry, something went wrong. Please try again.')
            setIsRoasting(false)
            return
        }

        try {
            const ghProfile = await findInformationGithubProfile(username).catch(() => {
                return undefined
            })
            const resultRoast = await generateGithubRoast(username, ghProfile)
            setRoastResult(resultRoast)
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.')
        } finally { 
            setIsRoasting(false)
        }
    }

    return (
        <div className={`min-h-screen p-4 font-sans text-[#24292e] dark:text-[#c9d1d9] ${isDarkMode ? 'bg-github-dark' : 'bg-[#f6f8fa]'} transition-colors duration-200`
        }>
            <GridPattern
                width={40}
                height={40}
                className="[mask-image:radial-gradient(70vw_circle_at_center,rgba(255,255,255,8),transparent)]"
            />

            <header className="text-center mb-8 relative">
                <div className="absolute right-0 sm:right-4 -top-10 sm:top-4 flex items-center space-x-2">
                    <Sun className="h-4 w-4 dark:text-[#c9d1d9]" />
                    <Switch
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                        className="data-[state=checked]:bg-[#238636] data-[state=unchecked]:bg-[#6e7681]"
                    />
                    <Moon className="h-4 w-4 dark:text-[#c9d1d9]" />
                </div>
                <h1 className="text-4xl font-bold flex items-center justify-center mt-12 sm:mt-0">
                    <GitBranch className="mr-2 text-[#6f42c1] dark:text-[#8b949e]" />
                    Github Roasting
                    <GitFork className="ml-2 text-[#6f42c1] dark:text-[#8b949e]" />
                </h1>
                <p className="text-lg text-[#586069] dark:text-[#8b949e] max-w-md mx-auto">
                    Eh kesini, udah ngerasa cakep github lu? sini gua rosting
                </p>
            </header>

            <main className="max-w-2xl mx-auto z-10 relative">
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
                                    onChange={(e) => setUsername(e.target.value)}
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

                {isRoasting ? (
                    <div className='mt-40'>
                        <ThreeDotsWave />
                    </div>
                ) : roastResult && (
                    <motion.div 
                        initial={{ opacity: 0.5, scale: .95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            type: "spring",
                            duration: 0.5, 
                            stiffness: 100 
                        }}
                    >
                        <Card className={`${isDarkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-[#e1e4e8]'} border shadow-sm transition-colors duration-200`}>
                            <CardContent className="p-6">
                                <div className='flex flow-row justify-between'>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
                                        <img 
                                            src={roastResult.user.avatar ?? 'https://avatars.githubusercontent.com/u/10000000?v=4'} 
                                            alt="github avatar" 
                                            className='w-8 h-8 mr-2 rounded-full' 
                                        />
                                        {roastResult.user.name}
                                    </h2>
                                    <Flame className={`mr-2 ${isDarkMode ? 'text-[#8b949e]' : 'text-[#6f42c1]'}`} />
                                </div>
                                <div className={`${isDarkMode ? 'bg-github-dark border-[#30363d]' : 'bg-[#f1f8ff] border-[#c8e1ff]'} border rounded p-4 transition-colors duration-200`
                                }>
                                    <p className={`${isDarkMode ? 'text-[#c9d1d9]' : 'text-[#24292e]'} font-medium`}> {roastResult.roast} </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>


            <Toaster theme={isDarkMode ? 'dark' : 'light'} position='top-center' />
        </div>
    )
}
