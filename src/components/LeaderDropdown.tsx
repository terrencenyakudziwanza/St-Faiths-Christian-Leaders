import React from "react";
import fallbackProfile from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

interface LeaderDropdownProps {
  leaders: string[];
  value: string;
  onChange: (leader: string) => void;
}

const LeaderDropdown: React.FC<LeaderDropdownProps> = ({
  leaders,
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="leader-dropdown">
      <button
        className="leader-dropdown-trigger text-body-sm"
        onClick={() => setOpen((p) => !p)}
      >
        {value === "All" ? "All Leaders" : value}
      </button>

      {open && (
        <div className="leader-dropdown-menu">
          {leaders.map((leader) => (
            <button
              key={leader}
              className="leader-option"
              onClick={() => {
                onChange(leader);
                setOpen(false);
              }}
            >
              <img
                src={fallbackProfile}
                alt={leader}
                className="leader-avatar"
              />

              <div className="leader-meta">
                <p className="leader-name text-body-sm text-ink font-semibold">
                  {leader}
                </p>
                <p className="text-caption text-subtle">Service Leader</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderDropdown;
