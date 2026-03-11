import { React, type AllWidgetProps } from "jimu-core";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import "../../styles/style.css";
import { type IMConfig } from "../config";
import FeatureLayer from "esri/layers/FeatureLayer";
import MyModalWindow1 from "./components/modals/modalWindow1";
import MyModalWindow2 from "./components/modals/modalWindow2";
import { fetchMaksAboneApi, fetchMaksEndeksApi } from "./services/maks.service";

const Widget = (props: AllWidgetProps<IMConfig>) => {
  // checking if the widget is linked a map widget
  const isConfigured = () => {
    return props.useMapWidgetIds && props.useMapWidgetIds.length > 0;
  };

  if (!isConfigured()) {
    // if not, show this message
    return <div>Waiting for map widget...</div>;
  }

  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView | null>( // active map
    null,
  );
  const [initialExtent, setInitialExtent] =
    React.useState<__esri.Extent | null>(null); // map’s starting position

  const [loading, setLoading] = React.useState(false); // loading state
  const [data, setData] = React.useState<any>(null); // data for first modal window
  const [data2, setData2] = React.useState<any>(null); // data for second modal window
  const [aboneNo, setAboneNo] = React.useState<string>(""); // abone no storage for direct calling

  const [isMainButtonDisabled, setIsMainButtonDisabled] =
    React.useState<boolean>(true); // first button
  const [isMainButton2Disabled, setIsMainButton2Disabled] =
    React.useState<boolean>(true); // second button
  const [isModal1Open, setIsModal1Open] = React.useState<boolean>(false);
  const [isModal2Open, setIsModal2Open] = React.useState<boolean>(false);
  const [clickedYapiId, setClickedYapiId] = React.useState<boolean>(false);

  const [icKapiNo, setIcKapiNo] = React.useState<string>("");

  const mapView = jimuMapView?.view as __esri.MapView | undefined;

  const layers = React.useMemo(
    // prevents recreating the layer on every render
    () => ({
      queryNumarataj: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/Adres_Diger/FeatureServer/0",
        outFields: ["*"],
      }),
      queryYapi: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/Adres_Diger/FeatureServer/2",
        outFields: ["*"],
      }),
    }),
    [],
  );

  // Runs when the map becomes available
  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      if (!initialExtent && jmv.view?.extent) {
        setInitialExtent(jmv.view.extent);
      }
    }
  };

  const handleClick = async (event: any) => {
    if (!mapView) return;
    localStorage.removeItem("binaMaks");
    localStorage.removeItem("aboneNo");
    localStorage.removeItem("ic_kapi_no");
    setIsMainButtonDisabled(true);

    const hitTest = await mapView.hitTest(event);
    if (!hitTest.results.length) return;

    // console.log(
    //   hitTest.results.map((r: any) => ({
    //     title: r.graphic?.layer?.title,
    //     id: r.graphic?.layer?.id,
    //     url: r.graphic?.layer?.url,
    //   })),
    // );

    // gets clicked NUMARATAJ feature
    const numaratajHit = hitTest.results.find(
      (r): r is __esri.GraphicHit =>
        r.type === "graphic" &&
        r.graphic.layer?.title.toUpperCase() === "NUMARATAJ",
    );

    if (!numaratajHit) return;

    const numaratajLayer = numaratajHit.graphic.layer as __esri.FeatureLayer;
    const objectId =
      numaratajHit.graphic.attributes[numaratajLayer.objectIdField];
    // console.log("numaratajLayer", numaratajLayer);

    /* =====================================================
     1️⃣ GET FULL CLICKED NUMARATAJ (ALL FIELDS)
  ===================================================== */
    const numQuery = numaratajLayer.createQuery();
    numQuery.objectIds = [objectId];
    numQuery.outFields = ["*"];
    numQuery.returnGeometry = true;
    await numaratajLayer.load();
    const numResult = await numaratajLayer.queryFeatures(numQuery);
    const clickedNumarataj = numResult.features[0]?.attributes;
    // console.log("clickedNumarataj", clickedNumarataj);
    /* =====================================================
     2️⃣ GET FULL CLICKED YAPI (RELATED OR BY OBJECTID)
  ===================================================== */

    const yapiId = clickedNumarataj?.yapiid;
    // const digeryapiid = clickedNumarataj?.digeryapiid;
    // const finalYapiId = yapiId || digeryapiid;
    //const yapiId = clickedNumarataj?.yapiid?.replace(/[{}]/g, "");

    let clickedYapi = null;

    if (yapiId) {
      setClickedYapiId(true);
      // console.log("yapiId raw:", yapiId);
      const yapiLayer = layers.queryYapi;

      const yapiQuery = yapiLayer.createQuery();

      yapiQuery.where = `id = '${yapiId}'`;
      // yapiQuery.where = "1=1";
      yapiQuery.outFields = ["*"];
      yapiQuery.returnGeometry = true;

      const yapiResult = await yapiLayer.queryFeatures(yapiQuery);
      // console.log(yapiResult);
      // console.log("FOUND FEATURES:", yapiResult.features);
      // console.log("length", yapiResult.features.length)
      // console.log(yapiResult.features[0]);

      clickedYapi = yapiResult.features[0]?.attributes;

      // console.log("🔥 FULL YAPI FROM yapiid:", clickedYapi);
      localStorage.setItem("binaMaks", clickedYapi.kimlikno);
      setIsMainButtonDisabled(false);
    } else {
      console.warn("No yapiid found inside clicked numarataj");
      setIsMainButtonDisabled(true);
    }
  };

  React.useEffect(() => {
    if (!mapView) return;
    const clickHandle = mapView.on("click", handleClick);

    return () => {
      clickHandle.remove();
    };
  }, [mapView]);

  const fetchMaksAbone = async () => {
    try {
      // console.log("CONFIG:", props.config);
      // console.log("USER CODE:", props.config.userCode);
      // console.log("USER PASS:", props.config.userPasswd);
      const data = await fetchMaksAboneApi(
        props.config.userCode || "47003",
        props.config.userPasswd || "9B8ECB1EE1E5E397B8E1E8D8F9E5D3CE9395B68F",
      );

      localStorage.setItem("aboneNo", data.aboneNo);

      setIcKapiNo(data.ic_kapi_no);
      setData(data);
      setIsModal1Open(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchMaksEndeks = async (aboneNo: string) => {
    try {
      const finalAboneNo = aboneNo || String(localStorage.getItem("aboneNo"));

      const data = await fetchMaksEndeksApi(
        finalAboneNo,
        props.config.userCode || "47003",
        props.config.userPasswd || "9B8ECB1EE1E5E397B8E1E8D8F9E5D3CE9395B68F",
      );

      setData2(data);
      setIsModal2Open(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="adres-widget">
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />
      {!mapView && <div className="map-not-loaded">Map view not loaded</div>}
      {loading && <div className="loader" />}
      <div className="controls">
        <button
          className="center-button"
          onClick={() => fetchMaksAbone()}
          disabled={isMainButtonDisabled}
          title={clickedYapiId ? "Abone listesi göster" : "Yapı bulunamadı"}
        >
          Abone listesi
        </button>
        <div className="info-text">
          Lütfen abone listesi için ekrandan numaratajı seçiniz.
        </div>
      </div>
      {/* <div>--- VE YA ---</div>
      <div>
        <input
          type="text"
          placeholder="Abone numarasını yazın..."
          value={aboneNo}
          onChange={(e) => {
            setIsMainButton2Disabled(false);
            setAboneNo(e.target.value);
          }}
        />
        <button
          onClick={() => fetchMaksEndeks(aboneNo)}
          disabled={isMainButton2Disabled}
        >
          Abone dökümü
        </button>
      </div> */}

      <MyModalWindow1
        isOpen={isModal1Open}
        onClose={() => {
          setIsModal1Open(false);
          setIsMainButtonDisabled(true);
        }}
        data={data}
        onRefresh={fetchMaksAbone}
        userCode={props.config.userCode}
        userPasswd={props.config.userPasswd}
      />

      <MyModalWindow2
        isOpen={isModal2Open}
        onClose={() => {
          setIsModal2Open(false);
          setIsMainButtonDisabled(true);
        }}
        data={data2}
        onRefresh={() => fetchMaksEndeks(null)}
        icKapiNo={icKapiNo}
      />
    </div>
  );
};

export default Widget;
