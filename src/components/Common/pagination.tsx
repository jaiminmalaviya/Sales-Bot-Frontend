import React from "react";
import {
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationContent,
  Pagination,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderPaginationItems = () => {
    const items = [];

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, totalPages); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            className={`text-xs ${i === currentPage ? "text-black dark:text-white" : ""}`}
            id={`pagination-button-page-${i}`}
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination className="text-xs">
      <PaginationContent className="text-gray-500 text-xs">
        <PaginationItem>
          <PaginationPrevious
            className="text-xs"
            onClick={() => currentPage !== 1 && onPageChange(currentPage - 1)}
          />
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <PaginationNext
            className="text-xs"
            onClick={() => currentPage !== totalPages && onPageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
