/**
 * Ekskul Type Definitions
 *
 * Shared types for extracurricular-related components.
 *
 * @module types/ekskul
 */

export interface ExtracurricularCardData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  pembina: {
    user: {
      full_name: string;
    };
  };
  enrollments: Array<{ id: string; status: string }>;
}
