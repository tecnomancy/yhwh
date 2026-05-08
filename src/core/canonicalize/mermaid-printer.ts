// Wave 2 — pragmatic preservation: trim only.
// Wave 3+ will reintroduce sorted participants / stable arrows once a richer
// mermaid AST captures node labels and arrow styles without information loss.
export const printMermaidContent = (raw: string): string => raw.trim()
