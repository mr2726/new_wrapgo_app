import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken("pk.eyJ1Ijoid3JhcGdvMSIsImEiOiJjbW5kaXZ1azAxYTZ3MnFxd3A4MWF0NHV2In0.BRikUTLb_Z45crHjlh2bqg");

export default function Map() {
  return (
    <Mapbox.MapView style={{ flex: 1 }}>
      <Mapbox.Camera
        zoomLevel={14}
        centerCoordinate={[44.5152, 40.1872]}
      />
    </Mapbox.MapView>
  );
}