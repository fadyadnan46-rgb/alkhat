import { useStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLanguage, t } from "@/lib/language-context";

export default function AdminSettings() {
  const { config, addMake, deleteMake, addModel, deleteModel, addDestination, deleteDestination, addAuction, deleteAuction, addBranch, deleteBranch, currentUser } = useStore();
  const { language } = useLanguage();
  
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [selectedMakeForModel, setSelectedMakeForModel] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newAuction, setNewAuction] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'make' | 'model' | 'destination' | 'auction' | 'branch', value: string } | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
         <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
         <p className="text-muted-foreground">You do not have permission to view this page.</p>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Makes */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">Vehicle Makes</CardTitle>
              <CardDescription>Manage manufacturer list</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input 
                    placeholder="New Make" 
                    value={newMake} 
                    onChange={(e) => setNewMake(e.target.value)} 
                 />
                 <Button size="icon" onClick={() => {if(newMake) {addMake(newMake); setNewMake("");}}}>
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              <div className="h-[200px] overflow-y-auto space-y-1 border rounded-md p-2">
                 {config.makes.map(make => (
                    <div key={make} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-sm group">
                       <span>{make}</span>
                       <Trash2 
                          className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteConfirm({ type: 'make', value: make })} 
                       />
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Models */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">Vehicle Models</CardTitle>
              <CardDescription>Models for selected make</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                 <Label className="text-xs">Select Make</Label>
                 <select 
                    className="w-full p-2 border rounded-md bg-background text-sm"
                    value={selectedMakeForModel}
                    onChange={(e) => setSelectedMakeForModel(e.target.value)}
                 >
                    <option value="">Select Make...</option>
                    {config.makes.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
              </div>
              <div className="flex gap-2">
                 <Input 
                    placeholder="New Model" 
                    value={newModel} 
                    onChange={(e) => setNewModel(e.target.value)}
                    disabled={!selectedMakeForModel}
                 />
                 <Button size="icon" disabled={!selectedMakeForModel} onClick={() => {if(newModel) {addModel(selectedMakeForModel, newModel); setNewModel("");}}}>
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              <div className="h-[130px] overflow-y-auto space-y-1 border rounded-md p-2">
                 {(config.models[selectedMakeForModel] || []).map(model => (
                    <div key={model} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-sm group">
                       <span>{model}</span>
                       <Trash2 
                          className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteConfirm({ type: 'model', value: model })} 
                       />
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Destinations */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">Destinations</CardTitle>
              <CardDescription>Shipping locations</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input 
                    placeholder="City, Country" 
                    value={newDest} 
                    onChange={(e) => setNewDest(e.target.value)} 
                 />
                 <Button size="icon" onClick={() => {if(newDest) {addDestination(newDest); setNewDest("");}}}>
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              <div className="h-[200px] overflow-y-auto space-y-1 border rounded-md p-2">
                 {config.destinations.map(dest => (
                    <div key={dest} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-sm group">
                       <span>{dest}</span>
                       <Trash2 
                          className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteConfirm({ type: 'destination', value: dest })} 
                       />
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Auctions */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">{t('auction', language)}</CardTitle>
              <CardDescription>Auction companies</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input 
                    placeholder="Auction name" 
                    value={newAuction} 
                    onChange={(e) => setNewAuction(e.target.value)} 
                 />
                 <Button size="icon" onClick={() => {if(newAuction) {addAuction(newAuction); setNewAuction("");}}}>
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              <div className="h-[200px] overflow-y-auto space-y-1 border rounded-md p-2">
                 {(config.auctions || []).map(auction => (
                    <div key={auction} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-sm group">
                       <span>{auction}</span>
                       <Trash2 
                          className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteConfirm({ type: 'auction', value: auction })} 
                       />
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Branches */}
        <Card>
           <CardHeader>
              <CardTitle className="text-base">{t('branch', language)}</CardTitle>
              <CardDescription>Auction branches/locations</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input 
                    placeholder="Branch location" 
                    value={newBranch} 
                    onChange={(e) => setNewBranch(e.target.value)} 
                 />
                 <Button size="icon" onClick={() => {if(newBranch) {addBranch(newBranch); setNewBranch("");}}}>
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              <div className="h-[200px] overflow-y-auto space-y-1 border rounded-md p-2">
                 {(config.branches || []).map(branch => (
                    <div key={branch} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-sm group">
                       <span>{branch}</span>
                       <Trash2 
                          className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteConfirm({ type: 'branch', value: branch })} 
                       />
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete', language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'make' && t('confirm_delete_make', language)}
              {deleteConfirm?.type === 'model' && t('confirm_delete_model', language)}
              {deleteConfirm?.type === 'destination' && t('confirm_delete_destination', language)}
              {deleteConfirm?.type === 'auction' && t('confirm_delete_auction', language)}
              {deleteConfirm?.type === 'branch' && t('confirm_delete_branch', language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', language)}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteConfirm) return;
                if (deleteConfirm.type === 'make') deleteMake(deleteConfirm.value);
                if (deleteConfirm.type === 'model') deleteModel(selectedMakeForModel, deleteConfirm.value);
                if (deleteConfirm.type === 'destination') deleteDestination(deleteConfirm.value);
                if (deleteConfirm.type === 'auction') deleteAuction(deleteConfirm.value);
                if (deleteConfirm.type === 'branch') deleteBranch(deleteConfirm.value);
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
