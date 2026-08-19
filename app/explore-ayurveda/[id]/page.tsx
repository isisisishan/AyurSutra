"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormulationDetail } from "@/components/bkk/FormulationDetail";
import { getBKKById, getRelatedFormulations, type BKKRecord } from "@/lib/services/bkk-engine";

export default function ExploreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [record, setRecord] = useState<BKKRecord | null>(null);
  const [related, setRelated] = useState<BKKRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = getBKKById(id);
      if (found) {
        setRecord(found);
        setRelated(getRelatedFormulations(found.id));
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-serif text-neutral-900 mb-2">Formulation Not Found</h1>
        <p className="text-neutral-500 mb-6">The formulation you are looking for does not exist in the BKK dataset.</p>
        <Button onClick={() => router.push("/explore-ayurveda")} variant="outline">
          Return to Explorer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/explore-ayurveda")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="-ml-3"
          >
            Back to Search
          </Button>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <FormulationDetail 
            record={record}
            mode="public"
            relatedRecords={related}
            onViewRelated={(rid) => router.push(`/explore-ayurveda/${rid}`)}
          />
        </div>
      </main>
    </div>
  );
}
