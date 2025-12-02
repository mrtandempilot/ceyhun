'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string;
}

export default function BlogPagination({ currentPage, totalPages, basePath = '/blog' }: BlogPaginationProps) {
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const buildUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) {
            params.set('page', page.toString());
        } else {
            params.delete('page');
        }
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex logic for ellipsis
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={buildUrl(currentPage - 1)}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            ) : (
                <button
                    disabled
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Page Numbers */}
            {pageNumbers.map((pageNum, idx) => {
                if (pageNum === '...') {
                    return (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                            ...
                        </span>
                    );
                }

                const page = pageNum as number;
                const isActive = page === currentPage;

                return (
                    <Link
                        key={page}
                        href={buildUrl(page)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${isActive
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {page}
                    </Link>
                );
            })}

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={buildUrl(currentPage + 1)}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            ) : (
                <button
                    disabled
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
}
