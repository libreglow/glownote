import { useEffect, useRef, useState } from 'react';

interface FloatingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

export default function FloatingToolbar({
  onBold,
  onItalic,
}: FloatingToolbarProps) {
  const [position, setPosition] =
    useState<ToolbarPosition | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        setPosition(null);
        return;
      }

      if (selection.isCollapsed) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);

      const container =
        range.commonAncestorContainer instanceof Element
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement;

      if (!container) {
        setPosition(null);
        return;
      }

      const block =
        container.closest('[data-editor-block]');

      if (!block) {
        setPosition(null);
        return;
      }

      const rect = range.getBoundingClientRect();

      if (!rect.width && !rect.height) {
        setPosition(null);
        return;
      }

      setPosition({
        top: rect.top - 48,
        left: rect.left + rect.width / 2,
      });
    }

    document.addEventListener(
      'selectionchange',
      update,
    );

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      document.removeEventListener(
        'selectionchange',
        update,
      );

      window.removeEventListener(
        'resize',
        update,
      );

      window.removeEventListener(
        'scroll',
        update,
        true,
      );
    };
  }, []);

  if (!position) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="
        fixed z-50
        flex items-center gap-1
        rounded-lg
        border border-zinc-700
        bg-zinc-900
        p-1
        shadow-xl
      "
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(event) => {
        /*
         * Prevent the toolbar from stealing focus
         * from the editor.
         */
        event.preventDefault();
      }}
    >
      <button
        type="button"
        className="
          rounded px-3 py-1.5
          text-sm font-bold
          text-white
          hover:bg-zinc-800
        "
        onClick={onBold}
      >
        B
      </button>

      <button
        type="button"
        className="
          rounded px-3 py-1.5
          text-sm italic
          text-white
          hover:bg-zinc-800
        "
        onClick={onItalic}
      >
        I
      </button>
    </div>
  );
}