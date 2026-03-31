import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarDetailsSheet } from "@/components/car-details-sheet";
import { 
  Search, Car, CheckCircle2, XCircle, MapPin, ImageIcon, Trash2, Leaf 
} from "lucide-react";
import { useState } from "react";
import { useLanguage, t } from "@/lib/language-context";

export default function AdminDashboard() {
  const { cars, currentUser, deleteCar } = useStore();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
         <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
         <p className="text-muted-foreground">You do not have permission to view this page.</p>
       </div>
    );
  }

  const filteredCars = cars.filter(car => 
    car.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Manage vehicles.</p>
        </div>
      </div>

      <Tabs defaultValue="cars" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-1">
          <TabsTrigger value="cars" className="gap-2"><Car className="w-4 h-4"/> Vehicles</TabsTrigger>
        </TabsList>

        {/* CARS TAB */}
        <TabsContent value="cars" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search VIN, Lot, Make..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Cover</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>VIN / LOT</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCars.map((car) => {
                    const coverPhoto = car.loadingPhotos?.[0] || car.unloadingPhotos?.[0];
                    return (
                      <TableRow key={car.id} className="group">
                        <TableCell>
                           <div className="w-16 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                              {coverPhoto ? (
                                <img src={coverPhoto} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                              )}
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1">{car.year} {car.make} {car.model} {(car.fuelType === 'Hybrid' || car.fuelType === 'Electric') && <Leaf className="w-4 h-4 text-green-500" />}</div>
                          {car.adminNote && (
                            <div className="text-xs text-primary mt-1 italic truncate max-w-[200px]">{car.adminNote}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-mono text-muted-foreground">{car.vin}</span>
                            <span className="font-mono text-muted-foreground">{car.lot}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {car.destination}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-12 text-muted-foreground">Title:</span>
                              {car.hasTitle ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <XCircle className="w-3 h-3 text-red-500"/>}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-12 text-muted-foreground">Key:</span>
                              {car.hasKey ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <XCircle className="w-3 h-3 text-red-500"/>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            Assigned
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <CarDetailsSheet car={car} isAdmin={true}>
                               <Button variant="ghost" size="sm">Edit</Button>
                            </CarDetailsSheet>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(car.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete', language)}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete_vehicle', language)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) deleteCar(deleteConfirm);
                setDeleteConfirm(null);
              }}
            >
              {t('delete', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
