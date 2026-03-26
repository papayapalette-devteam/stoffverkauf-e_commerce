import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { CheckCircle, XCircle, Star, MessageSquare, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

const AdminFeedback = () => {
  const { lang } = useI18n();
  const de = lang === "de";

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      // Fetch only pending by default or all? Let's do all with a filter if needed
      const res = await api.get(`/api/feedback/admin/all?page=${currentPage}&limit=10`);
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
        setTotalPages(res.data.totalPages);
        setTotalFeedbacks(res.data.totalFeedbacks);
      }
    } catch (err) {
      toast.error(de ? "Fehler beim Laden der Feedbacks" : "Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [currentPage]);

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await api.patch(`/api/feedback/admin/status/${id}`, { status });
      if (res.data.success) {
        toast.success(de ? `Feedback ${status === "approved" ? "genehmigt" : "abgelehnt"}` : `Feedback ${status}`);
        fetchFeedbacks();
      }
    } catch (err) {
      toast.error(de ? "Aktion fehlgeschlagen" : "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Feedback-Management" : "Feedback Management"} <span className="text-muted-foreground font-body text-base">({totalFeedbacks})</span>
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Nutzer" : "User"}</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Produkt" : "Product"}</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Bewertung" : "Rating"}</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Kommentar" : "Comment"}</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => (
                  <tr key={f._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{f.user?.firstName} {f.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{f.user?.email}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {f.product?.name || "Deleted Product"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= f.rating ? "text-yellow-500 fill-yellow-500" : "text-muted border-muted"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate" title={f.comment}>
                      {f.comment}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        f.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                        f.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {de ? (f.status === 'approved' ? 'Genehmigt' : f.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend') : f.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {f.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(f._id, "approved")}
                            className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-600 transition-colors"
                            title={de ? "Genehmigen" : "Approve"}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(f._id, "rejected")}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                            title={de ? "Ablehnen" : "Reject"}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground italic">
                      {de ? "Keine Feedbacks gefunden" : "No feedbacks found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 bg-secondary/30 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {de ? `Seite ${currentPage} von ${totalPages}` : `Page ${currentPage} of ${totalPages}`} ({totalFeedbacks} feedbacks)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-card disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-card disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
