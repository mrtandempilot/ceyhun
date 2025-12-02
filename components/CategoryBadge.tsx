import Link from 'next/link';
import { PostCategory } from '@/types/blog';

interface CategoryBadgeProps {
    category: PostCategory;
    size?: 'sm' | 'md' | 'lg';
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
    };

    return (
        <Link
            href={`/blog/category/${category.slug}`}
            className={`inline-block rounded-full font-medium transition-opacity hover:opacity-80 ${sizeClasses[size]}`}
            style={{
                backgroundColor: category.color,
                color: '#ffffff',
            }}
        >
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
        </Link>
    );
}
