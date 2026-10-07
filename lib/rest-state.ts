// Best-effort memory of the last AI quota hit, so the next visitors see the badge
// without having to submit a username. Lives per server instance.
let aiLimitedUntil = 0

export function markAiLimited(resetAt?: number) {
    aiLimitedUntil = resetAt ?? Date.now() + 60_000
}

export function getAiLimitedUntil() {
    return aiLimitedUntil > Date.now() ? aiLimitedUntil : undefined
}
