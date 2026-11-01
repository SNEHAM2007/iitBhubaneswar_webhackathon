
import {
  X,
  DoorOpen,
  Users,
  MapPin,
  Building2,
  Monitor,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function RoomDetails({ room, onClose }) {
  if (!room) return null;

  const features = [
    { label: "Projector", enabled: room.hasProjector },
    { label: "Computer Facility", enabled: room.hasComputer },
    { label: "Smart Board", enabled: room.hasSmartBoard },
    { label: "Air Conditioning", enabled: room.hasAC },
  ];

  const details = [
    {
      label: "Room Name",
      value: room.name || room.roomNumber || "Not specified",
      icon: DoorOpen,
    },
    {
      label: "Room Type",
      value: room.type || room.category || "Not specified",
      icon: Building2,
    },
    {
      label: "Capacity",
      value: room.capacity ?? "Not specified",
      icon: Users,
    },
    {
      label: "Location",
      value: room.building || room.location || "Not specified",
      icon: MapPin,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-details-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="room-details-title" className="text-xl font-bold text-slate-900">
              Room Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete room information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close room details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {details.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
            <Monitor size={18} />
            Room Facilities
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm"
              >
                {feature.enabled ? (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                ) : (
                  <XCircle size={17} className="text-slate-400" />
                )}
                <span className="text-slate-700">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default RoomDetails;
