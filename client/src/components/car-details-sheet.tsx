import { useStore, Car } from "@/lib/store";
import { useState, useCallback } from "react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, Calendar, Key, FileText, CheckCircle2, XCircle, Upload, File, ExternalLink, Mail, Save, Trash2
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";

interface CarDetailsSheetProps {
  car: Car;
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function CarDetailsSheet({ car, children, isAdmin = false }: CarDetailsSheetProps) {
  const { updateCar, sendUpdateEmail } = useStore();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  // Local state for editing logistics directly in the sheet
  const [formData, setFormData] = useState({
    containerNumber: car.containerNumber || '',
    bookingNumber: car.bookingNumber || '',
    etd: car.etd || '',
    eta: car.eta || '',
    note: car.note || '',
    adminNote: car.adminNote || '',
    hasTitle: car.hasTitle || false,
    hasKey: car.hasKey || false,
  });

  const handleUpdate = () => {
    updateCar(car.id, {
      containerNumber: formData.containerNumber,
      bookingNumber: formData.bookingNumber,
      etd: formData.etd,
      eta: formData.eta,
      note: formData.note,
      adminNote: formData.adminNote,
      hasTitle: formData.hasTitle,
      hasKey: formData.hasKey,
    });
    toast({ title: "Saved", description: "Vehicle details updated successfully." });
  };

  const deletePhoto = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos', index: number) => {
    const photos = car[field] || [];
    const newPhotos = photos.filter((_, i) => i !== index);
    updateCar(car.id, { [field]: newPhotos });
    toast({ title: "Photo Deleted" });
  };

  const handleSendUpdate = () => {
    sendUpdateEmail(car.id);
    toast({ title: "Email Sent", description: "Update notification sent to the buyer." });
  };

