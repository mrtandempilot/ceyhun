import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import BlogCard from '@/components/BlogCard';
import BlogPagination from '@/components/BlogPagination';
import Link from 'next/link';
import { PostWithRelations } from '@/types/blog';
import { notFound } from 'next/navigation';

interface PageProps {
    params: { slug: string };
    searchParams: { page?: string };
}

async function getTagPosts(tagSlug: string, page: number = 1) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(
            `${baseUrl}/api/blog/posts?tag=${tagSlug}&page=${page}&limit=12`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching tag posts:', error);
        return null;
    }
}

async function getTag(slug: string) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('post_tags')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const tag = await getTag(params.slug);

    if (!tag) {
        return {
            title: 'Tag Not Found - Oludeniz Tours',
        };
    }

    return {
        title: `${tag.name} - Oludeniz Tours Blog`,
        description: tag.description || `Browse all posts tagged with ${tag.name}`,
    };
}

export default async function TagPage({ params, searchParams }: PageProps) {
    const currentPage = parseInt(searchParams.page || '1');
    const tag = await getTag(params.slug);

    if (!tag) {
        notFound();
    }

    const data = await getTagPosts(params.slug, currentPage);

    if (!data) {
        notFound();
    }

    const { posts, pagination } = data;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Tag Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-16 px-4">
                <div className="max-w-7xl mx-auto text-center text-white">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                        <span className="text-4xl">#</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        #{tag.name}
                    </h1>
                    {tag.description && (
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            {tag.description}
                        </p>
                    )}
                    <div className="mt-6 text-white/80">
                        {tag.post_count || posts.length} {tag.post_count === 1 ? 'post' : 'posts'}
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                        <span>/</span>
                        <span className="text-gray-900">#{tag.name}</span>
                    </nav>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {posts.length > 0 ? (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {posts.map((post: PostWithRelations) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <BlogPagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            basePath={`/blog/tag/${params.slug}`}
                        />
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 mb-6 text-4xl">
                            #
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No posts yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We haven't published any posts with this tag yet.
                        </p>
                        <Link
                            href="/blog"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            View All Posts
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
