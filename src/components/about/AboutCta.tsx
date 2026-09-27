import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigateView } from "../../hooks/useNavigateView";
import { useAppDispatch } from "../../store/hooks";
import { addToast } from "../../store/slices/uiSlice";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

// Inquiry Form Validation Schema
const inquirySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  organization: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export function AboutCta() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      inquiryType: "trade",
      organization: "",
      message: "",
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    // Simulate inquiry transmission
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();

    dispatch(
      addToast({
        title: "Inquiry Dispatched",
        description: `Thank you ${data.fullName}. Our design concierge will respond within 24 business hours.`,
        type: "success",
      }),
    );
  };

  return (
    <section
      id="contact-inquiries"
      aria-labelledby="cta-heading"
      className="py-20 md:py-28 bg-neutral-50/70 dark:bg-neutral-900/50 border-t border-neutral-200/80 dark:border-neutral-800"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Banner CTA */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white p-8 sm:p-12 lg:p-16 mb-16 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl space-y-6">
            <Badge
              variant="outline"
              className="text-xs uppercase font-mono text-neutral-300 border-neutral-700 bg-neutral-900"
            >
              Start Your Journey
            </Badge>

            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              Bring intentional design into your everyday rhythm.
            </h2>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
              Experience the tactile weight of CNC-milled unibody aluminum and
              the quiet confidence of objects crafted without compromise.
              Explore the complete SODAI catalog today.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("shop")}
                className="px-7 py-3 text-sm font-semibold rounded-xl bg-white text-neutral-950 hover:bg-neutral-100 shadow-md group"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById("inquiry-form");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 text-sm font-medium rounded-xl border-neutral-700 text-white hover:bg-neutral-900"
              >
                <span>Partner With Our Studio</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Two-Column Studio Inquiries & Contact Info */}
        <div
          id="inquiry-form"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
        >
          {/* Left Column: Direct Atelier Contacts */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <Badge
                variant="outline"
                className="mb-3 px-3 py-1 text-xs uppercase tracking-wider font-mono"
              >
                Studio Concierge
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Connect with our team.
              </h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Whether you’re an architect specifying workspace installations,
                a journalist requesting review units, or a collector with a
                question about material care, we’re at your service.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Nordic Atelier
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Sveavägen 48, 111 34 Stockholm, Sweden
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">
                    Open for private studio visits by appointment
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Tokyo Materials Lab
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    5-7-2 Minami-Aoyama, Minato-ku, Tokyo 107-0062, Japan
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">
                    Acoustics research & ceramic development
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Direct Correspondence
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                    concierge@sodai-design.com
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Typical response time: Under 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: React Hook Form Inquiry Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 sm:p-10 shadow-lg">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                  Send a Studio Dispatch
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Inquire about architectural trade orders, press loans, or
                  custom commissions.
                </p>
              </div>

              {isSubmitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-8 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                      Message Received
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                      Thank you for reaching out to SODAI. A member of our
                      design or trade team will review your inquiry and follow
                      up promptly.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1"
                      >
                        Your Name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="e.g. Maya Lin"
                        {...register("fullName")}
                        aria-invalid={errors.fullName ? "true" : "false"}
                        className={`w-full rounded-xl border bg-neutral-50/50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white ${
                          errors.fullName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1"
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="maya@studio.com"
                        {...register("email")}
                        aria-invalid={errors.email ? "true" : "false"}
                        className={`w-full rounded-xl border bg-neutral-50/50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Inquiry Type */}
                    <div>
                      <label
                        htmlFor="inquiryType"
                        className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1"
                      >
                        Inquiry Nature *
                      </label>
                      <select
                        id="inquiryType"
                        {...register("inquiryType")}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      >
                        <option value="trade">
                          Trade / Interior Architecture
                        </option>
                        <option value="press">Press & Media Features</option>
                        <option value="wholesale">
                          Wholesale & Gallery Stockist
                        </option>
                        <option value="general">
                          General Collector Questions
                        </option>
                      </select>
                    </div>

                    {/* Organization / Studio Name */}
                    <div>
                      <label
                        htmlFor="organization"
                        className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1"
                      >
                        Studio / Organization (Optional)
                      </label>
                      <input
                        id="organization"
                        type="text"
                        placeholder="e.g. Lin Design Lab"
                        {...register("organization")}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1"
                    >
                      Message or Project Scope *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Please share details regarding your inquiry, timelines, or specifications..."
                      {...register("message")}
                      aria-invalid={errors.message ? "true" : "false"}
                      className={`w-full rounded-xl border bg-neutral-50/50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none ${
                        errors.message
                          ? "border-red-500 focus:ring-red-500"
                          : "border-neutral-200 dark:border-neutral-800"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full py-3 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    <Send className="h-3.5 w-3.5 mr-2" />
                    <span>Send Message to Atelier</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
