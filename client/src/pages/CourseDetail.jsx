import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import Editor from "@monaco-editor/react";

export default function CourseDetail() {
  const user = useUser();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [srcDoc, setSrcDoc] = useState("");
  const [activeTab, setActiveTab] = useState("html"); // Default to "html"
  const [selectedTabs, setSelectedTabs] = useState(["html"]); // Default to just HTML tab
  const [theme, setTheme] = useState("vs-dark");

  // Check if the course is completed by the user
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
      } else {
        setCourse(data);
        setHtmlCode(data.html_code || "");
        setCssCode(data.css_code || "");
        setJsCode(data.js_code || "");

        // Dynamically set the available tabs based on course data
        const tabs = ["html"];
        if (data.show_css) tabs.push("css");
        if (data.show_js) tabs.push("js");

        setSelectedTabs(tabs);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  useEffect(() => {
    const checkProgress = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("completed, submitted_html, submitted_css, submitted_js")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (error) {
        console.error("Error checking progress:", error);
        return;
      }

      if (data) {
        setIsCourseCompleted(data.completed);

        // 👇 Load the user's submitted code into the editor if exists
        if (data.submitted_html) setHtmlCode(data.submitted_html);
        if (data.submitted_css) setCssCode(data.submitted_css);
        if (data.submitted_js) setJsCode(data.submitted_js);
      }
    };

    checkProgress();
  }, [user, courseId]);

  useEffect(() => {
    // Update live preview on code changes
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

  if (!course) {
    return <p>Loading...</p>;
  }

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
          language="js"
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

  const handleSubmitProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase.from("user_progress").upsert([
      {
        user_id: user.id,
        course_id: courseId,
        completed: true,
        submitted_html: htmlCode,
        submitted_css: cssCode,
        submitted_js: jsCode,
      },
    ]);

    if (error) {
      console.error("Error submitting progress:", error);
    } else {
      setIsCourseCompleted(true);
      alert("Course marked as completed with your submitted code!");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">{course.title}</h2>
      <p className="my-4">{course.description}</p>

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
        {/* Only render the editor for the active tab */}
        <div>{renderEditor()}</div>

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

      {/* Button to mark the course as completed */}
      {!isCourseCompleted && (
        <div className="mt-4">
          <button
            onClick={handleSubmitProgress}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg cursor-pointer"
          >
            Mark as Completed
          </button>
        </div>
      )}
    </div>
  );
}
