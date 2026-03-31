import { useStore } from "@/lib/store";
import { useState } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import logo from "@assets/logo_1764504161984.png";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function AddCarDialog() {
  const [open, setOpen] = useState(false);
  const { addCar, users, config } = useStore();
  const { toast } = useToast();
  const { language } = useLanguage();

  // Local state for cascading make/model select
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  
  // Popover states
  const [makeOpen, setMakeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await addCar({
      vin: formData.get('vin') as string,
      lot: formData.get('lot') as string,
      year: Number(formData.get('year')),
      make: selectedMake,
      model: selectedModel,
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

    if (result.success) {
      toast({ title: t('car_added', language), description: t('vehicle_added_system', language) });
      setOpen(false);
      // Reset
      setSelectedMake("");
      setSelectedModel("");
    } else if (result.code === 'DUPLICATE_VIN') {
      toast({ title: t('duplicate_vin', language), description: t('duplicate_vin_message', language), variant: "destructive" });
    } else {
      toast({ title: t('error', language), description: result.error || t('add_vehicle_failed', language), variant: "destructive" });
    }
  };

  const availableModels = selectedMake ? (config.models[selectedMake] || []) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5" /> {t('add_vehicle', language)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
              <img src={logo} alt="ALKHAT ALNAAQIL" className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{t('add_new_vehicle', language)}</DialogTitle>
              <DialogDescription>{t('enter_vehicle_details', language)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vin">{t('vin_hash', language)}</Label>
              <Input id="vin" name="vin" required placeholder="1HG..." className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot">{t('lot_hash', language)}</Label>
              <Input id="lot" name="lot" required placeholder="459..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">{t('year', language)}</Label>
              <Input id="year" name="year" type="number" required min="1900" max="2026" defaultValue="2024" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SEARCHABLE MAKE */}
            <div className="space-y-2 flex flex-col">
              <Label>{t('make', language)}</Label>
              <Popover open={makeOpen} onOpenChange={setMakeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={makeOpen} className="justify-between">
                    {selectedMake || t('select_make', language)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder={t('search_make', language)} />
                    <CommandList>
                      <CommandEmpty>{t('no_make_found', language)}</CommandEmpty>
                      <CommandGroup>
                        {config.makes.map((make) => (
                          <CommandItem key={make} value={make} onSelect={(currentValue) => {
                            setSelectedMake(currentValue === selectedMake ? "" : currentValue);
                            setSelectedModel(""); // Reset model
                            setMakeOpen(false);
                          }}>
                            <Check className={cn("mr-2 h-4 w-4", selectedMake === make ? "opacity-100" : "opacity-0")} />
                            {make}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" name="make" value={selectedMake} required />
            </div>

            {/* SEARCHABLE MODEL */}
            <div className="space-y-2 flex flex-col">
              <Label>{t('model', language)}</Label>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={modelOpen} className="justify-between" disabled={!selectedMake}>
                    {selectedModel || t('select_model', language)}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder={t('search_model', language)} />
                    <CommandList>
                      <CommandEmpty>{t('no_model_found', language)}</CommandEmpty>
                      <CommandGroup>
                        {availableModels.map((model) => (
                          <CommandItem key={model} value={model} onSelect={(currentValue) => {
                            setSelectedModel(currentValue === selectedModel ? "" : currentValue);
                            setModelOpen(false);
                          }}>
                            <Check className={cn("mr-2 h-4 w-4", selectedModel === model ? "opacity-100" : "opacity-0")} />
                            {model}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" name="model" value={selectedModel} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">{t('destination', language)}</Label>
              <select 
                id="destination" 
                name="destination" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">{t('select_destination', language)}</option>
                {config.destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Logistics Info */}
          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">{t('logistics_info', language)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor="containerNumber">{t('container', language)}</Label>
                 <Input id="containerNumber" name="containerNumber" placeholder="MSKU..." className="uppercase" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="bookingNumber">{t('booking', language)}</Label>
                 <Input id="bookingNumber" name="bookingNumber" placeholder="BK..." className="uppercase" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="etd">{t('etd_departure', language)}</Label>
                 <Input id="etd" name="etd" type="date" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="eta">{t('eta_arrival', language)}</Label>
                 <Input id="eta" name="eta" type="date" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-2">
              <Checkbox id="hasTitle" name="hasTitle" />
              <Label htmlFor="hasTitle">{t('title_available', language)}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="hasKey" name="hasKey" />
              <Label htmlFor="hasKey">{t('key_available', language)}</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToUserId">{t('assign_to_user', language)}</Label>
            <select 
              name="assignedToUserId" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">{t('select_user', language)}</option>
              {users.filter(u => u.role === 'user').map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('note_visible_to_user', language)}</Label>
            <Textarea id="note" name="note" placeholder={t('any_public_notes', language)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNote" className="text-primary">{t('admin_note_internal', language)}</Label>
            <Textarea id="adminNote" name="adminNote" placeholder={t('private_admin_notes', language)} className="bg-primary/5 border-primary/20" />
          </div>

          <DialogFooter>
            <Button type="submit">{t('save_vehicle', language)}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
