import { SERVICE_ICONS } from "../../utils/serviceIcons";

export function ServiceIcon({ icon, className }) {
  const Icon = SERVICE_ICONS[icon] ?? SERVICE_ICONS.sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
