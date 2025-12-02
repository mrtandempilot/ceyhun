import { Metadata } from 'next';
import BlogCard from '@/components/BlogCard';
import BlogPagination from '@/components/BlogPagination';
import Link from 'next/link';
import { PostWithRelations, PostCategory, PostTag } from '@/types/blog';

export const metadata: Metadata = {
    title: 'Blog - Oludeniz Tours | Adventure Stories & Travel Tips',
    description: 'Discover amazing adventure stories, travel tips, and guides from Oludeniz. Read about paragliding experiences, local attractions, and more.',
    openGraph: {
        title: 'Blog - Oludeniz Tours',
        description: 'Adventure stories, travel tips, and guides from Oludeniz',
        type: 'website',
    },
};

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBlogPosts(page: number = 1) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/blog/posts?page=${page}&limit=12`, {
            cache: 'no-store', // Always fetch fresh data
        });

        if (!res.ok) {
            throw new Error('Failed to fetch posts');
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return { posts: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
}

async function getCategories() {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('post_categories')
            .select('*')
            .order('post_count', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function getPopularPosts() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/blog/posts?sort=popular&limit=5`, {
            cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch popular posts');

        const data = await res.json();
        return data.posts || [];
    } catch (error) {
        console.error('Error fetching popular posts:', error);
        return [];
    }
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    const currentPage = parseInt(searchParams.page || '1');
    const { posts, pagination } = await getBlogPosts(currentPage);
    const categories = await getCategories();
    const popularPosts = await getPopularPosts();

    const featuredPost = posts[0]; // Always show latest post
    const regularPosts = posts.filter((p: PostWithRelations) => p.id !== featuredPost?.id);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section with Featured Post */}
            {featuredPost && currentPage === 1 && (
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                {featuredPost.categories && featuredPost.categories.length > 0 && (
                                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
                                        Featured
                                    </span>
                                )}
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    {featuredPost.title}
                                </h1>
                                {featuredPost.excerpt && (
                                    <p className="text-xl mb-6 text-blue-100">
                                        {featuredPost.excerpt}
                                    </p>
                                )}
                                <div className="flex items-center space-x-4 mb-6">
                                    <span className="text-blue-100">By {featuredPost.author_name}</span>
                                    {featuredPost.reading_time_minutes && (
                                        <>
                                            <span className="text-blue-300">•</span>
                                            <span className="text-blue-100">{featuredPost.reading_time_minutes} min read</span>
                                        </>
                                    )}
                                </div>
                                <Link
                                    href={`/blog/${featuredPost.slug}`}
                                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    Read Full Story
                                </Link>
                            </div>
                            {featuredPost.featured_image && (
                                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={featuredPost.featured_image}
                                        alt={featuredPost.featured_image_alt || featuredPost.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Posts Grid */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {currentPage === 1 ? 'Latest Posts' : `Posts - Page ${currentPage}`}
                        </h2>

                        {regularPosts.length > 0 ? (
                            <>
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    {regularPosts.map((post: PostWithRelations, index: number) => (
                                        <BlogCard key={post.id} post={post} priority={currentPage === 1 && index < 4} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <BlogPagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    basePath="/blog"
                                />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No posts found.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                                <ul className="space-y-2">
                                    {categories.map((category: PostCategory) => (
                                        <li key={category.id}>
                                            <Link
                                                href={`/blog/category/${category.slug}`}
                                                className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span>{category.name}</span>
                                                </span>
                                                <span className="text-sm text-gray-500">{category.post_count}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/blog"
                                    className="block mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View All Posts →
                                </Link>
                            </div>
                        )}

                        {/* Popular Posts */}
                        {popularPosts.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Posts</h3>
                                <ul className="space-y-4">
                                    {popularPosts.map((post: PostWithRelations) => (
                                        <li key={post.id}>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="group block"
                                            >
                                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                                    {post.title}
                                                </h4>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    {post.views > 0 && (
                                                        <span>{post.views.toLocaleString()} views</span>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}
