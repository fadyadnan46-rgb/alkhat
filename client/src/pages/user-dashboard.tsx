import { useStore } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddCarDialog } from "@/components/add-car-dialog";
import { Search, MapPin, Key, ImageIcon, Trash2, Edit, Leaf } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useLanguage, t } from "@/lib/language-context";

export default function UserDashboard() {
  const { cars, currentUser, deleteCar, users } = useStore();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    make: "all",
    year: "all",
    destination: "all",
  });

  const myCars = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return cars;
    return cars.filter(car => car.assignedToUserId === currentUser.id);
  }, [cars, currentUser]);

  const filteredCars = useMemo(() => {
    return myCars.filter(car => {
      const matchesSearch = 
        car.vin.toLowerCase().includes(filters.search.toLowerCase()) ||
        car.lot.toLowerCase().includes(filters.search.toLowerCase()) ||
        car.model.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesMake = filters.make === 'all' || car.make === filters.make;
      const matchesYear = filters.year === 'all' || car.year.toString() === filters.year;
      const matchesDestination = filters.destination === 'all' || car.destination === filters.destination;

      return matchesSearch && matchesMake && matchesYear && matchesDestination;
    });
  }, [myCars, filters]);

  const uniqueMakes = Array.from(new Set(myCars.map(c => c.make)));
  const uniqueYears = Array.from(new Set(myCars.map(c => c.year))).sort().reverse();
  const uniqueDestinations = Array.from(new Set(myCars.map(c => c.destination)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('my_garage', language)}</h1>
          <p className="text-muted-foreground">{t('manage_assigned', language)}</p>
        </div>
        {currentUser?.role === 'admin' && <AddCarDialog />}
      </div>

      <Card className="bg-muted/30 shadow-none border-none">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 col-span-full lg:col-span-1">
              <Label className="text-xs font-medium text-muted-foreground">{t('search', language)}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder={t('vin_lot_model', language)}
                  className="pl-9 bg-background"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t('make', language)}</Label>
              <Select 
                value={filters.make} 
                onValueChange={(val) => setFilters({...filters, make: val})}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('all_makes', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_makes', language)}</SelectItem>
                  {uniqueMakes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t('year', language)}</Label>
              <Select 
                value={filters.year} 
                onValueChange={(val) => setFilters({...filters, year: val})}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('all_years', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_years', language)}</SelectItem>
                  {uniqueYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t('destination', language)}</Label>
              <Select 
                value={filters.destination} 
                onValueChange={(val) => setFilters({...filters, destination: val})}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('all_destinations', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_destinations', language)}</SelectItem>
                  {uniqueDestinations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filteredCars.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             {t('no_vehicles_found', language)}
           </div>
        ) : (
          filteredCars.map((car) => {
            const ownerUser = users.find(u => u.id === car.assignedToUserId);
            return (
              <Card key={car.id} className="group overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/50"
                onClick={() => setLocation(`/car?id=${car.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('vehicle', language)}</div>
                        <div className="font-semibold group-hover:text-primary transition-colors flex items-center gap-1">{car.year} {car.make} {car.model} {(car.fuelType === 'Hybrid' || car.fuelType === 'Electric') && <Leaf className="w-4 h-4 text-green-500" />}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('vin', language)}</div>
                        <div className="font-mono text-sm font-medium">{car.vin}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('lot', language)}</div>
                        <div className="font-mono text-sm font-medium">{car.lot}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('assigned_to', language)}</div>
                        <div className="text-sm font-medium">{ownerUser?.name || t('select_owner', language)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('destination', language)}</div>
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {car.destination}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('status', language)}</div>
                        <div className="flex gap-2">
                          <Badge variant={car.hasTitle ? "default" : "destructive"} className="text-[10px]">
                            {car.hasTitle ? t('title_ok', language) : t('no_title', language)}
                          </Badge>
                          <Badge variant={car.hasKey ? "default" : "destructive"} className="text-[10px]">
                            {car.hasKey ? t('key', language) : t('no_key', language)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(car.id);
                      }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
