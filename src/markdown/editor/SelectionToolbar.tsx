import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
} from 'lucide-react';

interface SelectionToolbarProps {
  visible: boolean;
  x: number;
  y: number;

  onBold: () => void;
  onItalic: () => void;
  onStrike: () => void;
  onHeading1: () => void;
  onHeading2: () => void;
}

export default function SelectionToolbar({
  visible,
  x,
  y,
  onBold,
  onItalic,
  onStrike,
  onHeading1,
  onHeading2,
}: SelectionToolbarProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        fixed z-50
        flex items-center gap-1
        rounded-lg border
        bg-background
        p-1
        shadow-lg
      "
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
      onMouseDown={(event) => {
        // مهم جدًا:
        // لا نخلي الضغط على toolbar يلغي selection
        event.preventDefault();
      }}
    >
      <ToolbarButton
        icon={<Bold className="h-4 w-4" />}
        onClick={onBold}
      />

      <ToolbarButton
        icon={<Italic className="h-4 w-4" />}
        onClick={onItalic}
      />

      <ToolbarButton
        icon={<Strikethrough className="h-4 w-4" />}
        onClick={onStrike}
      />

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        icon={<Heading1 className="h-4 w-4" />}
        onClick={onHeading1}
      />

      <ToolbarButton
        icon={<Heading2 className="h-4 w-4" />}
        onClick={onHeading2}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="
        flex h-8 w-8
        items-center justify-center
        rounded-md
        hover:bg-muted
        transition-colors
      "
      onClick={onClick}
    >
      {icon}
    </button>
  );
}