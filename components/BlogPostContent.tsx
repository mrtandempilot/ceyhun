'use client';

interface BlogPostContentProps {
    content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
    // Simple HTML/Markdown rendering
    // For now, we'll use dangerouslySetInnerHTML with basic markdown-like formatting
    // You can enhance this with react-markdown and syntax highlighting later

    const formatContent = (text: string) => {
        // Convert markdown-style formatting to HTML
        return text
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-4 text-gray-900">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-6 text-gray-900">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p class="mb-4">')
            // Lists
            .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>');
    };

    const formattedContent = formatContent(content);

    return (
        <div
            className="prose prose-lg max-w-none
        prose-headings:text-gray-900 
        prose-p:text-gray-900 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-900 prose-li:my-2
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-800
        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-900"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${formattedContent}</p>` }}
        />
    );
}
