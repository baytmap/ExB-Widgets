import React from "react";
import { MyModalProps2 } from "../../types/maks.types";
import Button from "../Buttons";
import SearchInput from "../SearchInput";
import Pagination from "../Pagination";
import { exportToExcel, exportToPDF2 } from "../../services/output.service";

const MyModalWindow2: React.FC<MyModalProps2> = ({
  isOpen,
  onClose,
  data,
  onRefresh,
  icKapiNo,
}) => {
  if (!isOpen) return null;

  const [searchValue, setSearchValue] = React.useState<string>(""); // for search input

  const [filteredData, setFilteredData] = React.useState(data?.value || []);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const hasData = filteredData.length > 0;
  const pdfButtonDisabled = !hasData;
  const excelButtonDisabled = !hasData;

  React.useEffect(() => {
    if (!data?.value) {
      setFilteredData([]);
      return;
    }

    const filtered = data.value.filter((item) =>
      item.abone_no.toString().includes(searchValue),
    );

    setFilteredData(filtered);
  }, [data, searchValue]);

  React.useEffect(() => {
    setCurrentPage(1); // resets page on search
  }, [searchValue]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={firstLine}>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              Abone Döküm Listesi
            </div>

            <button onClick={onClose} style={closeButtonStyle}>
              <calcite-icon icon="x" />
            </button>
          </div>
        </div>

        <div style={firstLine}>
          <Button
            onClick={onRefresh}
            disabled={false}
            styles={refreshButtonStyle}
          >
            <calcite-icon icon="refresh" />
          </Button>

          <SearchInput
            value={searchValue}
            placeholder="Abone No ara..."
            onChange={(value) => setSearchValue(value)}
          />
        </div>

        <div style={{ marginTop: "15px", overflowX: "auto" }}>
          {data && data.sonucKodu === 1 && data.value.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerStyleTable}>Abone No</th>
                  <th style={headerStyleTable}>Okuma Tarihi</th>
                  <th style={headerStyleTable}>İç Kapı No</th>
                  <th style={headerStyleTable}>Sayaç Durumu</th>
                  <th style={headerStyleTable}>Dönem</th>
                  <th style={headerStyleTable}>Tüketim (m³)</th>
                  <th style={headerStyleTable}>Tutar (TL)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={`${item.abone_no}-${item.donem}-${item.okuma_tarihi}`}>
                    <td style={thTdStyle}>{item.abone_no}</td>
                    <td style={thTdStyle}>{item.okuma_tarihi}</td>
                    <td style={thTdStyle}>{icKapiNo}</td>
                    <td style={thTdStyle}>{item.sayac_durum}</td>
                    <td style={thTdStyle}>{item.donem}</td>
                    <td style={thTdStyle}>{item.tuk_m3}</td>
                    <td style={thTdStyle}>{item.toplam_tutar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={noDataStyle}>Eşleşen kayıt bulunamadı</div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          startIndex={startIndex}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
        <div style={buttonRowStyle}>
          <Button
            onClick={async () => {
              await exportToPDF2(filteredData, icKapiNo);
            }}
            disabled={pdfButtonDisabled}
            styles={pdfButtonStyle}
          >
            <calcite-icon icon="file-pdf" />
            PDF
          </Button>

          <Button
            onClick={() => {
              exportToExcel(filteredData);
            }}
            disabled={excelButtonDisabled}
            styles={excelButtonStyle}
          >
            <calcite-icon icon="file-excel" />
            Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle: React.CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  width: "700px",
  maxWidth: "1200px",
  position: "relative",
  marginTop: "250px",
  marginRight: "800px",
};

const headerStyle: React.CSSProperties = {
  background: "#1e3a8a",
  color: "white",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "5px",
};

const firstLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const closeButtonStyle: React.CSSProperties = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};

const refreshButtonStyle: React.CSSProperties = {
  background: "white",
  color: "black",
  border: "1px solid #d1d5db",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thTdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  textAlign: "left",
  padding: "8px",
};

const headerStyleTable: React.CSSProperties = {
  ...thTdStyle,
  background: "#f3f4f6",
  fontWeight: "bold",
};
tableStyle["td"] = {
  border: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

tableStyle["th"] = {
  border: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
  background: "#f3f4f6",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end",
  marginTop: "5px",
};

const pdfButtonStyle: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  padding: "3px",
};

const excelButtonStyle: React.CSSProperties = {
  background: "#16a34a",
  color: "white",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  padding: "3px",
};

const noDataStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "600",
  padding: "30px 0",
  color: "#555",
};

export default MyModalWindow2;
