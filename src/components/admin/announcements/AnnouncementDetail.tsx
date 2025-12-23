"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Megaphone, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AnnouncementDetailProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    author: {
      full_name: string;
      username: string;
    };
  };
  backUrl: string;
  actions?: React.ReactNode;
}

export function AnnouncementDetail({
  announcement,
  backUrl,
  actions,
}: AnnouncementDetailProps) {
  const router = useRouter();

  const formattedDate = format(
    new Date(announcement.created_at),
    "EEEE, d MMMM yyyy - HH:mm",
    {
      locale: idLocale,
    }
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:pl-2 transition-all"
          onClick={() => router.push(backUrl)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      <Card className="overflow-hidden shadow-sm border-t-4 border-t-primary">
        <CardHeader className="bg-muted/10 pb-6 space-y-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 w-fit"
            >
              <Megaphone className="w-3 h-3 mr-1" />
              Pengumuman Sekolah
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              {announcement.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                Oleh:{" "}
                <span className="font-medium text-foreground">
                  {announcement.author.full_name}
                </span>
              </span>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6 md:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
