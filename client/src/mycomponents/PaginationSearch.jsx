import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Search } from "lucide-react"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FIRST_PAGE, getQueryString } from '@/utils/utils';

const PaginationSearch = ({ moduleName }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());
    const [search, setSearch] = useState(queryParams.search || '');

    const handleSearch = (e) => {
        e.preventDefault();

        const navQueryParams = {
            ...queryParams,
            // ...(search && { search }),
            search,
            page: FIRST_PAGE,
        };
        navigate(getQueryString(navQueryParams))
    }

    return (
        <form className="flex w-full md:w-1/2 mb-6 mx-auto" onSubmit={handleSearch}>
            <Input
                type="text"
                placeholder={`Search ${moduleName}...`}
                className="px-4 py-2 border border-gray-300 -md w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="rounded-l-none bg-blue-600"><Search /></Button>
        </form>
    )
}

export default React.memo(PaginationSearch);