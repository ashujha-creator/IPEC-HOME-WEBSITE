import { z } from "zod";

// Helper for optional URL validation (allows empty strings or valid URLs)
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Please enter a valid URL (e.g. https://example.com)" },
  );

export const linksSchema = z.object({
  id: z.string().optional(),

  // --- About Us ---
  overview: optionalUrl,
  naac_accreditation: optionalUrl,
  nba_accreditation: optionalUrl,
  aicte: optionalUrl,
  dr_apj_abdul_kalam_technical_university: optionalUrl,
  vision_mission_quality_policy: optionalUrl,
  core_values: optionalUrl,
  governing_board: optionalUrl,
  management_committee: optionalUrl,
  chairman_message: optionalUrl,
  vice_chairman_message: optionalUrl,
  director_message: optionalUrl,
  deans_message: optionalUrl,
  organogram: optionalUrl,
  service_rules: optionalUrl,
  mandatory_disclosures: optionalUrl,
  committees: optionalUrl,

  // --- Academics ---
  academic_calendar: optionalUrl,
  international_conferences: optionalUrl,
  important_functionaries: optionalUrl,
  syllabus: optionalUrl,
  ordinances: optionalUrl,
  examination: optionalUrl,
  strategic_plan: optionalUrl,
  best_practices: optionalUrl,

  // IQAC Sub-section
  iqac_mom: optionalUrl,
  ssr_cycle: optionalUrl,
  extended_profile: optionalUrl,
  criterion_1: optionalUrl,
  criterion_2: optionalUrl,
  criterion_3: optionalUrl,
  criterion_4: optionalUrl,
  criterion_5: optionalUrl,
  criterion_6: optionalUrl,
  criterion_7: optionalUrl,
  naac_grade_sheet: optionalUrl,
  iiqa_reports: optionalUrl,
  institutional_distinctiveness: optionalUrl,
  feedback: optionalUrl,
  atr: optionalUrl,

  // Academic Courses
  btech_cse: optionalUrl,
  btech_cse_ds: optionalUrl,
  btech_cse_aiml: optionalUrl,
  btech_cse_ai: optionalUrl,
  btech_it: optionalUrl,
  btech_ece: optionalUrl,
  btech_me: optionalUrl,
  mtech_cse: optionalUrl,
  bba: optionalUrl,
  bca: optionalUrl,
  mba: optionalUrl,
  mca: optionalUrl,

  // --- Admissions ---
  important_notice: optionalUrl,
  btech_admission_counselling: optionalUrl,
  registration_form: optionalUrl,
  admission_documents: optionalUrl,
  fee_structure: optionalUrl,
  information_brochure: optionalUrl,
  ipec_newsletter: optionalUrl,
  student_handbook: optionalUrl,
  mode_of_payment: optionalUrl,

  // --- For Students ---
  udbhav_2026: optionalUrl,
  sports_fest_2026: optionalUrl,
  hackathon: optionalUrl,
  scholarship_aicte: optionalUrl,
  scholarship_up_india: optionalUrl,
  scholarship_nsp: optionalUrl,
  old_question_papers: optionalUrl,
  student_verification: optionalUrl,
  student_society: optionalUrl,
  students_rewards: optionalUrl,
  student_counselling: optionalUrl,
  students_gallery: optionalUrl,
  ipec_erp: optionalUrl,

  // Alumni
  key_alumni_ce: optionalUrl,
  key_alumni_ece: optionalUrl,
  key_alumni_cs: optionalUrl,
  key_alumni_eee: optionalUrl,
  key_alumni_it: optionalUrl,
  key_alumni_ash: optionalUrl,
  key_alumni_me: optionalUrl,
  notices_for_passout_students: optionalUrl,

  // --- Research & Development ---
  mdp: optionalUrl,
  fdp_2026: optionalUrl,
  case_writing_workshop_2026: optionalUrl,
  iciscs: optionalUrl,
  projects: optionalUrl,
  ipec_jst: optionalUrl,
  outreach_activities: optionalUrl,

  // --- Innovation & Entrepreneurship ---
  about_ipec_tbi: optionalUrl,
  tbi_services: optionalUrl,
  funded_projects: optionalUrl,
  our_startups: optionalUrl,
  tbi_events: optionalUrl,
  tbi_recognitions: optionalUrl,

  // --- Placement ---
  training_and_placement: optionalUrl,
  placement_director_message: optionalUrl,
  placement_testimonials: optionalUrl,
  recruiters: optionalUrl,
  placement_guidelines_policy: optionalUrl,
  placement_gallery: optionalUrl,
  placement_record: optionalUrl,

  // --- Contact Us ---
  contact_us: optionalUrl,
});

export type LinksFormValues = z.infer<typeof linksSchema>;
