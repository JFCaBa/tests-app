import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const BlogPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://diyseo.online/embed.js";
    script.setAttribute("data-site", "cmobn20pi000ent9gyaqscpg0");
    script.setAttribute("data-base-path", "/blog");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Blog - Test My Russian"
        description="Tips, guides, and insights for your Russian language learning journey."
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600">
            Tips, guides, and insights for your Russian language learning journey
          </p>
        </div>
        <div id="soro-widget-container"></div>
      </div>
    </>
  );
};

export default BlogPage;
