import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { slugify, generateSlug } from '@/lib/slugify';
import { calculateReadingTime } from '@/lib/readingTime';

// Create Supabase client with service role for bypassing RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate slug  if not provided
        let slug = body.slug ? slugify(body.slug) : slugify(body.title);

        // Check if slug exists and make it unique
        const { data: existingPosts } = await supabaseAdmin
            .from('posts')
            .select('slug')
            .eq('slug', slug);

        if (existingPosts && existingPosts.length > 0) {
            // Slug exists, add number suffix
            let counter = 1;
            let newSlug = `${slug}-${counter}`;

            while (true) {
                const { data: check } = await supabaseAdmin
                    .from('posts')
                    .select('slug')
                    .eq('slug', newSlug);

                if (!check || check.length === 0) {
                    slug = newSlug;
                    break;
                }

                counter++;
                newSlug = `${slug}-${counter}`;
            }
        }

        // Calculate reading time
        const readingTime = calculateReadingTime(body.content);

        // Prepare post data
        const postData = {
            title: body.title,
            slug,
            content: body.content,
            excerpt: body.excerpt || null,
            featured_image: body.featured_image || null,
            featured_image_alt: body.featured_image_alt || null,
            author_name: body.author_name || 'Admin',
            author_avatar: body.author_avatar || null,
            author_bio: body.author_bio || null,
            status: body.status || 'published',
            visibility: body.visibility || 'public',
            meta_description: body.meta_description || body.excerpt || null,
            meta_keywords: body.meta_keywords || null,
            og_image: body.og_image || body.featured_image || null,
            reading_time_minutes: readingTime,
            scheduled_for: body.scheduled_for || null,
            is_featured: body.is_featured || false,
            allow_comments: body.allow_comments !== false,
            published_at: body.status === 'published' ? new Date().toISOString() : null,
        };

        // Insert post
        const { data: post, error: postError } = await supabaseAdmin
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (postError) {
            console.error('Error creating post:', postError);
            return NextResponse.json(
                { error: 'Failed to create post', details: postError.message },
                { status: 500 }
            );
        }

        // Handle categories
        if (body.categories && Array.isArray(body.categories)) {
            for (const categoryName of body.categories) {
                const categorySlug = slugify(categoryName);

                // Check if category exists
                let { data: category } = await supabaseAdmin
                    .from('post_categories')
                    .select('id')
                    .eq('slug', categorySlug)
                    .single();

                // Create category if doesn't exist
                if (!category) {
                    const { data: newCategory } = await supabaseAdmin
                        .from('post_categories')
                        .insert([{ name: categoryName, slug: categorySlug }])
                        .select()
                        .single();

                    category = newCategory;
                }

                // Link post to category
                if (category) {
                    await supabaseAdmin
                        .from('post_category_relations')
                        .insert([{ post_id: post.id, category_id: category.id }]);
                }
            }
        }

        // Handle tags
        if (body.tags && Array.isArray(body.tags)) {
            for (const tagName of body.tags) {
                const tagSlug = slugify(tagName);

                // Check if tag exists
                let { data: tag } = await supabaseAdmin
                    .from('post_tags')
                    .select('id')
                    .eq('slug', tagSlug)
                    .single();

                // Create tag if doesn't exist
                if (!tag) {
                    const { data: newTag } = await supabaseAdmin
                        .from('post_tags')
                        .insert([{ name: tagName, slug: tagSlug }])
                        .select()
                        .single();

                    tag = newTag;
                }

                // Link post to tag
                if (tag) {
                    await supabaseAdmin
                        .from('post_tag_relations')
                        .insert([{ post_id: post.id, tag_id: tag.id }]);
                }
            }
        }

        // Get the base URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        const postUrl = `${baseUrl}/blog/${post.slug}`;

        // Trigger social media webhook (if configured)
        const socialWebhook = process.env.N8N_SOCIAL_WEBHOOK_URL;
        if (socialWebhook && post.status === 'published') {
            fetch(socialWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: post.title,
                    excerpt: post.excerpt || body.excerpt,
                    url: postUrl,
                    featured_image: post.featured_image
                })
            }).catch(err => console.error('Social webhook failed:', err));
        }

        // Return success response
        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                url: postUrl,
                status: post.status,
                published_at: post.published_at,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Error in blog creation:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
