import { Settings, Shield } from "lucide-react";

import { ManageAccountButton } from "@/components/admin/ManageAccountButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppearanceSection } from "./_components/AppearanceSection";

export const metadata = {
  title: "Pengaturan Admin | SIXKUL",
  description: "Kelola preferensi dan pengaturan akun admin.",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi tampilan dan keamanan akun Anda."
      />

      <div className="grid gap-6">
        <AppearanceSection />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan Akun
            </CardTitle>
            <CardDescription>
              Pengaturan password dan keamanan dikelola melalui layanan akun
              terpusat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <ManageAccountButton
                mode="security"
                variant="outline"
                className="w-full sm:w-auto"
              />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
