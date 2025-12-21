"use client";

import { PembinaActivityMetrics } from "@/lib/admin/admin-data-aggregation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Activity, Calendar } from "lucide-react";

interface PembinaActivityListProps {
  metrics: PembinaActivityMetrics[];
}

export function PembinaActivityList({ metrics }: PembinaActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Monitoring Aktivitas Pembina
            </CardTitle>
            <CardDescription>
              Pantau keaktifan pembina dalam mengelola ekstrakurikuler (30 hari
              terakhir).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pembina</TableHead>
                <TableHead className="text-center">Ekskul Diampu</TableHead>
                <TableHead className="text-center">
                  Sesi Dibuat (30 Hari)
                </TableHead>
                <TableHead className="text-right">Aktivitas Terakhir</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length > 0 ? (
                metrics.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-slate-50 dark:bg-slate-900"
                      >
                        {item.assignedExtracurricularsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-bold">
                          {item.sessionsCreated30Days}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-600 dark:text-slate-400">
                      {item.lastSessionDate
                        ? new Date(item.lastSessionDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Belum ada aktivitas"}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.sessionsCreated30Days > 0 ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-500"
                  >
                    Data pembina tidak tersedia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
