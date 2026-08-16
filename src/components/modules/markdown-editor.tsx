import { invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';

interface MarkdownEditorProps {
  documentPath: string;
}

export default function MarkdownEditor({ documentPath }: MarkdownEditorProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isDirty = useRef(false);
  const editorLoaded = useRef(false);



  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const text = await invoke<string>('readDocument', {
          path: documentPath,
        });

        if (!cancelled) {
          setContent(text);
          isDirty.current = false;
        }
      } catch (error) {
        console.error('Failed to read document:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    setContent('');
    load();

    return () => {
      cancelled = true;
    };
  }, [documentPath]);

  useEffect(() => {
    editorLoaded.current = false;
  }, [documentPath]);



  useEffect(() => {
    if (isLoading || !isDirty.current) {
      return;
    }

    const timeout = setTimeout(() => {
      invoke('saveDocument', { path: documentPath, content }).catch((error) => {
        console.error('Failed to save document:', error);
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [content, documentPath, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background">
      <div className="flex-1 overflow-auto">
      </div>
    </div>
  );
}
