"use client";

/**
 * Attendance Form Component
 *
 * SESSION-BASED attendance input form.
 * CRITICAL: Uses session dropdown selector, NOT calendar date picker.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { saveAttendanceAction, getAttendanceAction } from "../actions";

// ============================================
// Types
// ============================================

interface Session {
  id: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  hasAttendance: boolean;
}

interface Enrollment {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
}

type AttendanceStatus = "PRESENT" | "SICK" | "PERMISSION" | "ALPHA" | "LATE";

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  color: string;
}[] = [
  { value: "PRESENT", label: "Hadir", color: "text-emerald-600" },
  { value: "LATE", label: "Terlambat", color: "text-orange-600" },
  { value: "SICK", label: "Sakit", color: "text-amber-600" },
  { value: "PERMISSION", label: "Izin", color: "text-blue-600" },
  { value: "ALPHA", label: "Alpha", color: "text-red-600" },
];

interface AttendanceFormProps {
  sessions: Session[];
  enrollments: Enrollment[];
  extracurricularId: string;
}

export function AttendanceForm({
  sessions,
  enrollments,
  extracurricularId,
}: AttendanceFormProps) {
  const router = useRouter();

  // State
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingRecords, setHasExistingRecords] = useState(false);

  // Get selected session details
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Fetch existing attendance when session changes
  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedSessionId) return;

    setIsLoading(true);
    try {
      const records = await getAttendanceAction(selectedSessionId);

      // Initialize all enrollments with default PRESENT
      const map: Record<string, AttendanceStatus> = {};
      enrollments.forEach((e) => {
        map[e.enrollmentId] = "PRESENT";
      });

      // Override with existing records
      let hasExisting = false;
      records.forEach((record) => {
        map[record.enrollmentId] = record.status;
        hasExisting = true;
      });

      setAttendanceMap(map);
      setHasExistingRecords(hasExisting);
    } catch {
      toast.error("Gagal memuat data absensi");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSessionId, enrollments]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchExistingAttendance();
    } else {
      setAttendanceMap({});
      setHasExistingRecords(false);
    }
  }, [selectedSessionId, fetchExistingAttendance]);

  // Handle status change
  const handleStatusChange = (
    enrollmentId: string,
    status: AttendanceStatus,
  ) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [enrollmentId]: status,
    }));
  };

  // Handle save
  async function handleSave() {
    if (!selectedSessionId) {
      toast.error("Pilih pertemuan terlebih dahulu");
      return;
    }

    setIsSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(
        ([enrollmentId, status]) => ({
          enrollmentId,
          status,
        }),
      );

      const result = await saveAttendanceAction(
        selectedSessionId,
        extracurricularId,
        records,
      );

      if (result.success) {
        toast.success("Absensi berhasil disimpan!");
        setHasExistingRecords(true);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan absensi");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  }

  // Empty state - no sessions
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Belum ada pertemuan. Generate pertemuan terlebih dahulu di halaman
          Pertemuan.
        </p>
      </div>
    );
  }

  // Empty state - no enrollments
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Belum ada anggota aktif untuk diabsenkan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Selector (DROPDOWN, NOT CALENDAR) */}
      <div className="space-y-2">
        <Label htmlFor="session">Pilih Pertemuan</Label>
        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
          <SelectTrigger className="w-full md:w-[400px]">
            <SelectValue placeholder="Pilih pertemuan untuk diisi absensi" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                <div className="flex items-center gap-2">
                  <span>
                    {format(new Date(session.date), "EEEE, dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                  <span className="text-slate-500">
                    ({session.start_time} - {session.end_time})
                  </span>
                  {session.hasAttendance && (
                    <Badge variant="secondary" className="ml-2">
                      Ada absensi
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Session Details */}
      {selectedSession && (
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>
              {format(new Date(selectedSession.date), "EEEE, dd MMMM yyyy", {
                locale: idLocale,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>
              {selectedSession.start_time} - {selectedSession.end_time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span>{selectedSession.location}</span>
          </div>
          {hasExistingRecords && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-300"
            >
              Memperbarui data yang ada
            </Badge>
          )}
        </div>
      )}

      {/* Attendance Table */}
      {selectedSessionId && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-slate-500">Memuat data...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  {enrollments.length} Siswa
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-center">
                      Status Kehadiran
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment, index) => (
                    <TableRow key={enrollment.enrollmentId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {enrollment.studentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            NIS: {enrollment.studentNis}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.studentClass}</TableCell>
                      <TableCell>
                        <RadioGroup
                          value={
                            attendanceMap[enrollment.enrollmentId] || "PRESENT"
                          }
                          onValueChange={(value) =>
                            handleStatusChange(
                              enrollment.enrollmentId,
                              value as AttendanceStatus,
                            )
                          }
                          className="flex flex-wrap gap-3 justify-center"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center gap-1.5"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={`${enrollment.enrollmentId}-${option.value}`}
                              />
                              <Label
                                htmlFor={`${enrollment.enrollmentId}-${option.value}`}
                                className={`text-sm cursor-pointer ${
                                  attendanceMap[enrollment.enrollmentId] ===
                                  option.value
                                    ? option.color + " font-medium"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || enrollments.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Simpan Absensi
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* Empty state when no session selected */}
      {!selectedSessionId && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            Pilih pertemuan di atas untuk mulai mengisi absensi.
          </p>
        </div>
      )}
    </div>
  );
}
