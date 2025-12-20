"use client";

/**
 * EkskulDetailClient Component
 *
 * Client-side wrapper for ekstrakurikuler detail page interactive elements.
 * Contains Edit, Archive, and PEMBINA assignment functionality.
 *
 * @module components/admin/EkskulDetailClient
 */

import { EditEkskulDialog } from "./EditEkskulDialog";
import { ArchiveEkskulButton } from "./ArchiveEkskulButton";
import { PembinaAssignmentForm } from "./PembinaAssignmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PembinaOption {
  id: string;
  nip: string;
  user: {
    id: string;
    full_name: string;
    email: string | null;
  };
}

interface EkskulDetailClientProps {
  ekskulId: string;
  name: string;
  category: string;
  description: string | null;
  status: string;
  currentPembina: {
    id: string;
    nip: string;
    user: {
      full_name: string;
    };
  };
  availablePembina: PembinaOption[];
}

export function EkskulDetailClient({
  ekskulId,
  name,
  category,
  description,
  status,
  currentPembina,
  availablePembina,
}: EkskulDetailClientProps) {
  return (
    <>
      {/* Header Actions */}
      <div className="flex gap-2">
        <EditEkskulDialog
          ekskulId={ekskulId}
          currentName={name}
          currentCategory={category}
          currentDescription={description}
        />
        {status === "ACTIVE" && (
          <ArchiveEkskulButton ekskulId={ekskulId} ekskulName={name} />
        )}
      </div>
    </>
  );
}

// Separate component for the PEMBINA assignment card (sidebar)
export function PembinaAssignmentCard({
  ekskulId,
  currentPembina,
  availablePembina,
}: {
  ekskulId: string;
  currentPembina: {
    id: string;
    nip: string;
    user: {
      full_name: string;
    };
  };
  availablePembina: PembinaOption[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-500" />
          Pembina
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Pembina Display */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium">
            {currentPembina.user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {currentPembina.user.full_name}
            </p>
            <p className="text-sm text-slate-500">NIP: {currentPembina.nip}</p>
          </div>
        </div>

        {/* PEMBINA Assignment Form */}
        <PembinaAssignmentForm
          ekskulId={ekskulId}
          currentPembinaId={currentPembina.id}
          availablePembina={availablePembina}
        />
      </CardContent>
    </Card>
  );
}
