import Link from 'next/link';
import Image from 'next/image';
import { PostWithRelations } from '@/types/blog';
import { formatReadingTime } from '@/lib/readingTime';
import CategoryBadge from './CategoryBadge';
import { format } from 'date-fns';

interface BlogCardProps {
    post: PostWithRelations;
    priority?: boolean;
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
    const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
    const primaryCategory = post.categories && post.categories.length > 0 ? post.categories[0] : null;

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Featured Image */}
            <Link href={`/blog/${post.slug}`} className="block relative h-48 md:h-56 overflow-hidden group">
                {post.featured_image ? (
                    <Image
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold opacity-50">
                            {post.title.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Category Badge Overlay */}
                {primaryCategory && (
                    <div className="absolute top-3 left-3">
                        <CategoryBadge category={primaryCategory} />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {post.excerpt}
                    </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                        {/* Author */}
                        {post.author_avatar ? (
                            <div className="flex items-center space-x-2">
                                <Image
                                    src={post.author_avatar}
                                    alt={post.author_name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span>{post.author_name}</span>
                            </div>
                        ) : (
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{post.author_name}</span>
                            </span>
                        )}
                    </div>

                    {/* Reading Time */}
                    {post.reading_time_minutes && (
                        <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatReadingTime(post.reading_time_minutes)}</span>
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <time className="text-xs text-gray-500">
                        {format(publishedDate, 'MMM d, yyyy')}
                    </time>

                    {/* Read More Link */}
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* View Count */}
                {post.views > 0 && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center space-x 1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.views.toLocaleString()} views</span>
                    </div>
                )}
            </div>
        </article>
    );
}
