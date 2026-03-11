export type PaginationProps = {
  currentPage: number;
  startIndex: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};