import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Toggle this to show/hide the map on the Builders page
export const MAP_ENABLED = false;

export default function BuildersMap({ builders }) {
  const mappable = builders.filter(b => b.map_lat && b.map_lng);

  if (!MAP_ENABLED || mappable.length === 0) return null;

  return (
    <div className="mb-14">
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#6B6B6B" }}>
        Builder Locations
      </h2>
      <div style={{ height: 380, borderRadius: 4, overflow: "hidden", border: "1px solid #E0DDD8" }}>
        <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappable.map(b => (
            <Marker key={b.id} position={[b.map_lat, b.map_lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>{b.business_name || b.display_name}</strong>
                  {b.location && <p className="text-xs text-gray-500">{b.location}</p>}
                  <Link to={createPageUrl("BuilderProfile?id=" + b.id)} className="text-xs font-semibold underline" style={{ color: "#1B2B4B" }}>
                    View Profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}