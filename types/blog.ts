// Blog system TypeScript types

export interface PostCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    icon: string | null;
    parent_id: string | null;
    post_count: number;
    created_at: string;
    updated_at: string;
}

export interface PostTag {
    id: string;
    name: string;
    slug: string;
    post_count: number;
    created_at: string;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    featured_image_alt: string | null;
    author_id: string | null;
    author_name: string;
    author_avatar: string | null;
    author_bio: string | null;
    status: 'draft' | 'published' | 'scheduled';
    visibility: 'public' | 'private' | 'password';
    password: string | null;
    published_at: string | null;
    scheduled_for: string | null;
    meta_description: string | null;
    meta_keywords: string[] | null;
    og_image: string | null;
    canonical_url: string | null;
    views: number;
    reading_time_minutes: number | null;
    allow_comments: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface PostWithRelations extends Post {
    categories?: PostCategory[];
    tags?: PostTag[];
    comments_count?: number;
}

export interface PostComment {
    id: string;
    post_id: string;
    parent_id: string | null;
    author_name: string;
    author_email: string;
    author_website: string | null;
    author_ip: string | null;
    content: string;
    status: 'pending' | 'approved' | 'spam' | 'rejected';
    created_at: string;
    updated_at: string;
    replies?: PostComment[];
}

// API Request/Response types

export interface CreatePostRequest {
    title: string;
    content: string;
    slug?: string;
    excerpt?: string;
    featured_image?: string;
    featured_image_alt?: string;
    author_name?: string;
    author_avatar?: string;
    author_bio?: string;
    meta_description?: string;
    tags?: string[];
    categories?: string[];
    status?: 'draft' | 'published' | 'scheduled';
    scheduled_for?: string;
    is_featured?: boolean;
    allow_comments?: boolean;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
    id: string;
}

export interface BlogPostsResponse {
    posts: PostWithRelations[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface BlogFilters {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    status?: 'draft' | 'published' | 'scheduled';
    search?: string;
    sort?: 'latest' | 'popular' | 'oldest';
    featured?: boolean;
}
