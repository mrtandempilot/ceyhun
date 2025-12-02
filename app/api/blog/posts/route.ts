import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Post, PostWithRelations, BlogPostsResponse } from '@/types/blog';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;

        // Parse query parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'latest';
        const featured = searchParams.get('featured') === 'true';

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('posts')
            .select(`
        *,
        categories:post_category_relations(
          category:post_categories(*)
        ),
        tags:post_tag_relations(
          tag:post_tags(*)
        )
      `, { count: 'exact' })
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString());

        // Apply filters
        if (category) {
            // Get category ID first
            const { data: cat } = await supabase
                .from('post_categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (cat) {
                // Filter by category through relations
                const { data: postIds } = await supabase
                    .from('post_category_relations')
                    .select('post_id')
                    .eq('category_id', cat.id);

                if (postIds && postIds.length > 0) {
                    query = query.in('id', postIds.map(p => p.post_id));
                } else {
                    // No posts in this category
                    return NextResponse.json({
                        posts: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false,
                        },
                    });
                }
            }
        }

        if (tag) {
            // Get tag ID first
            const { data: t } = await supabase
                .from('post_tags')
                .select('id')
                .eq('slug', tag)
                .single();

            if (t) {
                // Filter by tag through relations
                const { data: postIds } = await supabase
                    .from('post_tag_relations')
                    .select('post_id')
                    .eq('tag_id', t.id);

                if (postIds && postIds.length > 0) {
                    query = query.in('id', postIds.map(p => p.post_id));
                } else {
                    // No posts with this tag
                    return NextResponse.json({
                        posts: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false,
                        },
                    });
                }
            }
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
        }

        if (featured) {
            query = query.eq('is_featured', true);
        }

        // Apply sorting
        switch (sort) {
            case 'popular':
                query = query.order('views', { ascending: false });
                break;
            case 'oldest':
                query = query.order('published_at', { ascending: true });
                break;
            case 'latest':
            default:
                query = query.order('published_at', { ascending: false });
                break;
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return NextResponse.json(
                { error: 'Failed to fetch posts' },
                { status: 500 }
            );
        }

        // Transform data to include proper structure
        const posts: PostWithRelations[] = (data || []).map((post: any) => ({
            ...post,
            categories: post.categories
                ? post.categories.map((c: any) => c.category).filter(Boolean)
                : [],
            tags: post.tags
                ? post.tags.map((t: any) => t.tag).filter(Boolean)
                : [],
        }));

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        const response: BlogPostsResponse = {
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

    } catch (error) {
        console.error('Error in posts API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
