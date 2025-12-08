"use client";

/**
 * Pembina Attendance Management Page
 *
 * Allows Pembina to take attendance for their extracurricular activities.
 *
 * Features:
 * - Extracurricular selector
 * - Schedule-based date picker (only valid days selectable)
 * - Attendance table with status radio buttons
 * - Existing attendance indicator
 * - Batch save functionality
 *
 * @module app/(dashboard)/pembina/attendance/page
 */

import { useState, useEffect, useCallback } from "react";
import { format, getDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon, Loader2, AlertCircle, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ============================================
// Type Definitions
// ============================================

interface Extracurricular {
  id: string;
  name: string;
  category: string;
  status: string;
  _count: {
    enrollments: number;
  };
}

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface Student {
  enrollmentId: string;
  student: {
    id: string;
    name: string;
    class: string;
    nis: string;
  };
}

interface AttendanceRecord {
  enrollmentId: string;
  status: string;
  notes: string | null;
}

type AttendanceStatus = "PRESENT" | "SICK" | "PERMISSION" | "ALPHA";

// Map day names to JavaScript getDay() values (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "PRESENT", label: "Hadir", color: "text-emerald-600" },
  { value: "SICK", label: "Sakit", color: "text-amber-600" },
  { value: "PERMISSION", label: "Izin", color: "text-blue-600" },
  { value: "ALPHA", label: "Alpha", color: "text-red-600" },
];

// ============================================
// Main Component
// ============================================

