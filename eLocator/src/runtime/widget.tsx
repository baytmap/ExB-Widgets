import { React, type AllWidgetProps } from "jimu-core";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Graphic from "@arcgis/core/Graphic";
import "../../styles/style.css";
import { type IMConfig } from "../config";
import { Point } from "esri/geometry";
import * as projection from "esri/geometry/projection";
import { set } from "seamless-immutable";

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
  const [lat, setLat] = React.useState(""); // latitude input
  const [lon, setLon] = React.useState(""); // longitude input
  const [mapType, setMapType] = React.useState("");

  // Runs when the map becomes available
  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      if (!initialExtent && jmv.view?.extent) {
        setInitialExtent(jmv.view.extent);
      }
    }
  };

  // helper for 5256 coordinate parsing
  const parseCoordinate = (coord: string): number => {
    //  Remove whitespaces
    let cleaned = coord.trim();
    // Remove thousands separators (dots)
    cleaned = coord.replace(/\./g, "");
    // Replace decimal comma with dot
    cleaned = cleaned.replace(/,/g, ".");
    return parseFloat(cleaned);
  };

  const locate = async (lat: string, lon: string, mapType: string) => {
    if (!jimuMapView) return;

    let point: Point;

    if (mapType === "5256") {
      const latitude = parseCoordinate(lat);
      const longitude = parseCoordinate(lon);

      point = new Point({
        latitude: latitude,
        longitude: longitude,
        spatialReference: { wkid: 5256 },
      });

      await projection.load();

      point = projection.project(point, { wkid: 5256 }) as Point;
    } else if (mapType === "4326") {
      const latitude = parseFloat(lat.trim().replace(",", "."));
      const longitude = parseFloat(lon.trim().replace(",", "."));

      point = new Point({
        latitude: latitude,
        longitude: longitude,
        spatialReference: { wkid: 4326 },
      });
    }

    const graphic = new Graphic({
      geometry: point,
      symbol: new SimpleMarkerSymbol({
        color: "red",
      }),
    });

    mapView?.graphics.removeAll();
    mapView?.graphics.add(graphic);
    mapView?.goTo({
      target: point,
      zoom: 15,
    });
  };

  const mapView = jimuMapView?.view as __esri.MapView | undefined;

  return (
    <div className="adres-widget">
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />
      {!mapView && <div className="map-not-loaded">Map view not loaded</div>}
      {loading && <div className="loader" />}
      <br />

      <select
        className="adres-select"
        onChange={(e) => setMapType(e.target.value)}
        value={mapType}
      >
        <option value="" disabled selected>
          Select Map Type
        </option>
        <option value="4326">WGS84 ( Coğrafi )</option>
        <option value="5256">TUREF TM36 ( ITRF )</option>
      </select>

      <input
        className="adres-select"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />

      <input
        className="adres-select"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
      />

      <div className="button-container">
        <button
          disabled={mapType === ""}
          className="adres-btn"
          onClick={() => locate(lat, lon, mapType)}
        >
          Locate
        </button>

        <button
          disabled={mapType === ""}
          className="adres-btn-reset"
          onClick={() => {
            setLat("");
            setLon("");
            setMapType("");
            mapView?.graphics.removeAll();
            if (initialExtent) {
              mapView?.goTo(initialExtent);
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Widget;
