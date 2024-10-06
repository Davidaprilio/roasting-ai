import GridPattern from '@/components/ui/grid-pattern'
import Head from 'next/head'
import { GitBranch, GitFork, Moon, Sun } from 'lucide-react'
import type { Metadata } from 'next'
import ThemeMode from './themeMode'
import { Suspense } from 'react'
import AppContent from './AppContent'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

export const metadata: Metadata = {
    title: 'Github',
    description: 'lihat github kamu diroasting disini',
    keywords: ['roasting', 'github', 'ai'],

}

export default async function Page() {
    return (
        <>
            <Head>
                <title>Github Roast</title>
                <meta name="description" content="AI akan meroasting sesuai profil kamu" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='min-h-screen w-full p-4 font-sans text-[#24292e] dark:text-[#c9d1d9] dark:bg-github-dark bg-[#f6f8fa] transition-colors duration-200 relative mb-auto flex flex-col'>
                <GridPattern
                    width={40}
                    height={40}
                    className="[mask-image:radial-gradient(70vw_circle_at_center,rgba(255,255,255,8),transparent)] -mt-36 sm:mt-0"
                />

                <header className="text-center mb-8 relative">
                    <h1 className="text-4xl font-bold flex items-center justify-center mt-8 sm:mt-0">
                        <GitBranch className="mr-2 text-[#6f42c1] dark:text-[#8b949e]" />
                        Github Roasting
                        <GitFork className="ml-2 text-[#6f42c1] dark:text-[#8b949e]" />
                    </h1>
                    <p className="text-lg text-[#586069] dark:text-[#8b949e] max-w-md mx-auto">
                        Eh kesini, udah ngerasa cakep github lu? sini gua rosting
                    </p>
                </header>


                <Suspense fallback={<div className="h-4 w-4 animate-pulse bg-github-secondary dark:bg-github-secondary" />}>
                    <AppContent />
                </Suspense>

                <div className='w-full mt-auto bottom-0 flex justify-between sm:justify-center'>
                    <a href="https://github.com/Davidaprilio/roasting-ai" target='_blank'>
                        <GitHubLogoIcon className='w-6 h-6' />
                    </a>

                    <div className="sm:absolute right-0 sm:right-4 sm:top-4 flex items-center space-x-2">
                        <Sun className="h-4 w-4 dark:text-[#c9d1d9]" />
                        <Suspense fallback={(
                            <div className="h-4 w-4 animate-pulse bg-github-secondary dark:bg-github-secondary" />
                        )}>
                            <ThemeMode />
                        </Suspense>
                        <Moon className="h-4 w-4 dark:text-[#c9d1d9]" />
                    </div>
                </div>
            </div>
        </>
    )
}
