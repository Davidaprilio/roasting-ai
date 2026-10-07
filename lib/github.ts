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

function githubApiHeaders() {
    // Optional token raises the GitHub API rate limit from 60 to 5000 req/hour
    const token = process.env.GITHUB_TOKEN
    return token ? { Authorization: `Bearer ${token}` } : undefined
}

export async function findInformationGithubProfile(username: string) {
    const [userRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, { headers: githubApiHeaders() }),
        axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: githubApiHeaders(),
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
export type RateLimitInfo = {
    source: 'github' | 'ai'
    // epoch milliseconds when the limit resets, if known
    resetAt?: number
}

// Detects GitHub API rate limit (403/429 with no remaining quota), Gemini quota (429)
// and Gemini overload (503, once the fallback models are used up too) errors
export function getRateLimitInfo(err: unknown): RateLimitInfo | null {
    if (err instanceof AxiosError && err.response) {
        const { status, headers } = err.response
        const exhausted = headers['x-ratelimit-remaining'] === '0'
        if (status === 429 || (status === 403 && exhausted)) {
            const reset = Number(headers['x-ratelimit-reset'])
            return { source: 'github', resetAt: reset ? reset * 1000 : undefined }
        }
        return null
    }
    const status = (err as { status?: number } | null)?.status
    if (status === 429 || status === 503) {
        return { source: 'ai' }
    }
    return null
}

// Querying /rate_limit does not count against the quota
export async function getGithubRateLimit() {
    const res = await axios.get('https://api.github.com/rate_limit', { headers: githubApiHeaders() })
    const core = res.data?.resources?.core ?? res.data?.rate
    return {
        remaining: Number(core?.remaining ?? 1),
        resetAt: core?.reset ? Number(core.reset) * 1000 : undefined,
    }
}
