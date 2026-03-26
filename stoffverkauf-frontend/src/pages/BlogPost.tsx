import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { useEffect, useState } from "react";
import api from "../../api";

interface BlogPost {
  _id: string;
  title: string;
  status: "published" | "draft";
  date: string;
  excerpt: string;
  content: string;
  image?: string;
  category?: string;
  readTime?: number;
}

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useI18n();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/blog/get-blog/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch blog post", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {lang === "de" ? "Artikel nicht gefunden" : "Article not found"}
            </h1>
            <Link to="/blog" className="text-accent hover:underline">{lang === "de" ? "Zurück zum Blog" : "Back to Blog"}</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post._id}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: { "@type": "Organization", name: "Stoffverkauf Weber" },
        }}
      />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            {lang === "de" ? "Zurück zum Blog" : "Back to Blog"}
          </Link>

          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.image && (
                <div className="aspect-video mb-8 rounded-2xl overflow-hidden shadow-xl border border-border">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
              {post.category || (lang === "de" ? "Neuigkeiten" : "News")}
            </span>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-4 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.date).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime || 5} min {lang === "de" ? "Lesezeit" : "read"}</span>
            </div>

            <div className="prose prose-stone max-w-none">
              {paragraphs.map((p, i) => {
                if (p.startsWith("## ")) {
                  return <h2 key={i} className="font-display text-xl font-bold text-foreground mt-8 mb-4">{p.replace("## ", "")}</h2>;
                }
                return <p key={i} className="text-muted-foreground leading-relaxed mb-4 font-body">{p}</p>;
              })}
            </div>
          </motion.article>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default BlogPostPage;
