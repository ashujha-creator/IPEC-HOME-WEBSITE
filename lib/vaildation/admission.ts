// lib/validations/admission.ts
import { z } from "zod";

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date of birth is required",
  }),
  gender: z.enum(["MALE", "FEMALE"]),
});

export const academicInfoSchema = z.object({
  programApplied: z.string().min(1, "Please select a program"),
  intendedTerm: z.string().min(1, "Please select an entry term"),
});



export const fullAdmissionSchema = personalInfoSchema
  .merge(academicInfoSchema)

export type AdmissionFormData = z.infer<typeof fullAdmissionSchema>;