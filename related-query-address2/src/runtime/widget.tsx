import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Query from "@arcgis/core/rest/support/Query";
import { React, type AllWidgetProps } from "jimu-core";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Graphic from "@arcgis/core/Graphic";
import RelationshipQuery from "@arcgis/core/rest/support/RelationshipQuery";
import "../../styles/style.css";
import { type IMConfig } from "../config";

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

  // data storage (dropdown values)
  const [ilce, setIlce] = React.useState<any[]>([]);
  const [mahalle, setMahalle] = React.useState<any[]>([]);
  const [yol, setYol] = React.useState<any[]>([]);
  const [numarataj, setNumarataj] = React.useState<any[]>([]);

  // geometry storage (for map drawing)
  const [geom, setGeom] = React.useState<any[]>([]); // ilce
  const [geom2, setGeom2] = React.useState<any[]>([]); // mahalle
  const [geom3, setGeom3] = React.useState<any[]>([]); // yol
  const [geom4, setGeom4] = React.useState<any[]>([]); // numarataj

  // selected values (indexes)
  const [selectedIlce, setSelectedIlce] = React.useState<number | null>(null);
  const [selectedMahalle, setSelectedMahalle] = React.useState<number | null>(
    null,
  );
  const [selectedYol, setSelectedYol] = React.useState<number | null>(null);
  const [selectedNumarataj, setSelectedNumarataj] = React.useState<
    number | null
  >(null);

  // for caching query results
  const [snc, setSnc] = React.useState<any>();
  const [snc2, setSnc2] = React.useState<any>();
  const [snc3, setSnc3] = React.useState<any>();
  const [snc4, setSnc4] = React.useState<any[]>([]);

  // Runs when the map becomes available
  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      if (!initialExtent && jmv.view?.extent) {
        setInitialExtent(jmv.view.extent);
      }
    }
  };

  // Fill symbol
  const symbolP = new SimpleFillSymbol({
    style: "solid",
    color: new Color([50, 173, 239, 0.25]),
  });

  // Line symbol
  const symbolL = new SimpleLineSymbol({
    style: "dot",
    color: new Color([255, 0, 0, 0.5]),
    width: 10,
  });

  // Marker symbol
  const symbolM = new SimpleMarkerSymbol({
    style: "square",
    size: 20,
    color: new Color([150, 170, 150, 0.75]),
  });

  // data sources, useMemo prevents unnecessary re-instantiation
  const layers = React.useMemo(
    () => ({
      queryTask: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/maks_adres_widget/FeatureServer/3",
      }),
      queryTaskYol: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/maks_adres_widget/FeatureServer/4",
      }),
      queryTaskYolOrtaHatYon: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/maks_adres_widget/FeatureServer/5",
      }),
      queryTaskYolOrtaHat: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/maks_adres_widget/FeatureServer/1",
      }),
      queryTaskMah: new FeatureLayer({
        url: "https://kentrehberi.kahramanmaras.bel.tr/server/rest/services/maks_adres_widget/FeatureServer/2",
      }),
    }),
    [],
  );

  const mapView = jimuMapView?.view as __esri.MapView | undefined;

  React.useEffect(() => {
    // Initial İlçe query (on map load)
    const query = new Query();
    query.where = "1=1";
    query.outSpatialReference = { wkid: 4326 };
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.orderByFields = ["ad"];

    setLoading(true);

    layers.queryTask.queryFeatures(query).then((result: any) => {
      setLoading(false);
      setSnc(result);

      if (!result.features.length) return;

      const ilceData: any[] = [];
      const geomData: any[] = [];

      result.features.map((res: any, index: any) => {
        ilceData[index] = res.attributes;
        geomData[index] = res.geometry;
      });

      ilceData.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
      setIlce(ilceData);
      setGeom(geomData);
    });
  }, [jimuMapView]);

  // clear helpers
  const ilceTemizle = () => {
    setSelectedIlce(null);
    setSelectedMahalle(null);
    setSelectedYol(null);
    setSelectedNumarataj(null);

    setMahalle([]);
    setYol([]);
    setNumarataj([]);
  };

  const mahalleTemizle = () => {
    setSelectedMahalle(null);
    setSelectedYol(null);
    setSelectedNumarataj(null);

    setYol([]);
    setNumarataj([]);
  };

  const yolTemizle = () => {
    setSelectedYol(null);
    setSelectedNumarataj(null);

    setNumarataj([]);
  };

  const numaratajTemizle = () => {
    setSelectedNumarataj(null);
  };

  const handleReset = () => {
    // remove all graphics
    mapView?.graphics.removeAll();

    // reset all dropdowns and dependent arrays
    ilceTemizle();

    // reset map to original extent
    if (initialExtent && mapView) {
      mapView.goTo(initialExtent);
    }
  };

  const loadIlce = async () => {
    setLoading(true);

    // reset dependent state
    mahalleTemizle();
    yolTemizle();
    numaratajTemizle();

    const ilceAttr = ilce[selectedIlce];
    const ilceGeom = geom[selectedIlce];

    // draw ilce polygon
    showResults(snc, selectedIlce, "p", mapView.graphics);

    // zoom
    if (!ilceGeom) return;

    if ("extent" in ilceGeom && ilceGeom.extent) {
      mapView.goTo(ilceGeom.extent);
    } else if (ilceGeom.type === "point") {
      mapView.goTo({ target: ilceGeom, zoom: 15 });
    } else {
      console.warn("Unknown geometry type for zoom:", ilceGeom);
    }

    // relationship query
    const relatedQuery = new RelationshipQuery({
      objectIds: [ilceAttr.objectid],
      outFields: ["*"],
      outSpatialReference: { wkid: 4326 },
      relationshipId: 4,
      returnGeometry: true,
    });

    try {
      const result = await layers.queryTask.queryRelatedFeatures(relatedQuery);
      const relatedResult = result[ilceAttr.objectid];
      setSnc2(relatedResult);
      const features = result[ilceAttr.objectid]?.features ?? [];

      // extract data
      // setMahalle(
      //   features
      //     .map((f: any) => f.attributes)
      //     .sort((a: any, b: any) => a.ad.localeCompare(b.ad, "tr")),
      // );
      // setGeom2(features.map((f: any) => f.geometry));
      const mahalleWithGeom = features.map((f: any) => ({
        attr: f.attributes,
        geom: f.geometry,
      }));

      // sort by attribute name
      mahalleWithGeom.sort((a, b) => a.attr.ad.localeCompare(b.attr.ad, "tr"));

      // separate back to arrays
      setMahalle(mahalleWithGeom.map((f) => f.attr));
      setGeom2(mahalleWithGeom.map((f) => f.geom));
    } finally {
      setLoading(false);
    }
  };

  // const handleIlceSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedIlce === null) return;
  //   await loadIlce();
  // };

  const loadNumarataj = () => {
    setLoading(false);

    if (selectedNumarataj !== null && snc4[selectedNumarataj]) {
      // showResults(snc4, selectedNumarataj, "m", mapView.graphics);
      mapView.graphics.removeAll();

      mapView.graphics.add(
        new Graphic({
          geometry: geom4[selectedNumarataj],
          attributes: numarataj[selectedNumarataj],
          symbol: symbolM,
        }),
      );
      const geo = geom4[selectedNumarataj];

      if (geo && mapView) {
        mapView.goTo({ target: geo, zoom: 20 });
      }
    }
  };

  // const handleNumaratajSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedNumarataj === null) return;
  //   loadNumarataj();
  // };

  const loadMahalle = async () => {
    setLoading(true);
    yolTemizle();

    const mahalleAttr = mahalle[selectedMahalle];
    const geo = geom2[selectedMahalle];

    // draw mahalle polygon
    // showResults(snc2, selectedMahalle, "p", mapView.graphics);
    mapView.graphics.removeAll();
    mapView.graphics.add(
      new Graphic({
        geometry: geom2[selectedMahalle],
        attributes: mahalle[selectedMahalle],
        symbol: symbolP,
      }),
    );

    // zoom
    const ex = geo?.extent;
    if (ex) await mapView.goTo(ex);

    // -------- STEP 1: Mahalle → YolOrtaHatYon --------
    const relatedQuery2 = new RelationshipQuery({
      objectIds: [mahalleAttr.objectid],
      outFields: ["*"],
      outSpatialReference: { wkid: 4326 },
      relationshipId: 3,
    });

    try {
      const result =
        await layers.queryTaskMah.queryRelatedFeatures(relatedQuery2);
      const features = result[mahalleAttr.objectid]?.features ?? [];

      if (!features.length) return;

      const yolOrtaHatYon: number[] = features.map(
        (f: any) => f.attributes.objectid,
      );

      // -------- STEP 2: YolOrtaHatYon → YolOrtaHat --------
      const relatedQuery3 = new RelationshipQuery({
        objectIds: yolOrtaHatYon,
        outFields: ["*"],
        outSpatialReference: { wkid: 4326 },
        relationshipId: 1,
        returnGeometry: true,
      });

      const result2 =
        await layers.queryTaskYolOrtaHatYon.queryRelatedFeatures(relatedQuery3);

      let yolOrtaHat: number[] = [];

      Object.values(result2).forEach((res: any) => {
        res.features.forEach((f: any) => {
          yolOrtaHat.push(f.attributes.objectid);
        });
      });

      // deduplicating
      yolOrtaHat = [...new Set(yolOrtaHat)];

      // -------- STEP 3: YolOrtaHat → Yol --------
      const relatedQuery6 = new RelationshipQuery({
        objectIds: yolOrtaHat,
        outFields: ["*"],
        outSpatialReference: { wkid: 4326 },
        relationshipId: 2,
      });

      const result3 =
        await layers.queryTaskYolOrtaHat.queryRelatedFeatures(relatedQuery6);

      let yolLocal: any[] = [];

      Object.values(result3).forEach((res: any) => {
        res.features.forEach((f: any) => {
          yolLocal.push(f.attributes);
        });
      });

      // deduplicating Yol by objectid
      yolLocal = yolLocal.filter(
        (a, i, arr) => arr.findIndex((s) => s.objectid === a.objectid) === i,
      );

      // map tip → text
      yolLocal = yolLocal.map((opt) => ({
        ...opt,
        tip:
          opt.tip === 1
            ? "SOKAK"
            : opt.tip === 2
              ? "CADDE"
              : opt.tip === 3
                ? "BULVAR"
                : opt.tip === 4
                  ? "MEYDAN"
                  : opt.tip === 5
                    ? "KÜME EVLER"
                    : opt.tip === 6
                      ? "KARAYOLU"
                      : opt.tip === 7
                        ? "OTOYOL"
                        : opt.tip === 8
                          ? "KÖY BAĞLANTI YOLU"
                          : opt.tip,
      }));

      yolLocal.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
      setYol(yolLocal);
    } finally {
      setLoading(false);
    }
  };

  // const handleMahalleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedMahalle === null) return;
  //   await loadMahalle();
  // };

  const loadYol = async () => {
    setLoading(true);
    numaratajTemizle();

    const yolAttr = yol[selectedYol];

    const relatedQuery7 = new RelationshipQuery({
      objectIds: [yolAttr.objectid],
      outFields: ["*"],
      outSpatialReference: { wkid: 4326 },
      relationshipId: 2,
      returnGeometry: true,
    });

    try {
      // -------- STEP 1: Yol → YolOrtaHat --------
      const result =
        await layers.queryTaskYol.queryRelatedFeatures(relatedQuery7);
      const yolFeatures = result[yolAttr.objectid]?.features ?? [];

      setSnc3({ features: yolFeatures });

      // draw lines
      mapView.graphics.removeAll();
      yolFeatures.forEach((f: any) => {
        mapView.graphics.add(
          new Graphic({
            geometry: f.geometry,
            attributes: f.attributes,
            symbol: symbolL,
          }),
        );
      });

      // collect IDs + geometries
      const yolid: number[] = [];
      const geom3Local: any[] = [];

      yolFeatures.forEach((f: any, i: any) => {
        yolid[i] = f.attributes.objectid;
        geom3Local[i] = f.geometry;
      });

      setGeom3(geom3Local);

      // zoom
      const ex = geom3Local[0]?.extent?.expand(5);
      if (ex) await mapView.goTo(ex);

      // -------- STEP 2: YolOrtaHat → YolOrtaHatYon --------
      const relatedQuery4 = new RelationshipQuery({
        objectIds: yolid,
        outFields: ["*"],
        outSpatialReference: { wkid: 4326 },
        relationshipId: 1,
        returnGeometry: true,
      });

      const result2 =
        await layers.queryTaskYolOrtaHat.queryRelatedFeatures(relatedQuery4);

      const yolOrtaHatYon: number[] = [];
      let say = 0;

      Object.values(result2).forEach((res: any) => {
        res.features.forEach((f: any) => {
          yolOrtaHatYon[say++] = f.attributes.objectid;
        });
      });

      // -------- STEP 3: YolOrtaHatYon → Numarataj --------
      const relatedQuery5 = new RelationshipQuery({
        objectIds: yolOrtaHatYon,
        outFields: ["*"],
        outSpatialReference: { wkid: 4326 },
        relationshipId: 0,
        returnGeometry: true,
      });

      const result3 =
        await layers.queryTaskYolOrtaHatYon.queryRelatedFeatures(relatedQuery5);

      const numaratajLocal: any[] = [];
      const geom4Local: any[] = [];
      const snc4Local: any[] = [];
      let say2 = 0;

      Object.values(result3).forEach((res: any) => {
        res.features?.forEach((f: any) => {
          numaratajLocal[say2] = f.attributes;
          geom4Local[say2] = f.geometry;
          snc4Local[say2] = f;
          say2++;
        });
      });

      // numaratajLocal.sort((a, b) => a.kapino.localeCompare(b.kapino, "tr"));
      // setNumarataj(numaratajLocal);
      // setGeom4(geom4Local);
      // setSnc4(snc4Local);
      const numaratajCombined = [];

      Object.values(result3).forEach((res: any) => {
        res.features?.forEach((f: any) => {
          numaratajCombined.push({
            attr: f.attributes,
            geom: f.geometry,
            feature: f,
          });
        });
      });

      numaratajCombined.sort((a, b) =>
        a.attr.kapino.localeCompare(b.attr.kapino, "tr"),
      );
      
      setNumarataj(numaratajCombined.map((x) => x.attr));
      setGeom4(numaratajCombined.map((x) => x.geom));
      setSnc4(numaratajCombined.map((x) => x.feature));
    } finally {
      setLoading(false);
    }
  };

  // const handleYolSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (selectedYol === null) return;
  //   await loadYol();
  // };

  // for map drawing
  const showResults = (
    featureSet: any,
    i: number,
    st: "p" | "l" | "m",
    graphicsLayer: any,
  ) => {
    let symbol: SimpleFillSymbol | SimpleLineSymbol | SimpleMarkerSymbol;

    if (st === "p") {
      symbol = symbolP;
      graphicsLayer.removeAll(); // clear all previous graphics

      const resultFeature = featureSet.features[i];
      const graphic = new Graphic({
        geometry: resultFeature.geometry,
        attributes: resultFeature.attributes,
        symbol: symbol,
      });

      graphicsLayer.add(graphic);
    } else if (st === "l") {
      symbol = symbolL;
      graphicsLayer.removeAll();

      featureSet.features.forEach((feature: any) => {
        const graphicL = new Graphic({
          geometry: feature.geometry,
          attributes: feature.attributes,
          symbol: symbol,
        });
        graphicsLayer.add(graphicL);
      });
    } else if (st === "m") {
      symbol = symbolM;
      graphicsLayer.removeAll();

      const resultFeature = featureSet[i];
      const graphic = new Graphic({
        geometry: resultFeature.geometry,
        attributes: resultFeature.attributes,
        symbol: symbol,
      });

      graphicsLayer.add(graphic);
    }
  };

  // to zoom in without clicking the GIT button
  // React.useEffect(() => {
  //   if (selectedIlce == null) return;
  //   (async () => {
  //     await loadIlce();
  //   })();
  // }, [selectedIlce]);

  // React.useEffect(() => {
  //   if (selectedYol == null) return;
  //   (async () => {
  //     await loadYol();
  //   })();
  // }, [selectedYol]);

  // React.useEffect(() => {
  //   if (selectedMahalle == null) return;
  //   (async () => {
  //     await loadMahalle();
  //   })();
  // }, [selectedMahalle]);

  React.useEffect(() => {
    if (selectedIlce != null) loadIlce();
  }, [selectedIlce]);

  React.useEffect(() => {
    if (selectedYol != null) loadYol();
  }, [selectedYol]);

  React.useEffect(() => {
    if (selectedMahalle != null) loadMahalle();
  }, [selectedMahalle]);

  React.useEffect(() => {
    if (selectedNumarataj != null) loadNumarataj();
  }, [selectedNumarataj]);

  return (
    <div className="adres-widget">
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />
      {!mapView && <div className="map-not-loaded">Map view not loaded</div>}
      {loading && <div className="loader" />}
      <br />
      <form className="pure-form">
        <select
          className="adres-select"
          value={selectedIlce ?? ""}
          onChange={(e) => setSelectedIlce(Number(e.target.value))}
        >
          <option value="">İlçe Seç</option>
          {ilce.map((ilceItem, index) => (
            <option key={index} value={index}>
              {ilceItem.ad}
            </option>
          ))}
        </select>
        {/* <button type="submit" className="adres-btn">
          GİT
        </button> */}
      </form>
      <br />
      <form className="pure-form2">
        <select
          className="adres-select"
          value={selectedMahalle ?? ""}
          onChange={(e) => setSelectedMahalle(Number(e.target.value))}
        >
          <option value="">Mahalle Seç</option>
          {mahalle.map((mahalleItem, index) => (
            <option key={index} value={index}>
              {mahalleItem.ad}
            </option>
          ))}
        </select>
        {/* <button type="submit" className="adres-btn">
          GİT
        </button> */}
      </form>
      <br />
      <form className="pure-form3">
        <select
          className="adres-select"
          value={selectedYol ?? ""}
          onChange={(e) => setSelectedYol(Number(e.target.value))}
        >
          <option value="">Yol Seç</option>

          {yol.map((yolItem, index) => (
            <option key={index} value={index}>
              {yolItem.ad} + {yolItem.tip}
            </option>
          ))}
        </select>
        {/* <button type="submit" className="adres-btn">
          GİT
        </button> */}
      </form>
      <br />
      <form className="pure-form4">
        <select
          className="adres-select"
          value={selectedNumarataj ?? ""}
          onChange={(e) => setSelectedNumarataj(Number(e.target.value))}
        >
          <option value="">Numarataj Seç</option>
          {numarataj.map((numaratajItem, index) => (
            <option key={index} value={index}>
              {numaratajItem.kapino}
            </option>
          ))}
        </select>
        {/* <button type="submit" className="adres-btn">
          GİT
        </button> */}
      </form>
      <br />
      <form className="pure-form5">
        <button
          type="button"
          className="adres-btn adres-btn-reset"
          onClick={handleReset}
        >
          Seçimi Temizle
        </button>
      </form>
    </div>
  );
};

export default Widget;
