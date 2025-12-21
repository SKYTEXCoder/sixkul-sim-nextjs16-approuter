"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExtracurricularHealth,
  HealthStatus,
} from "@/lib/admin/admin-data-aggregation";

interface ExtrasHealthListProps {
  data: ExtracurricularHealth[];
}

export function ExtrasHealthList({ data }: ExtrasHealthListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<"ALL" | HealthStatus>("ALL");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pembinaName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFilter =
        healthFilter === "ALL" || item.healthStatus === healthFilter;

      return matchSearch && matchFilter;
    });
  }, [data, searchQuery, healthFilter]);

  const getHealthBadge = (status: HealthStatus) => {
    switch (status) {
      case "HEALTHY":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Sehat
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
            <Activity className="w-3 h-3 mr-1" /> Perhatian
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Kritis
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="secondary" className="text-slate-500">
            <XCircle className="w-3 h-3 mr-1" /> Nonaktif
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Status Kesehatan Ekstrakurikuler</CardTitle>
            <CardDescription>
              Monitor aktivitas dan partisipasi semua kegiatan
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari ekskul atau pembina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-[200px] md:w-[300px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              />
            </div>
            <Select
              value={healthFilter}
              onValueChange={(v) => setHealthFilter(v as "ALL" | HealthStatus)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="HEALTHY">Sehat</SelectItem>
                <SelectItem value="WARNING">Perhatian</SelectItem>
                <SelectItem value="CRITICAL">Kritis</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ekstrakurikuler</TableHead>
                <TableHead>Pembina</TableHead>
                <TableHead className="text-center">Sesi (30 Hari)</TableHead>
                <TableHead className="text-center">Anggota</TableHead>
                <TableHead className="text-center">Status Kesehatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.pembinaName ? (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.pembinaName}
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500 italic">
                          Belum ada pembina
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">
                          {item.totalSessions30Days}
                        </span>
                        {item.lastSessionDate && (
                          <span className="text-[10px] text-slate-400">
                            Terakhir:{" "}
                            {new Date(item.lastSessionDate).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{item.membersCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getHealthBadge(item.healthStatus)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/ekstrakurikuler/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-500"
                  >
                    Tidak ada data ditemukan.
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
