"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Edit2, Trash2, Megaphone } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  authorName: string;
  isAdminView?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({
  id,
  title,
  content,
  createdAt,
  authorName,
  isAdminView = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  // Format date safely
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(createdAt), "EEEE, d MMMM yyyy", {
        locale: idLocale,
      });
    } catch (e) {
      return "Tanggal tidak valid";
    }
  }, [createdAt]);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
              >
                <Megaphone className="w-3 h-3 mr-1" />
                Pengumuman Sekolah
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            <CardTitle className="text-xl font-bold font-heading line-clamp-1">
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
              Oleh:{" "}
              <span className="font-medium text-foreground">{authorName}</span>
            </CardDescription>
          </div>

          {isAdminView && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(id)}
                  title="Edit Pengumuman"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onDelete && onDelete(id)}
                  title="Hapus Pengumuman"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-3">
          {content}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="link"
          className="px-0 h-auto text-primary font-medium"
          asChild
        >
          {/* Link will be handled by the parent or this button just triggers a navigation intent */}
          <span>Baca Selengkapnya</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
