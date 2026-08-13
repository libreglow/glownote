import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { Button } from "../ui/button";
import { GradientText } from "../grootstudio/gradient-text-fill";
const appWindow = getCurrentWindow();

export function TitleBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex h-10 w-full select-none border-b bg-background">
      <div data-tauri-drag-region className="flex flex-1 items-center px-4">
        <GradientText className="font-extrabold">GLowNote</GradientText>
      </div>

      <div className="flex h-full">
        <Button
          type="button"
          variant={"link"}

          onClick={() => appWindow.minimize()}
          className="flex h-full w-12 items-center justify-center hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={"link"}

          onClick={() => appWindow.toggleMaximize()}
          className="flex h-full w-12 items-center justify-center hover:bg-muted"
        >
          <Square className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant={"link"}
          onClick={() => appWindow.close()}
          className="flex h-full w-12 items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
