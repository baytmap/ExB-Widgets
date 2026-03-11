import React from "react";
import { PaginationProps } from "../types/maks.pagination.types";

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  startIndex,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages == 0) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between", // 👈 LEFT + RIGHT
        alignItems: "center",
        marginTop: "15px",
      }}
    >
      {/* LEFT SIDE — LABEL */}
      <div style={{ fontSize: "14px", color: "#555" }}>
        {totalItems} kayıttan {startIndex + 1}-
        {Math.min(startIndex + itemsPerPage, totalItems)} gösteriliyor.
      </div>

      {/* RIGHT SIDE — BUTTONS */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Geri
        </button>

        <span>
          Sayfa {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          İleri
        </button>
      </div>
    </div>
  );
};

export default Pagination;
