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

async function getCategoryPosts(categorySlug: string, page: number = 1) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(
            `${baseUrl}/api/blog/posts?category=${categorySlug}&page=${page}&limit=12`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching category posts:', error);
        return null;
    }
}

async function getCategory(slug: string) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('post_categories')
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
    const category = await getCategory(params.slug);

    if (!category) {
        return {
            title: 'Category Not Found - Oludeniz Tours',
        };
    }

    return {
        title: `${category.name} - Oludeniz Tours Blog`,
        description: category.description || `Browse all posts in ${category.name}`,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const currentPage = parseInt(searchParams.page || '1');
    const category = await getCategory(params.slug);

    if (!category) {
        notFound();
    }

    const data = await getCategoryPosts(params.slug, currentPage);

    if (!data) {
        notFound();
    }

    const { posts, pagination } = data;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Category Header */}
            <div
                className="py-16 px-4"
                style={{ backgroundColor: category.color || '#3B82F6' }}
            >
                <div className="max-w-7xl mx-auto text-center text-white">
                    <div className="inline-block mb-4">
                        {category.icon && (
                            <span className="text-6xl">{category.icon}</span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            {category.description}
                        </p>
                    )}
                    <div className="mt-6 text-white/80">
                        {category.post_count || posts.length} {category.post_count === 1 ? 'post' : 'posts'}
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
                        <span className="text-gray-900">{category.name}</span>
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
                            basePath={`/blog/category/${params.slug}`}
                        />
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div
                            className="inline-block w-24 h-24 rounded-full mb-6 flex items-center justify-center text-4xl"
                            style={{ backgroundColor: category.color + '20' }}
                        >
                            {category.icon || '📝'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No posts yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We haven't published any posts in this category yet.
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