  // Helper for uploads - uses server-side storage
  const createUploadHandler = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'invoices') => {
    return useCallback(async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        if (field === 'invoices') {
          const formData = new FormData();
          acceptedFiles.forEach(file => formData.append('invoices', file));
          
          const res = await fetch(`/api/vehicles/${car.id}/invoices`, {
            method: 'POST',
            body: formData,
          });
          
          if (res.ok) {
            const updatedVehicle = await res.json();
            updateCar(car.id, { invoices: updatedVehicle.invoices });
            toast({ title: "Invoice Uploaded" });
          } else {
            toast({ title: "Upload Failed", variant: "destructive" });
          }
        } else {
          const formData = new FormData();
          acceptedFiles.forEach(file => formData.append('photos', file));
          
          const res = await fetch(`/api/vehicles/${car.id}/photos/${field}`, {
            method: 'POST',
            body: formData,
          });
          
          if (res.ok) {
            const updatedVehicle = await res.json();
            updateCar(car.id, { [field]: updatedVehicle[field] });
            toast({ title: "Photos Uploaded" });
          } else {
            toast({ title: "Upload Failed", variant: "destructive" });
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({ title: "Upload Failed", variant: "destructive" });
      } finally {
        setUploading(false);
      }
    }, [car.id, updateCar, toast, field]);
  };

  const deleteInvoice = async (invoiceUrl: string) => {
    try {
      const res = await fetch(`/api/vehicles/${car.id}/invoices`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceUrl }),
      });
      
      if (res.ok) {
        const updatedVehicle = await res.json();
        updateCar(car.id, { invoices: updatedVehicle.invoices });
        toast({ title: "Invoice Deleted" });
      } else {
        toast({ title: "Delete Failed", variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete invoice error:', error);
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  const { getRootProps: getLoadingRoot, getInputProps: getLoadingInput } = useDropzone({ 
    onDrop: createUploadHandler('loadingPhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getUnloadingRoot, getInputProps: getUnloadingInput } = useDropzone({ 
    onDrop: createUploadHandler('unloadingPhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getWarehouseRoot, getInputProps: getWarehouseInput } = useDropzone({ 
    onDrop: createUploadHandler('warehousePhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getInvoiceRoot, getInputProps: getInvoiceInput } = useDropzone({ 
    onDrop: createUploadHandler('invoices'), accept: { 'application/pdf': [], 'image/*': [] } 
  });

  const PhotoGrid = ({ photos, onDelete, field }: { photos?: string[], onDelete?: (index: number) => void, field?: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' }) => (
    <div className="grid grid-cols-3 gap-2 mt-2">
       {photos && photos.length > 0 ? (
         photos.map((photo, i) => (
           <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden relative group">
              <img src={photo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                 <Button 
                   variant="ghost" 
                   size="sm"
                   onClick={() => window.open(photo, '_blank')}
                   className="text-white hover:text-white hover:bg-transparent p-0"
                 >
                    <ExternalLink className="w-6 h-6" />
                 </Button>
                 {isAdmin && onDelete && (
                   <button 
                     onClick={() => onDelete(i)}
                     className="text-white hover:text-red-400 transition-colors"
                   >
                     <Trash2 className="w-6 h-6" />
                   </button>
                 )}
              </div>
           </div>
         ))
       ) : (
         <div className="col-span-3 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            No photos
         </div>
       )}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <div className="p-6 border-b sticky top-0 bg-background z-10">
           <SheetHeader>
             <div className="flex items-center justify-between">
                <div>
                   <Badge variant="outline" className="mb-2">{car.year}</Badge>
                   <SheetTitle className="text-2xl">{car.make} {car.model}</SheetTitle>
                   <SheetDescription>VIN: {car.vin} • LOT: {car.lot}</SheetDescription>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="secondary" onClick={handleSendUpdate} className="gap-2">
                        <Mail className="w-4 h-4" /> Send to Buyer
                      </Button>
                      <Button size="sm" onClick={handleUpdate} className="gap-2">
                        <Save className="w-4 h-4" /> Update
                      </Button>
                    </>
                  )}
                </div>
             </div>
           </SheetHeader>
        </div>

        <div className="p-6 pb-4 space-y-6">
           {/* SECTION 1: BASIC DETAILS */}
           <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                 <FileText className="w-5 h-5" /> Vehicle Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Destination</div>
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-primary" /> {car.destination}
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                       <div className="text-sm text-muted-foreground mb-3">Status</div>
                       <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 font-medium text-sm">
                                {(isAdmin ? formData.hasTitle : car.hasTitle) ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                                {(isAdmin ? formData.hasTitle : car.hasTitle) ? "Title Present" : "No Title"}
                             </div>
                             {isAdmin && (
                               <Checkbox 
                                 checked={formData.hasTitle}
                                 onCheckedChange={(checked) => setFormData({...formData, hasTitle: checked as boolean})}
                               />
                             )}
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 font-medium text-sm">
                                {(isAdmin ? formData.hasKey : car.hasKey) ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                                {(isAdmin ? formData.hasKey : car.hasKey) ? "Key Present" : "No Key"}
                             </div>
                             {isAdmin && (
                               <Checkbox 
                                 checked={formData.hasKey}
                                 onCheckedChange={(checked) => setFormData({...formData, hasKey: checked as boolean})}
                               />
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label>Notes</Label>
                       {isAdmin ? (
                          <Textarea 
                            value={formData.note} 
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                            className="h-24"
                          />
                       ) : (
                          <div className="bg-muted/30 p-3 rounded-md text-sm h-24 overflow-y-auto">
                             {car.note || "No notes."}
                          </div>
                       )}
                    </div>
                    {isAdmin && (
                       <div className="space-y-2">
                          <Label className="text-primary">Admin Notes</Label>
                          <Textarea 
                             value={formData.adminNote} 
                             onChange={(e) => setFormData({...formData, adminNote: e.target.value})}
                             className="bg-primary/5 border-primary/20 h-24"
                          />
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* SECTION 2: LOGISTICS */}
           <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                 <MapPin className="w-5 h-5" /> Logistics Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Container Number</Label>
                    {isAdmin ? (
                       <Input 
                          value={formData.containerNumber} 
                          onChange={(e) => setFormData({...formData, containerNumber: e.target.value})}
                          className="uppercase font-mono"
                       />
                    ) : (
                       <div className="p-2 bg-muted/10 rounded font-mono">{car.containerNumber || "N/A"}</div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Label>Booking Number</Label>
                    {isAdmin ? (
                       <Input 
                          value={formData.bookingNumber} 
                          onChange={(e) => setFormData({...formData, bookingNumber: e.target.value})}
                          className="uppercase font-mono"
                       />
                    ) : (
                       <div className="p-2 bg-muted/10 rounded font-mono">{car.bookingNumber || "N/A"}</div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Label>ETD (Departure)</Label>
                    {isAdmin ? (
                       <Input 
                          type="date"
                          value={formData.etd} 
                          onChange={(e) => setFormData({...formData, etd: e.target.value})}
                       />
                    ) : (
                       <div className="p-2 bg-muted/10 rounded">{car.etd || "Pending"}</div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Label>ETA (Arrival)</Label>
                    {isAdmin ? (
                       <Input 
                          type="date"
                          value={formData.eta} 
                          onChange={(e) => setFormData({...formData, eta: e.target.value})}
                       />
                    ) : (
                       <div className="p-2 bg-muted/10 rounded">{car.eta || "Pending"}</div>
                    )}
                 </div>
              </div>
           </div>

           {/* SECTION 3: PHOTOS & DOCUMENTS */}
           <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                 <Upload className="w-5 h-5" /> Photos & Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Warehouse Photos - NEW & FIRST */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <Label className="font-semibold">Warehouse Pictures</Label>
                       {isAdmin && (
                         <div {...getWarehouseRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                            <input {...getWarehouseInput()} />
                            + Add
                         </div>
                       )}
                    </div>
                    <PhotoGrid photos={car.warehousePhotos} onDelete={(i) => deletePhoto('warehousePhotos', i)} field="warehousePhotos" />
                 </div>

                 {/* Loading Photos */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <Label className="font-semibold">Loading Pictures</Label>
                       {isAdmin && (
                         <div {...getLoadingRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                            <input {...getLoadingInput()} />
                            + Add
                         </div>
                       )}
                    </div>
                    <PhotoGrid photos={car.loadingPhotos} onDelete={(i) => deletePhoto('loadingPhotos', i)} field="loadingPhotos" />
                 </div>

                 {/* Unloading Photos */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <Label className="font-semibold">Unloading Pictures</Label>
                       {isAdmin && (
                         <div {...getUnloadingRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                            <input {...getUnloadingInput()} />
                            + Add
                         </div>
                       )}
                    </div>
                    <PhotoGrid photos={car.unloadingPhotos} onDelete={(i) => deletePhoto('unloadingPhotos', i)} field="unloadingPhotos" />
                 </div>
              </div>
              
              {/* Invoices */}
              <div className="pt-4 border-t">
                 <div className="flex justify-between items-center mb-4">
                    <Label className="font-semibold">Invoices</Label>
                    {isAdmin && (
                      <div {...getInvoiceRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                         <input {...getInvoiceInput()} />
                         + Upload Invoice
                      </div>
                    )}
                 </div>
                 {car.invoices && car.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {car.invoices.map((invoiceUrl, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                           <div className="flex items-center gap-3">
                              <File className="w-8 h-8 text-primary" />
                              <div>
                                 <div className="font-medium">Invoice #{index + 1}</div>
                                 <div className="text-xs text-muted-foreground">PDF / Image Document</div>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button
                                 type="button"
                                 className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   e.preventDefault();
                                   try {
                                     const filename = invoiceUrl.split('/').pop();
                                     const response = await fetch(`/api/files-base64/${filename}`);
                                     if (!response.ok) throw new Error('Failed to fetch file');
                                     const { data, mimeType } = await response.json();
                                     
                                     const byteCharacters = atob(data);
                                     const byteNumbers = new Array(byteCharacters.length);
                                     for (let i = 0; i < byteCharacters.length; i++) {
                                       byteNumbers[i] = byteCharacters.charCodeAt(i);
                                     }
                                     const byteArray = new Uint8Array(byteNumbers);
                                     const blob = new Blob([byteArray], { type: mimeType });
                                     
                                     const url = URL.createObjectURL(blob);
                                     window.open(url, '_blank');
                                   } catch (err) {
                                     console.error('Error viewing file:', err);
                                     alert('Error viewing file. Please try again.');
                                   }
                                 }}
                              >
                                 <ExternalLink className="w-4 h-4" />
                                 View
                              </button>
                              <button
                                 type="button"
                                 className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   e.preventDefault();
                                   try {
                                     const filename = invoiceUrl.split('/').pop();
                                     const response = await fetch(`/api/files-base64/${filename}`);
                                     if (!response.ok) throw new Error('Failed to fetch file');
                                     const { data, mimeType, filename: fname } = await response.json();
                                     
                                     const byteCharacters = atob(data);
                                     const byteNumbers = new Array(byteCharacters.length);
                                     for (let i = 0; i < byteCharacters.length; i++) {
                                       byteNumbers[i] = byteCharacters.charCodeAt(i);
                                     }
                                     const byteArray = new Uint8Array(byteNumbers);
                                     const blob = new Blob([byteArray], { type: mimeType });
                                     
                                     const url = URL.createObjectURL(blob);
                                     const link = document.createElement('a');
                                     link.href = url;
                                     link.download = fname || `invoice-${index + 1}`;
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                     URL.revokeObjectURL(url);
                                   } catch (err) {
                                     console.error('Error downloading file:', err);
                                     alert('Error downloading file. Please try again.');
                                   }
                                 }}
                              >
                                 Download
                              </button>
                              {isAdmin && (
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteInvoice(invoiceUrl)}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="p-4 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                       No invoice uploaded
                    </div>
                 )}
              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}