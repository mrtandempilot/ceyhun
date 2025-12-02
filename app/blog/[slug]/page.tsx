import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import BlogPostContent from '@/components/BlogPostContent';
import SocialShareButtons from '@/components/SocialShareButtons';
import CategoryBadge from '@/components/CategoryBadge';
import BlogCard from '@/components/BlogCard';
import { PostWithRelations } from '@/types/blog';
import { generateArticleStructuredData } from '@/lib/seo';

interface PageProps {
    params: { slug: string };
}

async function getPost(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const data = await getPost(params.slug);

    if (!data || !data.post) {
        return {
            title: 'Post Not Found - Oludeniz Tours',
        };
    }

    const post: PostWithRelations = data.post;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/blog/${post.slug}`;

    return {
        title: `${post.title} - Oludeniz Tours Blog`,
        description: post.meta_description || post.excerpt || post.title,
        keywords: post.meta_keywords?.join(', '),
        openGraph: {
            title: post.title,
            description: post.meta_description || post.excerpt || post.title,
            type: 'article',
            url,
            images: post.og_image || post.featured_image ? [
                {
                    url: post.og_image || post.featured_image || '',
                    alt: post.featured_image_alt || post.title,
                },
            ] : [],
            publishedTime: post.published_at || post.created_at,
            modifiedTime: post.updated_at,
            authors: [post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.meta_description || post.excerpt || post.title,
            images: post.og_image || post.featured_image ? [post.og_image || post.featured_image || ''] : [],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const data = await getPost(params.slug);

    if (!data || !data.post) {
        notFound();
    }

    const post: PostWithRelations = data.post;
    const relatedPosts: PostWithRelations[] = data.relatedPosts || [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
    const structuredData = generateArticleStructuredData(post, baseUrl);

    return (
        <main className="min-h-screen bg-white">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                        {post.categories && post.categories.length > 0 && (
                            <>
                                <span>/</span>
                                <Link
                                    href={`/blog/category/${post.categories[0].slug}`}
                                    className="hover:text-blue-600"
                                >
                                    {post.categories[0].name}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-gray-900 truncate">{post.title}</span>
                    </nav>
                </div>
            </div>

            {/* Article Header */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((category) => (
                            <CategoryBadge key={category.id} category={category} />
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-xl text-gray-600 mb-6">
                        {post.excerpt}
                    </p>
                )}

                {/* Author & Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        {/* Author */}
                        {post.author_avatar ? (
                            <Image
                                src={post.author_avatar}
                                alt={post.author_name}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {post.author_name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900">{post.author_name}</p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <time dateTime={post.published_at || post.created_at}>
                                    {format(publishedDate, 'MMMM d, yyyy')}
                                </time>
                                {post.reading_time_minutes && (
                                    <>
                                        <span>•</span>
                                        <span>{post.reading_time_minutes} min read</span>
                                    </>
                                )}
                                {post.views > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{post.views.toLocaleString()} views</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <SocialShareButtons
                        url={postUrl}
                        title={post.title}
                        description={post.excerpt || undefined}
                    />
                </div>

                {/* Featured Image */}
                {post.featured_image && (
                    <div className="mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={post.featured_image}
                            alt={post.featured_image_alt || post.title}
                            width={1200}
                            height={630}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}

                {/* Content */}
                <div className="mb-12">
                    <BlogPostContent content={post.content} />
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/blog/tag/${tag.slug}`}
                                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author Bio */}
                {post.author_bio && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-12">
                        <div className="flex items-start space-x-4">
                            {post.author_avatar ? (
                                <Image
                                    src={post.author_avatar}
                                    alt={post.author_name}
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                    {post.author_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">About {post.author_name}</h3>
                                <p className="text-gray-700">{post.author_bio}</p>
                            </div>
                        </div>
                    </div>
                )}
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Posts</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <BlogCard key={relatedPost.id} post={relatedPost} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Back to Blog */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Blog</span>
                </Link>
            </div>
        </main>
    );
}
