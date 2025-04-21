import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

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
    // Check if the course is already marked as completed by the user
    const checkProgress = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();

        if (data) {
          setIsCourseCompleted(data.status === "completed");
        }
      }
    };

    checkProgress();
  }, [user, courseId]);

  useEffect(() => {
    // Update live preview on code changes
    const timeout = setTimeout(() => {
      const fullHtml = `
        <html>
          <head><style>${cssCode}</style></head>
          <body>
            ${htmlCode}
            <script>${jsCode}</script>
          </body>
        </html>
      `;
      setSrcDoc(fullHtml);
    }, 300);

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  if (!course) {
    return <p>Loading...</p>;
  }

  const renderEditor = () => {
    switch (activeTab) {
      case "html":
        return (
          <textarea
            placeholder="HTML Code"
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            rows={20}
            className="w-full bg-sky-50 border p-2 resize-none"
          />
        );
      case "css":
        return (
          <textarea
            placeholder="CSS Code"
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            rows={20}
            className="w-full bg-sky-50 border p-2 resize-none"
          />
        );
      case "js":
        return (
          <textarea
            placeholder="JavaScript Code"
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
            rows={20}
            className="w-full bg-sky-50 border p-2 resize-none"
          />
        );
      default:
        return null;
    }
  };

  const handleSubmitProgress = async () => {
    if (!user) return;

    // Check if the user has already marked the course as completed
    const { data, error } = await supabase
      .from("user_progress")
      .upsert([
        {
          user_id: user.id,
          course_id: courseId,
          status: "completed",
        },
      ]);

    if (error) {
      console.error("Error submitting progress:", error);
    } else {
      setIsCourseCompleted(true);
      alert("Course marked as completed!");
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
        <div>
          {renderEditor()}
        </div>

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