export default function PembinaAttendancePage() {
  // State for ekstracurricular selection
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [selectedEkskul, setSelectedEkskul] = useState<string>("");
  const [loadingEkskul, setLoadingEkskul] = useState(true);

  // State for students and schedules
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // State for date selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // State for attendance
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // State for saving
  const [saving, setSaving] = useState(false);

  // ============================================
  // Fetch Extracurriculars
  // ============================================

  useEffect(() => {
    async function fetchExtracurriculars() {
      try {
        const response = await fetch("/api/pembina/extracurriculars");
        const data = await response.json();

        if (data.success) {
          setExtracurriculars(data.data);
          // Auto-select if only one extracurricular
          if (data.data.length === 1) {
            setSelectedEkskul(data.data[0].id);
          }
        } else {
          toast.error(data.message || "Gagal memuat data ekskul");
        }
      } catch (error) {
        console.error("Error fetching extracurriculars:", error);
        toast.error("Terjadi kesalahan saat memuat data ekskul");
      } finally {
        setLoadingEkskul(false);
      }
    }

    fetchExtracurriculars();
  }, []);

  // ============================================
  // Fetch Students & Schedules when Ekskul changes
  // ============================================

  useEffect(() => {
    if (!selectedEkskul) {
      setStudents([]);
      setSchedules([]);
      setSelectedDate(undefined);
      setAttendanceMap({});
      return;
    }

    async function fetchStudentsAndSchedules() {
      setLoadingStudents(true);
      try {
        const response = await fetch(
          `/api/pembina/extracurriculars/${selectedEkskul}/students`
        );
        const data = await response.json();

        if (data.success) {
          setStudents(data.data.students);
          setSchedules(data.data.schedules);
          // Reset date when changing ekskul
          setSelectedDate(undefined);
          setAttendanceMap({});
          setHasExistingRecords(false);
        } else {
          toast.error(data.message || "Gagal memuat data siswa");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Terjadi kesalahan saat memuat data siswa");
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudentsAndSchedules();
  }, [selectedEkskul]);

  // ============================================
  // Fetch Existing Attendance when Date changes
  // ============================================

  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedEkskul || !selectedDate) return;

    setLoadingAttendance(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `/api/attendance?extracurricularId=${selectedEkskul}&date=${dateStr}`
      );
      const data = await response.json();

      if (data.success) {
        setExistingRecords(data.data.records);
        setHasExistingRecords(data.data.hasExistingRecords);

        // Pre-populate attendance map with existing records
        const map: Record<string, AttendanceStatus> = {};

        // Initialize all students with no status
        students.forEach((student) => {
          map[student.enrollmentId] = "PRESENT"; // Default
        });

        // Override with existing records
        data.data.records.forEach((record: AttendanceRecord) => {
          map[record.enrollmentId] = record.status as AttendanceStatus;
        });

        setAttendanceMap(map);
      } else {
        toast.error(data.message || "Gagal memuat data absensi");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Terjadi kesalahan saat memuat data absensi");
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedEkskul, selectedDate, students]);

  useEffect(() => {
    if (selectedDate && students.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedDate, students.length, fetchExistingAttendance]);

  // ============================================
  // Date Picker Disabled Days Logic
  // ============================================

  const allowedDays = schedules.map((s) => DAY_MAP[s.day_of_week.toUpperCase()]);

  const isDateDisabled = (date: Date): boolean => {
    // Disable future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) return true;

    // Disable days not in schedule
    if (allowedDays.length === 0) return true;
    const dayOfWeek = getDay(date);
    return !allowedDays.includes(dayOfWeek);
  };

  // ============================================
  // Handle Attendance Status Change
  // ============================================

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [enrollmentId]: status,
    }));
  };

  // ============================================
  // Save Attendance
  // ============================================

  const handleSaveAttendance = async () => {
    if (!selectedDate || !selectedEkskul) {
      toast.error("Pilih ekskul dan tanggal terlebih dahulu");
      return;
    }

    if (students.length === 0) {
      toast.error("Tidak ada siswa untuk diabsenkan");
      return;
    }

    setSaving(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const records = Object.entries(attendanceMap).map(([enrollmentId, status]) => ({
        enrollmentId,
        status,
      }));

      const response = await fetch("/api/attendance/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateStr,
          records,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Absensi berhasil disimpan!");
        setHasExistingRecords(true);
        // Refresh existing records
        fetchExistingAttendance();
      } else {
        toast.error(data.message || "Gagal menyimpan absensi");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Terjadi kesalahan saat menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Input Absensi 📋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Kelola kehadiran anggota ekstrakurikuler Anda.
        </p>
      </div>

      {/* Controls Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Ekskul & Tanggal</CardTitle>
          <CardDescription>
            Pilih ekstrakurikuler dan tanggal untuk mengisi absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Extracurricular Select */}
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">
                Ekstrakurikuler
              </Label>
              {loadingEkskul ? (
                <div className="h-9 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-slate-500">Memuat...</span>
                </div>
              ) : extracurriculars.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Anda belum mengelola ekstrakurikuler apapun.
                </p>
              ) : (
                <Select value={selectedEkskul} onValueChange={setSelectedEkskul}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih ekstrakurikuler" />
                  </SelectTrigger>
                  <SelectContent>
                    {extracurriculars.map((ekskul) => (
                      <SelectItem key={ekskul.id} value={ekskul.id}>
                        {ekskul.name} ({ekskul._count.enrollments} anggota)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date Picker */}
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Tanggal</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!selectedEkskul || schedules.length === 0}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "EEEE, dd MMMM yyyy", { locale: idLocale })
                    ) : (
                      <span className="text-muted-foreground">Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedEkskul && schedules.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Tidak ada jadwal untuk ekskul ini
                </p>
              )}
              {schedules.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Jadwal:{" "}
                  {schedules
                    .map((s) => s.day_of_week.charAt(0) + s.day_of_week.slice(1).toLowerCase())
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Attendance Warning */}
      {hasExistingRecords && selectedDate && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Data absensi sudah ada
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Anda sedang memperbarui data absensi untuk tanggal{" "}
              {format(selectedDate, "dd MMMM yyyy", { locale: idLocale })}.
            </p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {selectedEkskul && selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Daftar Hadir
                </CardTitle>
                <CardDescription>
                  {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: idLocale })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {students.length} Siswa
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStudents || loadingAttendance ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-slate-500">Memuat data...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Belum ada siswa yang terdaftar dengan status aktif
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-center">Status Kehadiran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.enrollmentId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.student.name}</p>
                            <p className="text-xs text-slate-500">NIS: {student.student.nis}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.student.class}</TableCell>
                        <TableCell>
                          <RadioGroup
                            value={attendanceMap[student.enrollmentId] || "PRESENT"}
                            onValueChange={(value) =>
                              handleStatusChange(student.enrollmentId, value as AttendanceStatus)
                            }
                            className="flex flex-wrap gap-3 justify-center"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <div key={option.value} className="flex items-center gap-1.5">
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${student.enrollmentId}-${option.value}`}
                                />
                                <Label
                                  htmlFor={`${student.enrollmentId}-${option.value}`}
                                  className={`text-sm cursor-pointer ${
                                    attendanceMap[student.enrollmentId] === option.value
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
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={saving || students.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                  >
                    {saving ? (
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
          </CardContent>
        </Card>
      )}

      {/* Empty State when no selection */}
      {(!selectedEkskul || !selectedDate) && !loadingEkskul && extracurriculars.length > 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Pilih ekstrakurikuler dan tanggal untuk mulai mengisi absensi
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
