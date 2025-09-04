"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@shopify/polaris";

// Define types outside the component
let CKEditorComponent: any;
let ClassicEditorBuild: any;

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function AdvancedRichTextEditor({value, onChange}: RichTextEditorProps) {
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    const loadEditor = async () => {
      const ckeditorModule = await import("@ckeditor/ckeditor5-react");
      const classicModule = await import("@ckeditor/ckeditor5-build-classic");
      CKEditorComponent = ckeditorModule.CKEditor;
      ClassicEditorBuild = classicModule.default;
      setEditorLoaded(true);
    };
    loadEditor();
  }, []);

  return (
    <Box>
      {editorLoaded ? (
        <Box>
          <CKEditorComponent
            editor={ClassicEditorBuild}
            data={value}
            config={{
              height: "300px",
              licenseKey: 'GPL'
            }}
            onChange={(_event: any, editor: any) => {
              const editorValue = editor.getData();
              if (onChange) {
                onChange(editorValue);
              }
            }}
          />
        </Box>
      ) : (
        <p>Loading editor...</p>
      )}
    </Box>
  );
}