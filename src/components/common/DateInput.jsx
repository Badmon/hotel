import { Input } from "./Input";

/** Input de fecha (YYYY-MM-DD) con las mismas props que Input. */
export function DateInput(props) {
  return <Input type="date" {...props} />;
}
