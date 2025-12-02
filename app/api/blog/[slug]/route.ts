import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PostWithRelations } from '@/types/blog';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = params.slug;

        // Fetch post with relations
        const { data: post, error } = await supabase
            .from('posts')
            .select(`
        *,
        categories:post_category_relations(
          category:post_categories(*)
        ),
        tags:post_tag_relations(
          tag:post_tags(*)
        )
      `)
            .eq('slug', slug)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .single();

        if (error || !post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Transform data
        const postWithRelations: PostWithRelations = {
            ...post,
            categories: post.categories
                ? post.categories.map((c: any) => c.category).filter(Boolean)
                : [],
            tags: post.tags
                ? post.tags.map((t: any) => t.tag).filter(Boolean)
                : [],
        };

        // Increment view count asynchronously (don't await)
        supabaseAdmin
            .from('posts')
            .update({ views: post.views + 1 })
            .eq('id', post.id)
            .then();

        // Fetch related posts (same category, exclude current post)
        let relatedPosts: PostWithRelations[] = [];

        if (postWithRelations.categories && postWithRelations.categories.length > 0) {
            const categoryId = postWithRelations.categories[0].id;

            // Get post IDs in same category
            const { data: relatedPostIds } = await supabase
                .from('post_category_relations')
                .select('post_id')
                .eq('category_id', categoryId)
                .neq('post_id', post.id)
                .limit(4);

            if (relatedPostIds && relatedPostIds.length > 0) {
                const { data: related } = await supabase
                    .from('posts')
                    .select(`
            *,
            categories:post_category_relations(
              category:post_categories(*)
            ),
            tags:post_tag_relations(
              tag:post_tags(*)
            )
          `)
                    .in('id', relatedPostIds.map(p => p.post_id))
                    .eq('status', 'published')
                    .lte('published_at', new Date().toISOString())
                    .limit(3);

                if (related) {
                    relatedPosts = related.map((p: any) => ({
                        ...p,
                        categories: p.categories
                            ? p.categories.map((c: any) => c.category).filter(Boolean)
                            : [],
                        tags: p.tags
                            ? p.tags.map((t: any) => t.tag).filter(Boolean)
                            : [],
                    }));
                }
            }
        }

        return NextResponse.json({
            post: postWithRelations,
            relatedPosts,
        });

    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
