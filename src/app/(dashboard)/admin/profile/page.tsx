import { auth } from "@clerk/nextjs/server";
import { User } from "lucide-react";
import Image from "next/image";

import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { ManageAccountButton } from "@/components/admin/ManageAccountButton";

export default async function AdminProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: {
      username: true,
      email: true,
      full_name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Profil Admin"
        description="Informasi akun administrator Anda."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Nama Lengkap
                  </h3>
                  <p className="font-medium text-lg">{user.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Username
                  </h3>
                  <p className="font-medium">@{user.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="font-medium">{user.email || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Peran
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      ADMIN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Pengaturan Akun
            </h3>
            <Button asChild variant="outline">
              <ManageAccountButton
                mode="profile"
                variant="outline"
                className="w-full sm:w-auto"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
