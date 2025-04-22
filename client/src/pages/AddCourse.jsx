import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useAdminCheck } from "../hooks/useAdminCheck";
import Editor from '@monaco-editor/react'

export default function AddCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [includeCss, setIncludeCss] = useState(false);
  const [includeJs, setIncludeJs] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [activeTab, setActiveTab] = useState("html");
  const [srcDoc, setSrcDoc] = useState("");
  const [theme, setTheme] = useState("vs-dark");

  const isAdmin = useAdminCheck();

  const selectedTabs = ["html", includeCss && "css", includeJs && "js"].filter(
    Boolean
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullHtml = `
        <html>
          <head>
            <style>
              ${getMonacoThemeStyles(theme)}
            </style
          </head>
          <body>
            ${htmlCode}
            <style>${cssCode}</style>
            <script>${jsCode}</script>
          </body>
        </html>
      `;
      setSrcDoc(fullHtml);
    }, 300);

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode, theme]);

  const getMonacoThemeStyles = (themeName) => {
    const themeStyles = {
      'vs-dark': `
      body { background-color: #1e1e1e; color: #d4d4d4; font-family: 'Courier New', monospace; }
      code { color: #d4d4d4; font-size: 14px; }
      `,
      'light': `
      body { background-color: #ffffff; color: #000000; font-family: 'Courier New', monospace; }
      code { color: #000000; font-size: 14px; }
      `
    };

    return themeStyles[themeName] || themeStyles['vs-dark'] // Default to 'vs-dark'
  }

  const handleAddCourse = async () => {
    const { error } = await supabase.from("courses").insert([
      {
        title,
        description,
        difficulty,
        html_code: htmlCode,
        css_code: includeCss ? cssCode : null,
        js_code: includeJs ? jsCode : null,
      },
    ]);

    if (error) {
      alert("Error adding course: " + error.message);
    } else {
      alert("Course added!");
      setTitle("");
      setDescription("");
      setDifficulty("Beginner");
      setHtmlCode("");
      setCssCode("");
      setJsCode("");
      setIncludeCss(false);
      setIncludeJs(false);
      setActiveTab("html");
    }
  };

  const renderEditor = () => {
    switch (activeTab) {
      case "html":
        return (
          <Editor
            height="500px"
            language="html"
            theme="vs-dark"
            value={htmlCode}
            onChange={(value) => setHtmlCode(value || "")}
            options={{ automaticLayout: true }}
          />
        );
      case "css":
        return (
          <Editor 
            height="500px"
            language="css"
            theme="vs-dark"
            value={cssCode}
            onChange={(value) => setCssCode(value || "")}
            options={{ automaticLayout: true }}
          />
        );
      case "js":
        return (
          <Editor 
          height="500px"
          language="javascript"
          theme="vs-dark"
          value={jsCode}
          onChange={(value) => setJsCode(value || "")}
          options={{ automaticLayout: true}}
          />
        );
      default:
        return null;
    }
  };

  // ✅ Only conditionally render here, after all hooks
  if (!isAdmin) return <p>⛔ You must be an admin to access this page.</p>;

  return (
    <div className="flex gap-8 p-8 font-arial">
      <div style={{ flex: 1 }}>
        <h2 className="text-2xl">Add New Course</h2>

        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Add a Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 border p-1 w-1/4"
          />

          <textarea
            placeholder="Add a Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4 border p-1 w-1/4 resize-none"
          />
        </div>

        <div>
          <p className="text-xl">Choose Difficulty</p>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="mb-4 cursor-pointer"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        </div>

        <div className="mb-4">
          <label>
            <input type="checkbox" checked disabled /> Include HTML (Always
            included)
          </label>
          <label className="ml-4">
            <input
              type="checkbox"
              checked={includeCss}
              onChange={() => setIncludeCss((prev) => !prev)}
            />{" "}
            Include CSS
          </label>
          <label className="ml-4">
            <input
              type="checkbox"
              checked={includeJs}
              onChange={() => setIncludeJs((prev) => !prev)}
            />{" "}
            Include JavaScript
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-4 mb-4 bg-sky-300 p-2 rounded-lg">
            {selectedTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-2 px-4 cursor-pointer rounded-lg"
                style={{
                  backgroundColor: tab === activeTab ? "#ccc" : "#eee",
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="bg-sky-300 mb-4 flex items-center p-2 rounded-lg">
            <h3>Live Preview</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {renderEditor()}

          {/* ✅ Live Preview Box */}
          <div>
            <iframe
              srcDoc={srcDoc}
              title="Live Output"
              sandbox="allow-scripts"
              frameBorder="0"
              className="border w-full h-[500px] font-arial"
            />
          </div>
        </div>

        <button
          onClick={handleAddCourse}
          className="mt-4 py-3 px-6 bg-[#4CAF50] text-white border-none rounded-lg cursor-pointer"
        >
          ➕ Add Course
        </button>
      </div>
    </div>
  );
}
