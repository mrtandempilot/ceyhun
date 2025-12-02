// Reading time calculator
// Assumes average reading speed of 200 words per minute

export function calculateReadingTime(text: string): number {
    // Remove markdown syntax and HTML tags for accurate word count
    const cleanText = text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '')         // Remove inline code
        .replace(/<[^>]*>/g, '')         // Remove HTML tags
        .replace(/[#*_~\[\]()]/g, '')    // Remove markdown syntax
        .trim();

    // Count words
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Calculate reading time (200 words per minute, minimum 1 minute)
    const minutes = Math.max(Math.ceil(wordCount / 200), 1);

    return minutes;
}

export function formatReadingTime(minutes: number): string {
    if (minutes === 1) {
        return '1 min read';
    }
    return `${minutes} min read`;
}
