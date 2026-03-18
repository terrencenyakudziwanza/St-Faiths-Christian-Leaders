import React from "react";

interface ProfileCardProps {
  imageSrc: string;
  imageAlt?: string;
  name: string;
  details?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  avatarClassName?: string;
  contentClassName?: string;
  nameClassName?: string;
  detailsClassName?: string;
  metaClassName?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  imageSrc,
  imageAlt,
  name,
  details,
  meta,
  trailing,
  className,
  avatarClassName,
  contentClassName,
  nameClassName,
  detailsClassName,
  metaClassName,
}) => {
  const rootClassName = ["flex items-center gap-3 min-w-0", className]
    .filter(Boolean)
    .join(" ");
  const avatarWrapperClassName = [
    "h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-muted ring-1 ring-[color:var(--border)]",
    avatarClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const bodyClassName = ["min-w-0 flex-1", contentClassName]
    .filter(Boolean)
    .join(" ");
  const titleClassName = [
    "truncate text-heading-xs font-medium leading-tight text-ink",
    nameClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const detailsClassNames = ["mt-1 text-body-sm text-muted", detailsClassName]
    .filter(Boolean)
    .join(" ");
  const metaClassNames = [
    "mt-1.5 flex items-center gap-2 flex-wrap text-caption text-subtle",
    metaClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className={avatarWrapperClassName}>
        <img
          src={imageSrc}
          alt={imageAlt ?? name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className={bodyClassName}>
        <h3 className={titleClassName}>{name}</h3>
        {details ? <div className={detailsClassNames}>{details}</div> : null}
        {meta ? <div className={metaClassNames}>{meta}</div> : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
};

export default ProfileCard;
