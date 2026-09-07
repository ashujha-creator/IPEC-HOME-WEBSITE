import type { Links } from "@/app/generated/prisma/client";
export type PageLinks = Links;
/** Alias for readability — this is your Prisma `Links` row shape. */
export type LinkUrlKey = Exclude<
  keyof PageLinks,
  "id" | "createdAt" | "updatedAt"
>;

export interface NavItem {
  label: string;
  href: string;
  /** Single DB field whose URL should override `href` when non-empty. */
  dbKey?: LinkUrlKey;
  /**
   * For nav items that represent MULTIPLE DB fields (e.g. "Criterion 1 - 7").
   * Checked in order; the first non-empty value wins. Falls back to `href`
   * if all are empty. Do not combine with `dbKey` on the same item.
   */
  dbKeys?: LinkUrlKey[];
  /** Optional nested dropdown items */
  children?: NavItem[];
}

export const defaultItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about-us",
    children: [
      { label: "Overview", href: "/about-us/overview", dbKey: "overview" },
      {
        label: "Recognition & Accreditations",
        href: "/about-us/recognitions",
        children: [
          {
            label: "NAAC Accreditation",
            href: "/about-us/naac",
            dbKey: "naac_accreditation",
          },
          {
            label: "NBA Accreditations",
            href: "/about-us/nba",
            dbKey: "nba_accreditation",
          },
          { label: "AICTE Approval", href: "/about-us/aicte", dbKey: "aicte" },
          {
            label: "Dr. APJ AKTU Affiliation",
            href: "/about-us/aktu",
            dbKey: "dr_apj_abdul_kalam_technical_university",
          },
        ],
      },
      {
        label: "Vision, Mission & Quality Policy",
        href: "/about-us/vision-mission",
        dbKey: "vision_mission_quality_policy",
      },
      {
        label: "Core Values",
        href: "/about-us/core-values",
        dbKey: "core_values",
      },
      {
        label: "Leadership & Governance",
        href: "/about-us/governance",
        children: [
          {
            label: "Governing Board",
            href: "/about-us/governing-board",
            dbKey: "governing_board",
          },
          {
            label: "Management Committee",
            href: "/about-us/management-committee",
            dbKey: "management_committee",
          },
          {
            label: "Organogram",
            href: "/about-us/organogram",
            dbKey: "organogram",
          },
          {
            label: "Committees",
            href: "/about-us/committees",
            dbKey: "committees",
          },
        ],
      },
      {
        label: "Messages",
        href: "/about-us/messages",
        children: [
          {
            label: "Chairman's Message",
            href: "/about-us/chairmans-message",
            dbKey: "chairman_message",
          },
          {
            label: "Vice Chairman's Message",
            href: "/about-us/vice-chairmans-message",
            dbKey: "vice_chairman_message",
          },
          {
            label: "Director's Message",
            href: "/about-us/directors-message",
            dbKey: "director_message",
          },
          {
            label: "Dean Academic's Message",
            href: "/about-us/dean-academics-message",
            dbKey: "deans_message",
          },
        ],
      },
      {
        label: "Service Rules",
        href: "/about-us/service-rules",
        dbKey: "service_rules",
      },
      {
        label: "Mandatory Disclosure",
        href: "/about-us/mandatory-disclosure",
        dbKey: "mandatory_disclosures",
      },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      {
        label: "Academic Calendar",
        href: "/academics/calendar",
        dbKey: "academic_calendar",
      },
      {
        label: "Important Functionaries",
        href: "/academics/functionaries",
        dbKey: "important_functionaries",
      },
      {
        label: "Syllabus & Ordinances",
        href: "/academics/syllabus-ordinances",
        dbKeys: ["syllabus", "ordinances"],
      },
      {
        label: "Examinations",
        href: "/academics/examinations",
        dbKey: "examination",
      },
      {
        label: "Strategic Plan (2023-2029)",
        href: "/academics/strategic-plan",
        dbKey: "strategic_plan",
      },
      {
        label: "Best Practices",
        href: "/academics/best-practices",
        dbKey: "best_practices",
      },
      {
        label: "International Conferences",
        href: "/academics/international-conferences",
        dbKey: "international_conferences",
      },
      {
        label: "Courses",
        href: "/academics/courses",
        children: [
          {
            label: "B.Tech Computer Science & Engineering",
            href: "/academics/courses/btech-cse",
            dbKey: "btech_cse",
          },
          {
            label: "B.Tech CSE (Data Science)",
            href: "/academics/courses/btech-cse-ds",
            dbKey: "btech_cse_ds",
          },
          {
            label: "B.Tech CSE (AIML)",
            href: "/academics/courses/btech-cse-aiml",
            dbKey: "btech_cse_aiml",
          },
          {
            label: "B.Tech CSE (Artificial Intelligence)",
            href: "/academics/courses/btech-cse-ai",
            dbKey: "btech_cse_ai",
          },
          {
            label: "B.Tech Information Technology",
            href: "/academics/courses/btech-it",
            dbKey: "btech_it",
          },
          {
            label: "B.Tech Electronics & Communication",
            href: "/academics/courses/btech-ece",
            dbKey: "btech_ece",
          },
          {
            label: "B.Tech Mechanical Engineering",
            href: "/academics/courses/btech-me",
            dbKey: "btech_me",
          },
          {
            label: "M.Tech Computer Science & Engineering",
            href: "/academics/courses/mtech-cse",
            dbKey: "mtech_cse",
          },
          { label: "BBA", href: "/academics/courses/bba", dbKey: "bba" },
          { label: "BCA", href: "/academics/courses/bca", dbKey: "bca" },
          { label: "MBA", href: "/academics/courses/mba", dbKey: "mba" },
          { label: "MCA", href: "/academics/courses/mca", dbKey: "mca" },
        ],
      },
      {
        label: "IQAC",
        href: "/academics/iqac",
        children: [
          { label: "IQAC MOM", href: "/academics/iqac/mom", dbKey: "iqac_mom" },
          {
            label: "SSR Cycle 2",
            href: "/academics/iqac/ssr-cycle-2",
            dbKey: "ssr_cycle",
          },
          {
            label: "Extended Profile",
            href: "/academics/iqac/extended-profile",
            dbKey: "extended_profile",
          },
          {
            label: "Criterion 1 - 7",
            href: "/academics/iqac/criterions",
            dbKeys: [
              "criterion_1",
              "criterion_2",
              "criterion_3",
              "criterion_4",
              "criterion_5",
              "criterion_6",
              "criterion_7",
            ],
          },
          {
            label: "NAAC Grade Sheet Cycle 2",
            href: "/academics/iqac/naac-grade-sheet",
            dbKey: "naac_grade_sheet",
          },
          {
            label: "IIQA",
            href: "/academics/iqac/iiqa",
            dbKey: "iiqa_reports",
          },
          {
            label: "Institutional Distinctiveness",
            href: "/academics/iqac/institutional-distinctiveness",
            dbKey: "institutional_distinctiveness",
          },
          {
            label: "Stakeholder Feedback & ATR",
            href: "/academics/iqac/feedback-atr",
            dbKeys: ["feedback", "atr"],
          },
        ],
      },
    ],
  },
  {
    label: "Admission",
    href: "/admission",
    children: [
      {
        label: "Important Notice",
        href: "/admission/notice",
        dbKey: "important_notice",
      },
      {
        label: "B.Tech Admission Through Counselling",
        href: "/admission/btech-counselling",
        dbKey: "btech_admission_counselling",
      },
      {
        label: "Registration Form",
        href: "/admission/registration",
        dbKey: "registration_form",
      },
      {
        label: "Admission Documents",
        href: "/admission/documents",
        dbKey: "admission_documents",
      },
      {
        label: "Fee Structure",
        href: "/admission/fee-structure",
        dbKey: "fee_structure",
      },
      {
        label: "Information Brochure",
        href: "/admission/brochure",
        dbKey: "information_brochure",
      },
      {
        label: "IPEC Newsletter",
        href: "/admission/newsletter",
        dbKey: "ipec_newsletter",
      },
      {
        label: "Student Handbook",
        href: "/admission/handbook",
        dbKey: "student_handbook",
      },
      {
        label: "Mode of Payment",
        href: "/admission/payment-mode",
        dbKey: "mode_of_payment",
      },
    ],
  },
  {
    label: "For Students",
    href: "/for-students",
    children: [
      {
        label: "Events & Fests",
        href: "/for-students/events",
        children: [
          {
            label: "Annual Cultural Fest – Udbhav 2026",
            href: "/for-students/udbhav-2026",
            dbKey: "udbhav_2026",
          },
          {
            label: "Annual Sports Fest 2026",
            href: "/for-students/sports-fest-2026",
            dbKey: "sports_fest_2026",
          },
          {
            label: "Hackathon",
            href: "/for-students/hackathon",
            dbKey: "hackathon",
          },
        ],
      },
      {
        label: "Scholarships",
        href: "/for-students/scholarships",
        children: [
          {
            label: "AICTE",
            href: "/for-students/scholarships/aicte",
            dbKey: "scholarship_aicte",
          },
          {
            label: "UP India",
            href: "/for-students/scholarships/up-india",
            dbKey: "scholarship_up_india",
          },
          {
            label: "NSP",
            href: "/for-students/scholarships/nsp",
            dbKey: "scholarship_nsp",
          },
        ],
      },
      {
        label: "Student Societies & Rewards",
        href: "/for-students/societies-rewards",
        dbKeys: ["student_society", "students_rewards"],
      },
      {
        label: "Student Counselling",
        href: "/for-students/counselling",
        dbKey: "student_counselling",
      },
      {
        label: "Student Verification",
        href: "/for-students/verification",
        dbKey: "student_verification",
      },
      {
        label: "Old Question Papers",
        href: "/for-students/old-question-papers",
        dbKey: "old_question_papers",
      },
      {
        label: "Students Gallery",
        href: "/for-students/gallery",
        dbKey: "students_gallery",
      },
      {
        label: "IPEC ERP Portal",
        href: "/for-students/erp",
        dbKey: "ipec_erp",
      },
      {
        label: "Alumni Corner",
        href: "/for-students/alumni",
        children: [
          {
            label: "Key Alumni - Computer Science",
            href: "/for-students/alumni/cs",
            dbKey: "key_alumni_cs",
          },
          {
            label: "Key Alumni - IT",
            href: "/for-students/alumni/it",
            dbKey: "key_alumni_it",
          },
          {
            label: "Key Alumni - ECE",
            href: "/for-students/alumni/ece",
            dbKey: "key_alumni_ece",
          },
          {
            label: "Key Alumni - EEE",
            href: "/for-students/alumni/eee",
            dbKey: "key_alumni_eee",
          },
          {
            label: "Key Alumni - Civil",
            href: "/for-students/alumni/ce",
            dbKey: "key_alumni_ce",
          },
          {
            label: "Key Alumni - Mechanical",
            href: "/for-students/alumni/me",
            dbKey: "key_alumni_me",
          },
          {
            label: "Key Alumni - ASH",
            href: "/for-students/alumni/ash",
            dbKey: "key_alumni_ash",
          },
          {
            label: "Notices For Passout Students",
            href: "/for-students/alumni/passout-notices",
            dbKey: "notices_for_passout_students",
          },
        ],
      },
    ],
  },
  {
    label: "Research & Development",
    href: "/research-development",
    children: [
      { label: "MDP", href: "/research-development/mdp", dbKey: "mdp" },
      {
        label: "FDP 2026",
        href: "/research-development/fdp-2026",
        dbKey: "fdp_2026",
      },
      { label: "FDP 2025", href: "/research-development/fdp-2025" }, // no matching DB field yet
      {
        label: "Case Writing Workshop 2026",
        href: "/research-development/case-writing-2026",
        dbKey: "case_writing_workshop_2026",
      },
      {
        label: "ICISCS",
        href: "/research-development/iciscs",
        dbKey: "iciscs",
      },
      {
        label: "Projects",
        href: "/research-development/projects",
        dbKey: "projects",
      },
      {
        label: "IPEC JST",
        href: "/research-development/ipec-jst",
        dbKey: "ipec_jst",
      },
      {
        label: "Outreach Activities",
        href: "/research-development/outreach",
        dbKey: "outreach_activities",
      },
    ],
  },
  {
    label: "Innovation & Entrepreneurship",
    href: "/innovation-entrepreneurship",
    children: [
      {
        label: "About IPEC-TBI",
        href: "/innovation-entrepreneurship/about-tbi",
        dbKey: "about_ipec_tbi",
      },
      {
        label: "Our Services",
        href: "/innovation-entrepreneurship/services",
        dbKey: "tbi_services",
      },
      {
        label: "Funded Projects",
        href: "/innovation-entrepreneurship/funded-projects",
        dbKey: "funded_projects",
      },
      {
        label: "Our Startups",
        href: "/innovation-entrepreneurship/startups",
        dbKey: "our_startups",
      },
      {
        label: "Events & Recognitions",
        href: "/innovation-entrepreneurship/events-recognitions",
        dbKeys: ["tbi_events", "tbi_recognitions"],
      },
    ],
  },
  {
    label: "Placements",
    href: "/placements",
    children: [
      {
        label: "IPEC Training & Placement",
        href: "/placements/overview",
        dbKey: "training_and_placement",
      },
      {
        label: "Placement Director's Message",
        href: "/placements/directors-message",
        dbKey: "placement_director_message",
      },
      {
        label: "Placement Guidelines & Policy",
        href: "/placements/policy",
        dbKey: "placement_guidelines_policy",
      },
      {
        label: "Placement Records",
        href: "/placements/records",
        dbKey: "placement_record",
      },
      {
        label: "Our Recruiters",
        href: "/placements/recruiters",
        dbKey: "recruiters",
      },
      {
        label: "Testimonials",
        href: "/placements/testimonials",
        dbKey: "placement_testimonials",
      },
      {
        label: "Gallery",
        href: "/placements/gallery",
        dbKey: "placement_gallery",
      },
    ],
  },
  { label: "Contact Us", href: "/contact-us", dbKey: "contact_us" },
];
