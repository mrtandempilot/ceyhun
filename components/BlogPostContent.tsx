'use client';

interface BlogPostContentProps {
    content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
    const formatContent = (text: string) => {
        const blocks = text.split(/\n\n/g);
        return blocks.map(block => {
            // Headers
            if (block.startsWith('### ')) return `<h3 class="text-2xl font-bold mt-8 mb-4 text-gray-900">${block.substring(4)}</h3>`;
            if (block.startsWith('## ')) return `<h2 class="text-3xl font-bold mt-10 mb-4 text-gray-900">${block.substring(3)}</h2>`;
            if (block.startsWith('# ')) return `<h1 class="text-4xl font-bold mt-12 mb-6 text-gray-900">${block.substring(2)}</h1>`;

            // Lists
            if (block.match(/^\- (.*$)/gm)) {
                const items = block.split(/\n/g).map(item => `<li>${item.substring(2)}</li>`).join('');
                return `<ul class="ml-6 list-disc">${items}</ul>`;
            }
            if (block.match(/^(\d+)\. (.*$)/gm)) {
                const items = block.split(/\n/g).map(item => `<li>${item.substring(item.indexOf('.') + 2)}</li>`).join('');
                return `<ol class="ml-6 list-decimal">${items}</ol>`;
            }

            // Default to paragraph
            let processedBlock = block
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                // Links
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>');

            return `<p class="mb-4">${processedBlock}</p>`;
        }).join('');
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
            dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
    );
}
