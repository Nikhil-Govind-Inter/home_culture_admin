import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageLoader from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchContactEnquiryById,
  ContactEnquiry,
} from "@/services/contact/contactEnquiryApi";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="text-sm font-medium text-muted-foreground">{label}</div>
    <div className="text-sm break-words">{children}</div>
  </div>
);

export default function ContactEnquiryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enquiry, setEnquiry] = useState<ContactEnquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await fetchContactEnquiryById(id);
        if (!cancelled) setEnquiry(response.data);
      } catch (error) {
        if (cancelled) return;
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load enquiry",
          variant: "destructive",
        });
        navigate("/contact-enquiries");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageLoader />;
  if (!enquiry) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Enquiry Details</h1>
        <Button variant="outline" onClick={() => navigate("/contact-enquiries")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{enquiry.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full Name">{enquiry.full_name}</Field>
            <Field label="Subject">
              {enquiry.subject}
            </Field>
            <Field label="Email">
              <a className="text-primary hover:underline" href={`mailto:${enquiry.email}`}>
                {enquiry.email}
              </a>
            </Field>
            <Field label="Phone">
              <a className="text-primary hover:underline" href={`tel:${enquiry.phone}`}>
                {enquiry.phone}
              </a>
            </Field>
          </div>
          <Field label="Message">
            <p className="whitespace-pre-wrap">{enquiry.message}</p>
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
