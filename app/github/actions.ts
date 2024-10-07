'use server'

import { findInformationGithubProfile, getReadmeGithubProfile, isExistsGithubProfile } from "@/lib/github"
import { modelFunRoaster } from "@/lib/model"

export async function generateGithubRoast(username: string, githubInfo?: Record<string, any>) {
    console.log('GH Username:', username)
    if (githubInfo === undefined) {
        githubInfo = await findInformationGithubProfile(username)
    }

    const mdProfile = await getReadmeGithubProfile(username)

    const prompt = [
        `berikan roasting jangan terlalu singkat dan jangan terlalu panjang untuk profile github: ${username}.`,
        `Berikut detailnya:\n${JSON.stringify(githubInfo)}`,
        `Profile Markdown:\n${mdProfile}`,
    ].join('\n')

    const result = await modelFunRoaster.generateContent(prompt)
    const response = result.response
    return {
        user: {
            name: githubInfo?.user?.name ?? null,
            avatar: githubInfo?.user?.avatar_url ?? null,
        },
        roast: response.text()
    }
}

export async function isExistGithubUsername(username: string) {
    return await isExistsGithubProfile(username)
}
