"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

import { linksSchema, LinksFormValues } from "@/lib/vaildation/links";
import { upsertLinks, ActionResult } from "@/app/actions/links";

// Shadcn UI Component Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LinkManagementFormProps {
  initialData?: LinksFormValues | null;
}

interface FieldGroup {
  name: keyof LinksFormValues;
  label: string;
  placeholder?: string;
}

// Configured field groups for cleaner JSX rendering
const SECTIONS: { id: string; title: string; fields: FieldGroup[] }[] = [
  {
    id: "about-us",
    title: "About Us",
    fields: [
      {
        name: "overview",
        label: "Overview Link",
        placeholder: "https://example.com/about/overview",
      },
      {
        name: "naac_accreditation",
        label: "NAAC Accreditation",
        placeholder: "https://example.com/naac",
      },
      {
        name: "nba_accreditation",
        label: "NBA Accreditation",
        placeholder: "https://example.com/nba",
      },
      {
        name: "aicte",
        label: "AICTE Link",
        placeholder: "https://example.com/aicte",
      },
      {
        name: "dr_apj_abdul_kalam_technical_university",
        label: "AKTU University Link",
      },
      {
        name: "vision_mission_quality_policy",
        label: "Vision, Mission & Quality Policy",
      },
      { name: "core_values", label: "Core Values" },
      { name: "governing_board", label: "Governing Board" },
      { name: "management_committee", label: "Management Committee" },
      { name: "chairman_message", label: "Chairman's Message" },
      { name: "vice_chairman_message", label: "Vice Chairman's Message" },
      { name: "director_message", label: "Director's Message" },
      { name: "deans_message", label: "Dean's Message" },
      { name: "organogram", label: "Organogram Document Link" },
      { name: "service_rules", label: "Service Rules" },
      { name: "mandatory_disclosures", label: "Mandatory Disclosures" },
      { name: "committees", label: "Committees" },
    ],
  },
  {
    id: "academics",
    title: "Academics",
    fields: [
      { name: "academic_calendar", label: "Academic Calendar" },
      { name: "international_conferences", label: "International Conferences" },
      { name: "important_functionaries", label: "Important Functionaries" },
      { name: "syllabus", label: "Syllabus" },
      { name: "ordinances", label: "Ordinances" },
      { name: "examination", label: "Examination Portal/Rules" },
      { name: "strategic_plan", label: "Strategic Plan" },
      { name: "best_practices", label: "Best Practices" },
    ],
  },
  {
    id: "iqac",
    title: "IQAC & NAAC",
    fields: [
      { name: "iqac_mom", label: "IQAC Minutes of Meeting" },
      { name: "ssr_cycle", label: "SSR Cycle" },
      { name: "extended_profile", label: "Extended Profile" },
      { name: "criterion_1", label: "Criterion 1" },
      { name: "criterion_2", label: "Criterion 2" },
      { name: "criterion_3", label: "Criterion 3" },
      { name: "criterion_4", label: "Criterion 4" },
      { name: "criterion_5", label: "Criterion 5" },
      { name: "criterion_6", label: "Criterion 6" },
      { name: "criterion_7", label: "Criterion 7" },
      { name: "naac_grade_sheet", label: "NAAC Grade Sheet" },
      { name: "iiqa_reports", label: "IIQA Reports" },
      {
        name: "institutional_distinctiveness",
        label: "Institutional Distinctiveness",
      },
      { name: "feedback", label: "Feedback Links" },
      { name: "atr", label: "Action Taken Report (ATR)" },
    ],
  },
  {
    id: "courses",
    title: "Academic Courses",
    fields: [
      { name: "btech_cse", label: "B.Tech CSE" },
      { name: "btech_cse_ds", label: "B.Tech CSE (Data Science)" },
      { name: "btech_cse_aiml", label: "B.Tech CSE (AI & ML)" },
      { name: "btech_cse_ai", label: "B.Tech CSE (AI)" },
      { name: "btech_it", label: "B.Tech IT" },
      { name: "btech_ece", label: "B.Tech ECE" },
      { name: "btech_me", label: "B.Tech ME" },
      { name: "mtech_cse", label: "M.Tech CSE" },
      { name: "bba", label: "BBA" },
      { name: "bca", label: "BCA" },
      { name: "mba", label: "MBA" },
      { name: "mca", label: "MCA" },
    ],
  },
  {
    id: "admissions",
    title: "Admissions",
    fields: [
      { name: "important_notice", label: "Important Notice" },
      {
        name: "btech_admission_counselling",
        label: "B.Tech Admission Counselling",
      },
      { name: "registration_form", label: "Registration Form Link" },
      { name: "admission_documents", label: "Admission Documents Required" },
      { name: "fee_structure", label: "Fee Structure Link" },
      { name: "information_brochure", label: "Information Brochure" },
      { name: "ipec_newsletter", label: "IPEC Newsletter" },
      { name: "student_handbook", label: "Student Handbook" },
      { name: "mode_of_payment", label: "Mode of Payment Details" },
    ],
  },
  {
    id: "for-students",
    title: "For Students",
    fields: [
      { name: "udbhav_2026", label: "Udbhav 2026" },
      { name: "sports_fest_2026", label: "Sports Fest 2026" },
      { name: "hackathon", label: "Hackathon Info/Registration" },
      { name: "scholarship_aicte", label: "AICTE Scholarship" },
      { name: "scholarship_up_india", label: "UP India Scholarship" },
      { name: "scholarship_nsp", label: "NSP Scholarship Portal" },
      { name: "old_question_papers", label: "Old Question Papers" },
      { name: "student_verification", label: "Student Verification" },
      { name: "student_society", label: "Student Society" },
      { name: "students_rewards", label: "Students Rewards" },
      { name: "student_counselling", label: "Student Counselling" },
      { name: "students_gallery", label: "Students Gallery" },
      { name: "ipec_erp", label: "IPEC ERP Portal Link" },
    ],
  },
  {
    id: "alumni",
    title: "Alumni",
    fields: [
      { name: "key_alumni_ce", label: "Key Alumni - CE" },
      { name: "key_alumni_ece", label: "Key Alumni - ECE" },
      { name: "key_alumni_cs", label: "Key Alumni - CS" },
      { name: "key_alumni_eee", label: "Key Alumni - EEE" },
      { name: "key_alumni_it", label: "Key Alumni - IT" },
      { name: "key_alumni_ash", label: "Key Alumni - AS&H" },
      { name: "key_alumni_me", label: "Key Alumni - ME" },
      {
        name: "notices_for_passout_students",
        label: "Notices for Passout Students",
      },
    ],
  },
  {
    id: "research",
    title: "R & D",
    fields: [
      { name: "mdp", label: "Management Development Program (MDP)" },
      { name: "fdp_2026", label: "FDP 2026" },
      {
        name: "case_writing_workshop_2026",
        label: "Case Writing Workshop 2026",
      },
      { name: "iciscs", label: "ICISCS Conference" },
      { name: "projects", label: "R&D Projects" },
      { name: "ipec_jst", label: "IPEC Journal (JST)" },
      { name: "outreach_activities", label: "Outreach Activities" },
    ],
  },
  {
    id: "innovation",
    title: "Innovation & TBI",
    fields: [
      { name: "about_ipec_tbi", label: "About IPEC TBI" },
      { name: "tbi_services", label: "TBI Services" },
      { name: "funded_projects", label: "Funded Projects" },
      { name: "our_startups", label: "Our Startups" },
      { name: "tbi_events", label: "TBI Events" },
      { name: "tbi_recognitions", label: "TBI Recognitions" },
    ],
  },
  {
    id: "placement",
    title: "Placement",
    fields: [
      { name: "training_and_placement", label: "Training & Placement Cell" },
      {
        name: "placement_director_message",
        label: "Placement Director Message",
      },
      { name: "placement_testimonials", label: "Placement Testimonials" },
      { name: "recruiters", label: "Our Recruiters" },
      {
        name: "placement_guidelines_policy",
        label: "Placement Policy & Guidelines",
      },
      { name: "placement_gallery", label: "Placement Gallery" },
      { name: "placement_record", label: "Placement Records" },
      { name: "contact_us", label: "Contact Us Link" },
    ],
  },
];

