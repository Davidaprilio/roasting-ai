"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { setCookieTheme } from "@/lib/utils"

export default function ThemeMode() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>()

    useEffect(() => {
        if (isDarkMode === undefined) {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
            return
        }
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        setCookieTheme(isDarkMode ? 'dark' : 'light')
    }, [isDarkMode])


    return (
        <>
            <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-[#238636] data-[state=unchecked]:bg-[#6e7681]"
            />
            <Toaster theme={isDarkMode ? 'dark' : 'light'} position='top-center' />
        </>
    )
}
