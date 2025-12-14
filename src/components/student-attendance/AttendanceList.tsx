"use client";

/**
 * Attendance List Component
 * 
 * Client Component that displays attendance records with grouping toggle.
 * Supports Date-first and Extracurricular-first grouping modes.
 * 
 * @module components/student-attendance/AttendanceList
 */

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Calendar,
  Layers,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Thermometer,
} from "lucide-react";
// Import from client-safe types module (no server-only code)
import type { 
  AttendanceViewModel, 
  AttendanceDateGroup, 
  AttendanceEkskulGroup,
  AttendanceStatus,
} from "@/lib/attendance-types";
import { 
  groupByDate, 
  groupByExtracurricular, 
  formatDateIndonesian,
  statusLabels,
  statusColors,
} from "@/lib/attendance-types";

// ============================================
// Types
// ============================================

type GroupingMode = "date" | "extracurricular";

interface AttendanceListProps {
  records: AttendanceViewModel[];
}

// ============================================
// Status Icon Mapping
// ============================================

function getStatusIcon(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return <CheckCircle2 className="h-4 w-4" />;
    case "ALPHA":
      return <XCircle className="h-4 w-4" />;
    case "LATE":
      return <Clock className="h-4 w-4" />;
    case "PERMISSION":
      return <AlertCircle className="h-4 w-4" />;
    case "SICK":
      return <Thermometer className="h-4 w-4" />;
    default:
      return null;
  }
}

// ============================================
// Attendance Row Component
// ============================================

interface AttendanceRowProps {
  record: AttendanceViewModel;
  showDate?: boolean;
  showEkskul?: boolean;
}

function AttendanceRow({ record, showDate = true, showEkskul = true }: AttendanceRowProps) {
  const colors = statusColors[record.status];
  
  return (
    <Link href={`/student/enrollments/${record.enrollmentId}`}>
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
        <div className="flex-1 min-w-0">
          {showEkskul && (
            <p className="font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {record.extracurricular.name}
            </p>
          )}
          {showDate && (
            <p className={`text-sm text-slate-500 ${showEkskul ? '' : 'font-medium text-slate-900 dark:text-white'}`}>
              {formatDateIndonesian(record.date)}
            </p>
          )}
          {record.session && (
            <p className="text-xs text-slate-400 mt-0.5">
              {record.session.startTime} - {record.session.endTime}
            </p>
          )}
          {record.notes && (
            <p className="text-xs text-slate-400 mt-1 italic truncate">
              {record.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${colors.bg} ${colors.text} flex items-center gap-1`}>
            {getStatusIcon(record.status)}
            {statusLabels[record.status]}
          </Badge>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Date Group Component
// ============================================

function DateGroupView({ group }: { group: AttendanceDateGroup }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-violet-500" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {group.dateString}
        </h3>
        <span className="text-xs text-slate-400">
          ({group.records.length} kehadiran)
        </span>
      </div>
      <div className="space-y-2 pl-6">
        {group.records.map((record) => (
          <AttendanceRow 
            key={record.id} 
            record={record} 
            showDate={false}
            showEkskul={true}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Extracurricular Group Component
// ============================================

function EkskulGroupView({ group }: { group: AttendanceEkskulGroup }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-violet-500" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {group.extracurricular.name}
        </h3>
        <Badge variant="outline" className="text-xs">
          {group.extracurricular.category}
        </Badge>
        <span className="text-xs text-slate-400">
          ({group.records.length} kehadiran)
        </span>
      </div>
      <div className="space-y-2 pl-6">
        {group.records.map((record) => (
          <AttendanceRow 
            key={record.id} 
            record={record} 
            showDate={true}
            showEkskul={false}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function AttendanceList({ records }: AttendanceListProps) {
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("date");

  const dateGroups = groupByDate(records);
  const ekskulGroups = groupByExtracurricular(records);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-violet-500" />
            Riwayat Kehadiran
          </CardTitle>
          
          {/* Grouping Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={groupingMode === "date" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGroupingMode("date")}
              className={groupingMode === "date" ? "" : "text-slate-600 dark:text-slate-400"}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Tanggal
            </Button>
            <Button
              variant={groupingMode === "extracurricular" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGroupingMode("extracurricular")}
              className={groupingMode === "extracurricular" ? "" : "text-slate-600 dark:text-slate-400"}
            >
              <Layers className="w-4 h-4 mr-1.5" />
              Ekstrakurikuler
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupingMode === "date" ? (
            dateGroups.map((group) => (
              <DateGroupView key={group.dateString} group={group} />
            ))
          ) : (
            ekskulGroups.map((group) => (
              <EkskulGroupView key={group.extracurricular.id} group={group} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
