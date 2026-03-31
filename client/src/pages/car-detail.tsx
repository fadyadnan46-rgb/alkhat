import { useStore, Car } from "@/lib/store";
import { useLocation } from "wouter";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  MapPin, CheckCircle2, XCircle, Upload, File, ExternalLink, Mail, Save, Trash2, ArrowLeft,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/lib/language-context";

export default function CarDetailPage() {
  const [, setLocation] = useLocation();
  const { cars, updateCar, sendUpdateEmail, currentUser, users } = useStore();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [deleteInvoiceConfirm, setDeleteInvoiceConfirm] = useState<string | null>(null);
  const [deletePhotoConfirm, setDeletePhotoConfirm] = useState<{ field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos', index: number } | null>(null);
  const [deleteAllPhotosConfirm, setDeleteAllPhotosConfirm] = useState<'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos' | null>(null);
  const [documentType, setDocumentType] = useState<'invoice' | 'carfax'>('invoice');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const carId = new URLSearchParams(window.location.search).get('id');
  const car = cars.find(c => c.id === carId);

  const { config } = useStore();
  
  const vehicleStatuses = [
    'At Auction',
    'At Warehouse', 
    'Loaded',
    'Shipped',
    'Delivered',
    'Unloaded',
    'Released to Client'
  ];

  const auctionOptions = config.auctions || [];
  const branchOptions = config.branches || [];

  const [formData, setFormData] = useState(() => {
    if (!car) return {
      containerNumber: '',
      bookingNumber: '',
      etd: '',
      eta: '',
      note: '',
      adminNote: '',
      destination: '',
      status: 'At Auction',
      auction: '',
      branch: '',
      hasTitle: false,
      hasKey: false,
      assignedToUserId: '',
      make: '',
      model: '',
      fuelType: '',
      lot: '',
      year: 2024,
    };
    return {
      containerNumber: car.containerNumber || '',
      bookingNumber: car.bookingNumber || '',
      etd: car.etd || '',
      eta: car.eta || '',
      note: car.note || '',
      adminNote: car.adminNote || '',
      destination: car.destination || '',
      status: car.status || 'At Auction',
      auction: car.auction || '',
      branch: car.branch || '',
      hasTitle: car.hasTitle || false,
      hasKey: car.hasKey || false,
      assignedToUserId: car.assignedToUserId || '',
      make: car.make || '',
      model: car.model || '',
      fuelType: car.fuelType || '',
      lot: car.lot || '',
      year: car.year || 2024,
    };
  });

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold">Vehicle Not Found</h1>
        <Button onClick={() => setLocation('/')}>{t('my_garage', language)}</Button>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const assignedUser = users.find(u => u.id === car?.assignedToUserId);

  const handleUpdate = () => {
    updateCar(car.id, {
      containerNumber: formData.containerNumber,
      bookingNumber: formData.bookingNumber,
      etd: formData.etd,
      eta: formData.eta,
      note: formData.note,
      adminNote: formData.adminNote,
      destination: formData.destination,
      status: formData.status,
      auction: formData.auction,
      branch: formData.branch,
      hasTitle: formData.hasTitle,
      hasKey: formData.hasKey,
      assignedToUserId: formData.assignedToUserId,
      make: formData.make,
      model: formData.model,
      fuelType: formData.fuelType,
      lot: formData.lot,
      year: formData.year,
    });
    toast({ title: "Saved", description: "Vehicle details updated successfully." });
  };

  const handleSendUpdate = () => {
    sendUpdateEmail(car.id);
    toast({ title: "Email Sent", description: "Update notification sent to the buyer." });
  };

  const createUploadHandler = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos') => {
    return useCallback(async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        const formData = new FormData();
        acceptedFiles.forEach(file => formData.append('photos', file));
        
        const res = await fetch(`/api/vehicles/${car.id}/photos/${field}`, {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const updatedVehicle = await res.json();
          updateCar(car.id, { [field]: updatedVehicle[field] });
          toast({ title: t('photos_uploaded', language) });
        } else {
          toast({ title: t('upload_failed', language), variant: "destructive" });
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({ title: t('upload_failed', language), variant: "destructive" });
      } finally {
        setUploading(false);
      }
    }, [car.id, updateCar, toast, field, language]);
  };

  const handleInvoiceUpload = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => formData.append('invoices', file));
      formData.append('documentType', documentType);
      
      const res = await fetch(`/api/vehicles/${car.id}/invoices`, {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const updatedVehicle = await res.json();
        updateCar(car.id, { invoices: updatedVehicle.invoices });
        toast({ title: t('invoice_uploaded', language) });
      } else {
        toast({ title: t('upload_failed', language), variant: "destructive" });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: t('upload_failed', language), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [car.id, updateCar, toast, documentType, language]);

  const { getRootProps: getLoadingRoot, getInputProps: getLoadingInput } = useDropzone({ 
    onDrop: createUploadHandler('loadingPhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getUnloadingRoot, getInputProps: getUnloadingInput } = useDropzone({ 
    onDrop: createUploadHandler('unloadingPhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getWarehouseRoot, getInputProps: getWarehouseInput } = useDropzone({ 
    onDrop: createUploadHandler('warehousePhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getAuctionRoot, getInputProps: getAuctionInput } = useDropzone({ 
    onDrop: createUploadHandler('auctionPhotos'), accept: { 'image/*': [] } 
  });

  const { getRootProps: getInvoiceRoot, getInputProps: getInvoiceInput } = useDropzone({ 
    onDrop: handleInvoiceUpload, accept: { 'application/pdf': [], 'image/*': [] } 
  });

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
        toast({ title: t('invoice_deleted', language) });
      } else {
        toast({ title: t('delete_failed', language), variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete invoice error:', error);
      toast({ title: t('delete_failed', language), variant: "destructive" });
    }
    setDeleteInvoiceConfirm(null);
  };

  const deletePhoto = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos', index: number) => {
    const photos = car[field] || [];
    const newPhotos = photos.filter((_, i) => i !== index);
    updateCar(car.id, { [field]: newPhotos });
    toast({ title: t('photo_deleted', language) });
  };

  const deleteAllPhotos = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos') => {
    updateCar(car.id, { [field]: [] });
    toast({ title: t('photos_deleted', language) });
    setDeleteAllPhotosConfirm(null);
  };

  const getSectionName = (field: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos') => {
    switch(field) {
      case 'warehousePhotos': return t('warehouse_pictures', language);
      case 'loadingPhotos': return t('loading_pictures', language);
      case 'unloadingPhotos': return t('unloading_pictures', language);
      case 'auctionPhotos': return t('auction_pictures', language);
      default: return '';
    }
  };

  const openGallery = (photos: string[], startIndex: number) => {
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setZoomLevel(1);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryPhotos([]);
    setCurrentPhotoIndex(0);
    setZoomLevel(1);
  };

  const nextPhoto = () => {
    if (currentPhotoIndex < galleryPhotos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
      setZoomLevel(1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
      setZoomLevel(1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const downloadAllPhotos = async (photos: string[], sectionName: string) => {
    if (!photos || photos.length === 0) return;
    
    for (let i = 0; i < photos.length; i++) {
      const url = photos[i];
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${sectionName.replace(/\s+/g, '_')}_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Download error:', error);
      }
    }
    toast({ title: t('download_complete', language) || 'Download complete' });
  };

  const PhotoGrid = ({ photos, field }: { photos?: string[], field?: 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos' }) => (
    <div className="grid grid-cols-3 gap-2 mt-2">
       {photos && photos.length > 0 ? (
         photos.map((photo, i) => (
           <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden relative group cursor-pointer">
              <img 
                src={photo} 
                className="w-full h-full object-cover" 
                onClick={() => openGallery(photos, i)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity pointer-events-none">
                 <ZoomIn className="w-8 h-8 text-white" />
              </div>
              {isAdmin && field && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletePhotoConfirm({ field, index: i });
                  }}
                  className="absolute top-1 right-1 text-white hover:text-red-400 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
           </div>
         ))
       ) : (
         <div className="col-span-3 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            {t('no_photos', language)}
         </div>
       )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            {isAdmin ? (
              <Input 
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || 2024})}
                className="w-20 h-6 text-sm px-2 mb-2"
                min="1900"
                max="2030"
              />
            ) : (
              <Badge variant="outline" className="mb-2">{car.year}</Badge>
            )}
            {isAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value, model: ''})}
                    className="text-2xl font-bold bg-transparent border-b border-primary focus:outline-none"
                  >
                    {config.makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="text-2xl font-bold bg-transparent border-b border-primary focus:outline-none"
                  >
                    {(config.models[formData.make] || []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    className="text-lg bg-transparent border-b border-primary focus:outline-none ml-2"
                  >
                    <option value=""></option>
                    <option value="Hybrid">{t('hybrid', language)}</option>
                    <option value="Electric">{t('electric', language)}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>VIN: {car.vin} •</span>
                  <span>{t('lot_hash', language)}</span>
                  <Input 
                    value={formData.lot}
                    onChange={(e) => setFormData({...formData, lot: e.target.value})}
                    className="w-32 h-6 text-sm px-2"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{car.make} {car.model} {car.fuelType && <span className="text-lg text-muted-foreground">({car.fuelType})</span>}</h1>
                <p className="text-muted-foreground">VIN: {car.vin} • {t('lot_hash', language)} {car.lot}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button size="lg" onClick={handleUpdate} className="gap-2">
              <Save className="w-4 h-4" /> {t('save_update', language)}
            </Button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-8 max-w-5xl">
        {/* SECTION 1: BASIC DETAILS */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <span>{t('vehicle_details', language)}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">{t('status', language)}</div>
                {isAdmin ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-medium">{car.status || 'At Auction'}</div>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">{t('destination', language)}</div>
                {isAdmin ? (
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                  >
                    <option value="">{language === 'ar' ? 'اختر الوجهة' : 'Select destination'}</option>
                    {formData.destination && !config.destinations.includes(formData.destination) && (
                      <option key={formData.destination} value={formData.destination}>
                        {formData.destination}
                      </option>
                    )}
                    {config.destinations.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-primary" /> {car.destination}
                  </div>
                )}
              </div>
              <div className="border rounded-lg p-4">
                 <div className="text-sm text-muted-foreground mb-3">{t('title_key', language)}</div>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 font-medium text-sm">
                          {(isAdmin ? formData.hasTitle : car.hasTitle) ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                          {(isAdmin ? formData.hasTitle : car.hasTitle) ? t('title_present', language) : t('no_title', language)}
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
                          {(isAdmin ? formData.hasKey : car.hasKey) ? t('key_present', language) : t('no_key', language)}
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
            
            {/* Right Column - Auction Details & Owner */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">{t('assigned_to', language)}</div>
                {isAdmin ? (
                  <select
                    value={formData.assignedToUserId}
                    onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                  >
                    <option value="">{t('select_owner', language)}</option>
                    {users.filter(u => u.role === 'user').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-medium">{assignedUser?.name || 'Not Assigned'}</div>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-semibold text-muted-foreground mb-4">{t('auction_details', language)}</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">{t('auction', language)}</div>
                    {isAdmin ? (
                      <select
                        value={formData.auction}
                        onChange={(e) => setFormData({...formData, auction: e.target.value})}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                      >
                        <option value="">{t('select_auction', language)}</option>
                        {formData.auction && !auctionOptions.includes(formData.auction) && (
                          <option key={formData.auction} value={formData.auction}>
                            {formData.auction}
                          </option>
                        )}
                        {auctionOptions.map((auction) => (
                          <option key={auction} value={auction}>
                            {auction}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-medium">{car.auction || 'Not Selected'}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">{t('branch', language)}</div>
                    {isAdmin ? (
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                      >
                        <option value="">{t('select_branch', language)}</option>
                        {formData.branch && !branchOptions.includes(formData.branch) && (
                          <option key={formData.branch} value={formData.branch}>
                            {formData.branch}
                          </option>
                        )}
                        {branchOptions.map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-medium">{car.branch || 'Not Selected'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
               <Label>{t('notes', language)}</Label>
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
                  <Label className="text-primary">{t('admin_notes', language)}</Label>
                  <Textarea 
                     value={formData.adminNote} 
                     onChange={(e) => setFormData({...formData, adminNote: e.target.value})}
                     className="bg-primary/5 border-primary/20 h-24"
                  />
               </div>
            )}
          </div>
        </div>

        {/* SECTION 2: LOGISTICS */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <MapPin className="w-5 h-5" /> {t('logistics_info', language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('container_number', language)}</Label>
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
              <Label>{t('booking_number', language)}</Label>
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
              <Label>{t('etd', language)}</Label>
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
              <Label>{t('eta', language)}</Label>
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

        {/* SECTION 3: INVOICES & DOCUMENTS */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <File className="w-5 h-5" /> {t('invoice_document', language)}
          </h3>
          {isAdmin && (
            <div className="flex items-center gap-4 mb-4">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as 'invoice' | 'carfax')}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="invoice">{t('invoice', language)}</option>
                <option value="carfax">{t('carfax', language)}</option>
              </select>
              <div {...getInvoiceRoot()} className="cursor-pointer text-sm text-primary hover:underline">
                 <input {...getInvoiceInput()} />
                 {t('upload_invoice', language)}
              </div>
            </div>
          )}
          {car.invoices && car.invoices.length > 0 ? (
            <div className="space-y-3">
              {car.invoices.map((invoice: string | { url: string; type: 'invoice' | 'carfax' }, index: number) => {
                const invoiceUrl = typeof invoice === 'string' ? invoice : invoice.url;
                const invoiceType = typeof invoice === 'string' ? 'invoice' : invoice.type;
                const typeLabel = invoiceType === 'carfax' ? t('carfax', language) : t('invoice', language);
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                     <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-primary" />
                        <div>
                           <div className="font-medium">{typeLabel} #{index + 1}</div>
                           <div className="text-xs text-muted-foreground">{t('pdf_image_document', language)}</div>
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
                           {t('view', language)}
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
                               link.download = fname || `${invoiceType}-${index + 1}`;
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
                           {t('download', language)}
                        </button>
                        {isAdmin && (
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteInvoiceConfirm(invoiceUrl)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        )}
                     </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
               {t('no_invoice_uploaded', language)}
            </div>
          )}
        </div>

        {/* SECTION 4: PHOTOS & DOCUMENTS */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
            <Upload className="w-5 h-5" /> {t('photos_documents', language)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auction Photos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="font-semibold">{t('auction_pictures', language)}</Label>
                 <div className="flex gap-2">
                   {isAdmin && (
                     <div {...getAuctionRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                        <input {...getAuctionInput()} />
                        {t('add', language)}
                     </div>
                   )}
                   {car.auctionPhotos && car.auctionPhotos.length > 0 && (
                     <>
                       <button 
                         onClick={() => downloadAllPhotos(car.auctionPhotos || [], t('auction_pictures', language))}
                         className="text-xs text-primary hover:underline"
                       >
                         {t('download_all', language)}
                       </button>
                       {isAdmin && (
                         <button 
                           onClick={() => setDeleteAllPhotosConfirm('auctionPhotos')}
                           className="text-xs text-destructive hover:underline"
                         >
                           {t('delete_all', language)}
                         </button>
                       )}
                     </>
                   )}
                 </div>
              </div>
              <PhotoGrid photos={car.auctionPhotos} field="auctionPhotos" />
            </div>

            {/* Warehouse Photos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="font-semibold">{t('warehouse_pictures', language)}</Label>
                 <div className="flex gap-2">
                   {isAdmin && (
                     <div {...getWarehouseRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                        <input {...getWarehouseInput()} />
                        {t('add', language)}
                     </div>
                   )}
                   {car.warehousePhotos && car.warehousePhotos.length > 0 && (
                     <>
                       <button 
                         onClick={() => downloadAllPhotos(car.warehousePhotos || [], t('warehouse_pictures', language))}
                         className="text-xs text-primary hover:underline"
                       >
                         {t('download_all', language)}
                       </button>
                       {isAdmin && (
                         <button 
                           onClick={() => setDeleteAllPhotosConfirm('warehousePhotos')}
                           className="text-xs text-destructive hover:underline"
                         >
                           {t('delete_all', language)}
                         </button>
                       )}
                     </>
                   )}
                 </div>
              </div>
              <PhotoGrid photos={car.warehousePhotos} field="warehousePhotos" />
            </div>

            {/* Loading Photos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="font-semibold">{t('loading_pictures', language)}</Label>
                 <div className="flex gap-2">
                   {isAdmin && (
                     <div {...getLoadingRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                        <input {...getLoadingInput()} />
                        {t('add', language)}
                     </div>
                   )}
                   {car.loadingPhotos && car.loadingPhotos.length > 0 && (
                     <>
                       <button 
                         onClick={() => downloadAllPhotos(car.loadingPhotos || [], t('loading_pictures', language))}
                         className="text-xs text-primary hover:underline"
                       >
                         {t('download_all', language)}
                       </button>
                       {isAdmin && (
                         <button 
                           onClick={() => setDeleteAllPhotosConfirm('loadingPhotos')}
                           className="text-xs text-destructive hover:underline"
                         >
                           {t('delete_all', language)}
                         </button>
                       )}
                     </>
                   )}
                 </div>
              </div>
              <PhotoGrid photos={car.loadingPhotos} field="loadingPhotos" />
            </div>

            {/* Unloading Photos */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="font-semibold">{t('unloading_pictures', language)}</Label>
                 <div className="flex gap-2">
                   {isAdmin && (
                     <div {...getUnloadingRoot()} className="cursor-pointer text-xs text-primary hover:underline">
                        <input {...getUnloadingInput()} />
                        {t('add', language)}
                     </div>
                   )}
                   {car.unloadingPhotos && car.unloadingPhotos.length > 0 && (
                     <>
                       <button 
                         onClick={() => downloadAllPhotos(car.unloadingPhotos || [], t('unloading_pictures', language))}
                         className="text-xs text-primary hover:underline"
                       >
                         {t('download_all', language)}
                       </button>
                       {isAdmin && (
                         <button 
                           onClick={() => setDeleteAllPhotosConfirm('unloadingPhotos')}
                           className="text-xs text-destructive hover:underline"
                         >
                           {t('delete_all', language)}
                         </button>
                       )}
                     </>
                   )}
                 </div>
              </div>
              <PhotoGrid photos={car.unloadingPhotos} field="unloadingPhotos" />
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteInvoiceConfirm} onOpenChange={(open) => !open && setDeleteInvoiceConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete', language)}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete_invoice', language)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteInvoiceConfirm) {
                  deleteInvoice(deleteInvoiceConfirm);
                }
              }}
            >
              {t('delete', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletePhotoConfirm} onOpenChange={(open) => !open && setDeletePhotoConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete', language)}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete_photo', language)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletePhotoConfirm) {
                  deletePhoto(deletePhotoConfirm.field, deletePhotoConfirm.index);
                }
                setDeletePhotoConfirm(null);
              }}
            >
              {t('delete', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteAllPhotosConfirm} onOpenChange={(open) => !open && setDeleteAllPhotosConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_all', language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_all_photos', language).replace('{section}', deleteAllPhotosConfirm ? getSectionName(deleteAllPhotosConfirm) : '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteAllPhotosConfirm) {
                  deleteAllPhotos(deleteAllPhotosConfirm);
                }
              }}
            >
              {t('delete_all', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {galleryOpen && galleryPhotos.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeGallery}
        >
          <button 
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="text-white hover:text-gray-300 bg-white/10 rounded-full p-2"
            >
              <ZoomOut className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="text-white hover:text-gray-300 bg-white/10 rounded-full p-2"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
            <span className="text-white text-sm flex items-center px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm z-10">
            {currentPhotoIndex + 1} / {galleryPhotos.length}
          </div>

          {currentPhotoIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-white/10 rounded-full p-2 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {currentPhotoIndex < galleryPhotos.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-white/10 rounded-full p-2 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div 
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={galleryPhotos[currentPhotoIndex]} 
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
