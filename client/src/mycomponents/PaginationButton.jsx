import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { FIRST_PAGE, getQueryString } from '@/utils/utils';
import { PaginationEllipsis } from '@/components/ui/pagination'
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationButton = ({ totalPages }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());
    const page = parseInt(queryParams.page) || FIRST_PAGE;

    const handlePagination = (page) => {
        const navQueryParams = {
            ...queryParams,
            page,
        };
        navigate(getQueryString(navQueryParams))
    }

    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

    return (
        <div className='flex'>
            <div className="mt-6 flex space-x-1 mx-auto">
                {/* Previous Button */}
                {!isFirstPage &&
                    <Button variant="outline" onClick={() => handlePagination(page - 1)}>
                        <ChevronLeft />
                        Previous
                    </Button>
                }

                {/* First page link, show if not the first page */}
                {page > FIRST_PAGE && (
                    <>
                        <Button variant="outline" onClick={() => handlePagination(FIRST_PAGE)}>
                            1
                        </Button>
                        {page > FIRST_PAGE + 1 && <PaginationEllipsis />}
                    </>
                )}

                {/* Previous page link */}
                {page > FIRST_PAGE + 1 && (
                    <Button variant="outline" onClick={() => handlePagination(page - 1)}>
                        {page - 1}
                    </Button>
                )}

                {/* Current page */}
                <Button variant="outline" onClick={() => null} className="bg-blue-600 text-white">
                    {page}
                </Button>

                {/* Next page link */}
                {page < totalPages && (
                    <Button variant="outline" onClick={() => handlePagination(page + 1)}>
                        {page + 1}
                    </Button>
                )}

                {/* Last page link, show if not the last page */}
                {page < totalPages - 1 && (
                    <>
                        {page + 1 < totalPages - 1 && <PaginationEllipsis />}
                        <Button variant="outline" onClick={() => handlePagination(totalPages)}>
                            {totalPages}
                        </Button>
                    </>
                )}

                {/* Next Button */}
                {!isLastPage &&
                    <Button variant="outline" onClick={() => handlePagination(page + 1)}>
                        Next
                        <ChevronRight />
                    </Button>
                }
            </div>
        </div>
    );
}

export default React.memo(PaginationButton);