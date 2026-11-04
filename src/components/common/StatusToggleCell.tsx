import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface StatusToggleCellProps {
  status: boolean;
  onCheckedChange: (checked: boolean) => void;
}

// Renders the active/inactive switch + badge used in list table columns.
// The caller decides what happens on toggle (e.g. opening a confirm dialog)
// — this component is presentational only.
export default function StatusToggleCell({
  status,
  onCheckedChange,
}: StatusToggleCellProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch checked={status} onCheckedChange={onCheckedChange} />
      <Badge variant={status ? "default" : "secondary"}>
        {status ? "active" : "inactive"}
      </Badge>
    </div>
  );
}
