import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { mockBlogPosts } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const Blog = () => {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={lang === "de" ? "Blog & Inspiration" : "Blog & Inspiration"}
        description={lang === "de" ? "Tipps, Trends und Neuigkeiten rund um Stoffe bei Stoffverkauf Weber." : "Tips, trends and news about fabrics at Stoffverkauf Weber."}
        path="/blog"
      />
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {lang === "de" ? "Blog & Inspiration" : "Blog & Inspiration"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "de" ? "Tipps, Trends und Neuigkeiten rund um Stoffe" : "Tips, trends and news about fabrics"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBlogPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-card group"
              >
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <span className="text-4xl">🧵</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {lang === "de" ? post.category : post.categoryEn}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    <Link to={`/blog/${post.id}`}>
                      {lang === "de" ? post.title : post.titleEn}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {lang === "de" ? post.excerpt : post.excerptEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { month: "short", day: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime} min</span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="text-accent text-sm font-semibold flex items-center gap-1 hover:underline">
                      {lang === "de" ? "Lesen" : "Read"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Blog;