export function LinkManagementForm({ initialData }: LinkManagementFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ActionResult | null>(null);

  const form = useForm<LinksFormValues>({
    resolver: zodResolver(linksSchema),
    defaultValues: initialData || {
      id: "",
      overview: "",
      naac_accreditation: "",
      nba_accreditation: "",
      aicte: "",
      dr_apj_abdul_kalam_technical_university: "",
      vision_mission_quality_policy: "",
      core_values: "",
      governing_board: "",
      management_committee: "",
      chairman_message: "",
      vice_chairman_message: "",
      director_message: "",
      deans_message: "",
      organogram: "",
      service_rules: "",
      mandatory_disclosures: "",
      committees: "",
      academic_calendar: "",
      international_conferences: "",
      important_functionaries: "",
      syllabus: "",
      ordinances: "",
      examination: "",
      strategic_plan: "",
      best_practices: "",
      iqac_mom: "",
      ssr_cycle: "",
      extended_profile: "",
      criterion_1: "",
      criterion_2: "",
      criterion_3: "",
      criterion_4: "",
      criterion_5: "",
      criterion_6: "",
      criterion_7: "",
      naac_grade_sheet: "",
      iiqa_reports: "",
      institutional_distinctiveness: "",
      feedback: "",
      atr: "",
      btech_cse: "",
      btech_cse_ds: "",
      btech_cse_aiml: "",
      btech_cse_ai: "",
      btech_it: "",
      btech_ece: "",
      btech_me: "",
      mtech_cse: "",
      bba: "",
      bca: "",
      mba: "",
      mca: "",
      important_notice: "",
      btech_admission_counselling: "",
      registration_form: "",
      admission_documents: "",
      fee_structure: "",
      information_brochure: "",
      ipec_newsletter: "",
      student_handbook: "",
      mode_of_payment: "",
      udbhav_2026: "",
      sports_fest_2026: "",
      hackathon: "",
      scholarship_aicte: "",
      scholarship_up_india: "",
      scholarship_nsp: "",
      old_question_papers: "",
      student_verification: "",
      student_society: "",
      students_rewards: "",
      student_counselling: "",
      students_gallery: "",
      ipec_erp: "",
      key_alumni_ce: "",
      key_alumni_ece: "",
      key_alumni_cs: "",
      key_alumni_eee: "",
      key_alumni_it: "",
      key_alumni_ash: "",
      key_alumni_me: "",
      notices_for_passout_students: "",
      mdp: "",
      fdp_2026: "",
      case_writing_workshop_2026: "",
      iciscs: "",
      projects: "",
      ipec_jst: "",
      outreach_activities: "",
      about_ipec_tbi: "",
      tbi_services: "",
      funded_projects: "",
      our_startups: "",
      tbi_events: "",
      tbi_recognitions: "",
      training_and_placement: "",
      placement_director_message: "",
      placement_testimonials: "",
      recruiters: "",
      placement_guidelines_policy: "",
      placement_gallery: "",
      placement_record: "",
      contact_us: "",
    },
  });

  const onSubmit = (values: LinksFormValues) => {
    setStatus(null);
    startTransition(async () => {
      const result = await upsertLinks(values);
      setStatus(result);
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* Status Notification */}
      {status && (
        <Alert variant={status.success ? "default" : "destructive"}>
          {status.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}

          <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>

          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b bg-muted/40 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Institutional Links Configuration
              </CardTitle>

              <CardDescription>
                Manage and update external URLs across all institutional
                categories.
              </CardDescription>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Links
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="about-us" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
              {SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="data-[state=active]:bg-background text-xs sm:text-sm py-1.5 px-3"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {SECTIONS.map((section) => (
              <TabsContent
                key={section.id}
                value={section.id}
                className="mt-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((fieldConfig) => {
                    const fieldName = fieldConfig.name;
                    const error = form.formState.errors[fieldName];

                    return (
                      <div key={fieldName} className="space-y-2">
                        <label
                          htmlFor={fieldName}
                          className="text-sm font-medium leading-none"
                        >
                          {fieldConfig.label}
                        </label>

                        <Input
                          id={fieldName}
                          type="url"
                          placeholder={fieldConfig.placeholder || "https://..."}
                          {...form.register(fieldName)}
                          aria-invalid={!!error}
                          aria-describedby={
                            error ? `${fieldName}-error` : undefined
                          }
                          className={
                            error
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />

                        {error && (
                          <p
                            id={`${fieldName}-error`}
                            className="text-sm font-medium text-destructive"
                          >
                            {error.message?.toString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
