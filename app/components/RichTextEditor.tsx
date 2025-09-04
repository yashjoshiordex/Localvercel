// "use client"

// import React, { useState } from 'react';
// import { Card, TextContainer } from '@shopify/polaris';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// export default function AdvancedRichTextEditor() {
//   const [editorData, setEditorData] = useState('<p>Initial content</p>');

//   return (
//     <>
//       <Card title="Rich Text Editor" sectioned>
//       <TextContainer>
//         <CKEditor
//           editor={ClassicEditor}
//           data={editorData}
//           onChange={(event, editor) => {
//             const data = editor.getData();
//             setEditorData(data);
//             console.log('Editor data:', data);
//           }}
//         />
//       </TextContainer>
//     </Card>
//     </>
//   )
// }

// "use client"

// import React, { useState,useEffect } from 'react';
// import { Box, Card } from '@shopify/polaris';


// export default function AdvancedRichTextEditor() {
//   const [editorLoaded, setEditorLoaded] = useState(false);
//   const [CKEditor, setCKEditor] = useState(null);
//   const [ClassicEditor, setClassicEditor] = useState(null);
//   const [data, setData] = useState('<p>Email Template Customized receipt email template from here. Email Template Customized receipt email template from here. Email Template Customized receipt email template from here. Email Template Customized receipt email template from here. Email Template Customized receipt email template from here.!</p>');

//    useEffect(() => {
//     import('@ckeditor/ckeditor5-react').then((mod) => setCKEditor(() => mod.CKEditor)); 
//     import('@ckeditor/ckeditor5-build-classic').then((mod) => setClassicEditor(() => mod.default));
//     setEditorLoaded(true);
//   }, []);

//   return (
//     <>
//     <Box>
//       <Card title="Rich Text Editor" sectioned>
//       {editorLoaded && CKEditor && ClassicEditor ? (
//         <Box minHeight='170px'>
//         <CKEditor
//           editor={ClassicEditor}
//           data={data}
          
//            config={{
//     height: '300px', 
//     licenseKey: 'GPL',
//   }}
  
//           onChange={(event, editor) => {
//             const value = editor.getData();
//             setData(value);
//             console.log(value);
//           }}
//         />
//         </Box>
//       ) : (
//         <p>Loading editor...</p>
//       )}
//     </Card>
//     </Box>
//     </>
//   )
// }

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
  
  // Default template if no value is provided
  const defaultTemplate = `<p>Dear {{donor_name}},</p>

<p>Thank you for your donation. Your generosity is appreciated! Here are the details of your donation:</p>

<p>{{donor_details}}</p>

<p>Thank you.</p>`;

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
            data={value || defaultTemplate}
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