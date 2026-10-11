import React from "react";
import { ChevronDown } from "lucide-react";

const DesignCredit: React.FC<{ name?: string; role?: string }> = ({ name = "Christian Leaders", role = "Communications Team" }) => {
  const [open, setOpen] = React.useState(false);
  return <div className="mt-4 text-center"><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1.5 text-body-xs text-muted/80"><ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />Design Created by</button>{open && <p className="mt-2 text-body-xs text-muted/80">{name}<span className="mx-2">·</span>{role}</p>}</div>;
};

export default DesignCredit;
