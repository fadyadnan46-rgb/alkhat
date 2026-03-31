import { useStore, Car } from "@/lib/store";
import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditCarDialogProps {
  car: Car;
}

export function EditCarDialog({ car }: EditCarDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateCar, users, config, sendUpdateEmail } = useStore();
  const { toast } = useToast();
  const [selectedMake, setSelectedMake] = useState<string>(car.make);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateCar(car.id, {
      vin: formData.get('vin') as string,
      lot: formData.get('lot') as string,
      year: Number(formData.get('year')),
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      destination: formData.get('destination') as string,
      hasTitle: formData.get('hasTitle') === 'on',
      hasKey: formData.get('hasKey') === 'on',
      note: formData.get('note') as string,
      adminNote: formData.get('adminNote') as string,
      assignedToUserId: formData.get('assignedToUserId') as string,
      
      containerNumber: formData.get('containerNumber') as string,
      bookingNumber: formData.get('bookingNumber') as string,
      etd: formData.get('etd') as string,
      eta: formData.get('eta') as string,
    });

    toast({ title: "Car Updated", description: "Vehicle details have been updated." });
    setOpen(false);
  };

  const handleSendUpdate = () => {
    sendUpdateEmail(car.id);
    toast({ title: "Notification Sent", description: "Email update sent to the buyer." });
  }

  const availableModels = selectedMake ? (config.models[selectedMake] || []) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>Modify vehicle details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN #</Label>
              <Input id="vin" name="vin" required defaultValue={car.vin} className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot">LOT #</Label>
              <Input id="lot" name="lot" required defaultValue={car.lot} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" required defaultValue={car.year} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Select name="make" required onValueChange={setSelectedMake} defaultValue={car.make}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {config.makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select name="model" required defaultValue={car.model}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select name="destination" required defaultValue={car.destination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Destination" />
                </SelectTrigger>
                <SelectContent>
                  {config.destinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logistics Info - NEW */}
          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Logistics Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor="containerNumber">Container #</Label>
                 <Input id="containerNumber" name="containerNumber" defaultValue={car.containerNumber} placeholder="MSKU..." className="uppercase" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="bookingNumber">Booking #</Label>
                 <Input id="bookingNumber" name="bookingNumber" defaultValue={car.bookingNumber} placeholder="BK..." className="uppercase" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="etd">ETD</Label>
                 <Input id="etd" name="etd" type="date" defaultValue={car.etd} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="eta">ETA</Label>
                 <Input id="eta" name="eta" type="date" defaultValue={car.eta} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-2">
              <Checkbox id="hasTitle" name="hasTitle" defaultChecked={car.hasTitle} />
              <Label htmlFor="hasTitle">Title Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="hasKey" name="hasKey" defaultChecked={car.hasKey} />
              <Label htmlFor="hasKey">Key Available</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToUserId">Assign To User</Label>
            <Select name="assignedToUserId" required defaultValue={car.assignedToUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(u => u.role === 'user').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Visible to User)</Label>
            <Textarea id="note" name="note" defaultValue={car.note} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNote" className="text-primary">Admin Note (Internal Only)</Label>
            <Textarea id="adminNote" name="adminNote" defaultValue={car.adminNote} className="bg-primary/5 border-primary/20" />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button type="button" variant="secondary" onClick={handleSendUpdate} className="gap-2">
               Send Update to Buyer
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
