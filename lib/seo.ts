// SEO utilities for meta tags and structured data

import { PostWithRelations } from '@/types/blog';

export interface MetaTags {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    twitterCard?: string;
}

export function generatePostMetaTags(post: PostWithRelations, baseUrl: string): MetaTags {
    const url = `${baseUrl}/blog/${post.slug}`;

    return {
        title: `${post.title} - Oludeniz Tours Blog`,
        description: post.meta_description || post.excerpt || post.title,
        keywords: post.meta_keywords?.join(', '),
        ogImage: post.og_image || post.featured_image || `${baseUrl}/og-default.jpg`,
        ogType: 'article',
        canonicalUrl: post.canonical_url || url,
        twitterCard: 'summary_large_image',
    };
}

export function generateBlogListMetaTags(baseUrl: string): MetaTags {
    return {
        title: 'Blog - Oludeniz Tours | Adventure Stories & Travel Tips',
        description: 'Discover amazing adventure stories, travel tips, and guides from Oludeniz. Read about paragliding experiences, local attractions, and more.',
        ogImage: `${baseUrl}/og-blog.jpg`,
        ogType: 'website',
        canonicalUrl: `${baseUrl}/blog`,
        twitterCard: 'summary_large_image',
    };
}

export function generateCategoryMetaTags(categoryName: string, categoryDescription: string | null, baseUrl: string, categorySlug: string): MetaTags {
    return {
        title: `${categoryName} - Oludeniz Tours Blog`,
        description: categoryDescription || `Browse all posts in ${categoryName} category`,
        ogType: 'website',
        canonicalUrl: `${baseUrl}/blog/category/${categorySlug}`,
        twitterCard: 'summary',
    };
}

export function generateTagMetaTags(tagName: string, baseUrl: string, tagSlug: string): MetaTags {
    return {
        title: `Posts tagged "${tagName}" - Oludeniz Tours Blog`,
        description: `Browse all posts tagged with ${tagName}`,
        ogType: 'website',
        canonicalUrl: `${baseUrl}/blog/tag/${tagSlug}`,
        twitterCard: 'summary',
    };
}

// JSON-LD structured data
export function generateArticleStructuredData(post: PostWithRelations, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || post.excerpt,
        image: post.featured_image || `${baseUrl}/og-default.jpg`,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at,
        author: {
            '@type': 'Person',
            name: post.author_name,
            ...(post.author_avatar && { image: post.author_avatar }),
        },
        publisher: {
            '@type': 'Organization',
            name: 'Oludeniz Tours',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${post.slug}`,
        },
        ...(post.meta_keywords && {
            keywords: post.meta_keywords.join(', '),
        }),
    };
}

export function generateBlogStructuredData(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Oludeniz Tours Blog',
        description: 'Adventure stories, travel tips, and guides from Oludeniz',
        url: `${baseUrl}/blog`,
        publisher: {
            '@type': 'Organization',
            name: 'Oludeniz Tours',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
            },
        },
    };
}
