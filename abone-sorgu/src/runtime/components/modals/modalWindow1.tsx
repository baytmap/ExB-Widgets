import React from "react";
import type { MyModalProps } from "../../types/maks.types";
import Button from "../Buttons";
import SearchInput from "../SearchInput";
import MyModalWindow2 from "./modalWindow2";
import Pagination from "../Pagination";
import { fetchMaksEndeksApi } from "../../services/maks.service";
import { exportToExcel, exportToPDF1 } from "../../services/output.service";

const MyModalWindow1: React.FC<MyModalProps> = ({
  isOpen,
  onClose,
  data,
  onRefresh,
  userCode,
  userPasswd,
}) => {
  if (!isOpen) return null;

  const [selectedAbone, setSelectedAbone] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [data2, setData2] = React.useState<any | null>(null); // for second modal window
  const [searchValue, setSearchValue] = React.useState<string>(""); // for search input

  const [icKapiNo, setIcKapiNo] = React.useState<string>("");

  const [filteredData, setFilteredData] = React.useState(data?.value || []);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const [aboneDokumunuGosterDisabled, setAboneDokumunuGosterDisabled] =
    React.useState<boolean>(true);

  const hasData = filteredData.length > 0;
  const pdfButtonDisabled = !hasData;
  const excelButtonDisabled = !hasData;

  const selectAbone = (item: any) => {
    setSelectedAbone(String(item.abone_no));
    setAboneDokumunuGosterDisabled(false);
    setIcKapiNo(item.ic_kapi_no);
    localStorage.setItem("aboneNo", item.abone_no);
  };

  const fetchMaksEndeks = async (aboneNo: string) => {
    try {
      const finalAboneNo = aboneNo || String(localStorage.getItem("aboneNo"));
      const data = await fetchMaksEndeksApi(
        finalAboneNo,
        userCode || "47003",
        userPasswd || "9B8ECB1EE1E5E397B8E1E8D8F9E5D3CE9395B68F",
      );

      setModalOpen(true);
      setData2(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
              Abone Listesi
            </div>

            <button onClick={onClose} style={closeButtonStyle}>
              ✕
            </button>
          </div>
        </div>

        <div style={firstLine}>
          <Button
            onClick={() => {
              setSelectedAbone(null);
              setAboneDokumunuGosterDisabled(true);
              onRefresh();
            }}
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
                  <th style={headerStyleTable}>#</th>
                  <th style={headerStyleTable}>Abone No</th>
                  <th style={headerStyleTable}>Adı</th>
                  <th style={headerStyleTable}>Soyadı</th>
                  <th style={headerStyleTable}>Dış Kapı No</th>
                  <th style={headerStyleTable}>İç Kapı No</th>
                  <th style={headerStyleTable}>Cadde/Sokak</th>
                  <th style={headerStyleTable}>Mahalle</th>
                  <th style={headerStyleTable}>İlçe</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.abone_no}>
                    <td style={thTdStyle}>
                      <input
                        type="radio"
                        name="selectedAbone"
                        checked={selectedAbone === item.abone_no}
                        onChange={() => selectAbone(item)}
                      />
                    </td>
                    <td style={thTdStyle}>{item.abone_no}</td>
                    <td style={thTdStyle}>{item.adi}</td>
                    <td style={thTdStyle}>{item.soyadi}</td>
                    <td style={thTdStyle}>{item.dis_kapi_no}</td>
                    <td style={thTdStyle}>{item.ic_kapi_no}</td>
                    <td style={thTdStyle}>{item.sokak}</td>
                    <td style={thTdStyle}>{item.mahalle}</td>
                    <td style={thTdStyle}>{item.ilce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={noDataStyle}>Abone bilgisi bulunamadı</div>
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
            onClick={() => {
              fetchMaksEndeks(null);
            }}
            disabled={aboneDokumunuGosterDisabled}
            styles={aboneButtonStyle}
          >
            <calcite-icon icon="globe" />
            Abone Dökümünü Göster
          </Button>
          <Button
            onClick={async () => {
              await exportToPDF1(filteredData);
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
      <MyModalWindow2
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data2}
        onRefresh={() => fetchMaksEndeks(null)}
        icKapiNo={icKapiNo}
      />
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
  marginTop: "150px",
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

const aboneButtonStyle: React.CSSProperties = {
  background: "#1e40af",
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

export default MyModalWindow1;
