"use server";

/**
 * Server Actions for Settings
 *
 * @module app/(dashboard)/student/settings/actions
 */

import {
  updateStudentPreference,
  type StudentPreferencesViewModel,
  type PreferencesResult,
} from "@/lib/preferences-data";

export async function updatePreferenceAction(
  field: keyof Omit<StudentPreferencesViewModel, "id">,
  value: string | boolean | number
): Promise<PreferencesResult> {
  return updateStudentPreference(field, value);
}
