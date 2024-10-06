import axios, { AxiosError } from 'axios'

export function removeUnusedData(data: { [k: string]: any }) {
    for (const key in data) {
        if (['avatar_url'].includes(key)) {
            continue
        }
        if (typeof data[key] === 'object') {
            removeUnusedData(data[key])
            continue
        }
        if (key.includes('url') || key.includes('id')) {
            delete data[key]
        }
    }
    return data
}

export async function isExistsGithubProfile(username: string) {
    try {
        const res = await axios.get(`https://github.com/${username}`)
        return res.status === 200
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
                return false
            }
        }

        throw err
    }
}

export async function findInformationGithubProfile(username: string) {
    const [userRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos`, {
            params: {
                sort: 'updated',
                per_page: 6
            }
        }),
    ])

    const userData = userRes.data
    const reposData = repoRes.data
    console.info('Remain Rete Limit:', repoRes.headers['x-ratelimit-remaining']);

    const data = {
        user: removeUnusedData(userData),
        repositories: reposData.map((repo: any) => {
            return removeUnusedData(repo)
        }),
    }

    return data
}

export async function getReadmeGithubProfile(username: string, branch?: string): Promise<string|null> {
    const getUrl = (branch: string) => `https://raw.githubusercontent.com/${username}/${username}/refs/heads/${branch}/README.md`

    for (const branchCheck of [branch, 'main', 'master']) {
        if (!branchCheck) continue

        try {
            const res = await axios.get(getUrl(branchCheck))
            return res.data
        } catch {
            console.log(`${branchCheck} branch not found for README.md ${username}`);
        }
    }

    return null
}