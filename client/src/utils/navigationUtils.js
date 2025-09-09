import { getQueryString } from "./utils";

export const handleMaxPageCrossed = (totalPages, searchQuery, page) => {
    if (totalPages == 0 && page == 1) return;
    else if (totalPages < page) {
        handlePaginationToFirstPage(searchQuery)
    }
}

export const handlePaginationToFirstPage = (searchQuery) => {
    window.location.href = getQueryString({ search: searchQuery, page: 1 });
}

export const handleErrorPage = () => {
    window.location.href = "/error";
}