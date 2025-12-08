/**
 * Shadcn UI Test Page
 * 
 * Test page to verify all Shadcn UI components are working correctly.
 * Visit: http://localhost:3000/test-ui
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Check,
  User,
  Users,
  BookOpen,
  Trophy,
} from "lucide-react";

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            SIXKUL UI Components Test
          </h1>
          <p className="text-muted-foreground">
            Shadcn UI components are working correctly if you see styled
            elements below.
          </p>
        </div>

        {/* Buttons & Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Buttons & Badges
            </CardTitle>
            <CardDescription>
              Various button styles and status badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Active</Badge>
              <Badge variant="secondary">Pending</Badge>
              <Badge variant="destructive">Rejected</Badge>
              <Badge variant="outline">Alumni</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Robotik</CardTitle>
                <CardDescription>Teknologi</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mempelajari dan mengembangkan robot sederhana untuk kompetisi.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge>Active</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>24 siswa</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Basket</CardTitle>
                <CardDescription>Olahraga</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ekstrakurikuler basket untuk mengembangkan kemampuan olahraga.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge>Active</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>18 siswa</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.png" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Budi Santoso</CardTitle>
                <CardDescription>Pembina</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mengelola 3 ekstrakurikuler
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="secondary">PEMBINA</Badge>
            </CardFooter>
          </Card>
        </div>

        {/* Form & Dialog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Input</CardTitle>
              <CardDescription>Input fields with labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="student@sixkul.sch.id"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="••••••••" type="password" />
              </div>
              <Button className="w-full">Login</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialog & Popover</CardTitle>
              <CardDescription>Modal and date picker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Open Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin mendaftar ke ekstrakurikuler ini?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Batal</Button>
                    <Button>Daftar</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Pilih Tanggal
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>Attendance list example</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>Siti Nurhaliza</TableCell>
                  <TableCell>2024001</TableCell>
                  <TableCell>XII IPA 1</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Hadir</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2</TableCell>
                  <TableCell>Ahmad Rizki</TableCell>
                  <TableCell>2024002</TableCell>
                  <TableCell>XII IPA 2</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Alpha</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>3</TableCell>
                  <TableCell>Dewi Lestari</TableCell>
                  <TableCell>2024003</TableCell>
                  <TableCell>XII IPS 1</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Sakit</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-green-700">
            ✅ All Components Working!
          </h2>
          <p className="text-green-600 mt-2">
            Shadcn UI is properly configured. You can now build the SIXKUL
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
