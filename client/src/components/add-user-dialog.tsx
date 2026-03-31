import { useStore, User } from "@/lib/store";
import { useState, useRef } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil, Camera, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/lib/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const addUser = useStore((state) => state.addUser);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addUser({
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'admin' | 'user', 
    });

    toast({ title: t('user_created', language), description: t('user_added_system', language) });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" /> {t('add_user_simple', language)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create_new_user', language)}</DialogTitle>
          <DialogDescription>{t('add_new_user_portal', language)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('full_name', language)}</Label>
            <Input id="name" name="name" required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{t('username', language)}</Label>
            <Input id="username" name="username" required placeholder="johndoe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password', language)}</Label>
            <Input id="password" name="password" type="text" required placeholder={t('secret_password', language)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('role', language)}</Label>
            <Select name="role" required defaultValue="user">
              <SelectTrigger>
                <SelectValue placeholder={t('select_role', language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('user', language)}</SelectItem>
                <SelectItem value="admin">{t('admin', language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">{t('create_user', language)}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const updateUser = useStore((state) => state.updateUser);
  const uploadProfilePicture = useStore((state) => state.uploadProfilePicture);
  const deleteUser = useStore((state) => state.deleteUser);
  const currentUser = useStore((state) => state.currentUser);
  const { toast } = useToast();
  const { language } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updates: Partial<User> = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      role: formData.get('role') as 'admin' | 'user',
    };

    const newPassword = formData.get('newPassword') as string;
    if (newPassword && newPassword.trim() !== '') {
      updates.password = newPassword;
    }

    updateUser(user.id, updates);
    toast({ title: t('user_updated', language), description: t('user_details_saved', language) });
    setOpen(false);
  };

  const handleDelete = () => {
    deleteUser(user.id);
    toast({ title: language === 'ar' ? 'تم حذف المستخدم' : 'User Deleted', description: language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User has been deleted successfully' });
    setOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: language === 'ar' ? 'خطأ' : 'Error', 
        description: language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' : 'File size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadProfilePicture(user.id, file);
      toast({ 
        title: language === 'ar' ? 'تم التحديث' : 'Updated', 
        description: language === 'ar' ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'Profile picture updated successfully' 
      });
    } catch (error) {
      toast({ 
        title: language === 'ar' ? 'خطأ' : 'Error', 
        description: language === 'ar' ? 'فشل في تحميل الصورة' : 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const canDelete = currentUser?.id !== user.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}><Pencil className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('edit_user', language)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  <UserIcon className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-upload-profile-picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleProfilePictureChange}
                data-testid="input-profile-picture"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'انقر على أيقونة الكاميرا لتغيير الصورة' : 'Click the camera icon to change photo'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t('full_name', language)}</Label>
            <Input id="name" name="name" required defaultValue={user.name} data-testid="input-edit-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{t('username', language)}</Label>
            <Input id="username" name="username" required defaultValue={user.username} data-testid="input-edit-username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('role', language)}</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger data-testid="select-edit-role">
                <SelectValue placeholder={t('select_role', language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('user', language)}</SelectItem>
                <SelectItem value="admin">{t('admin', language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{language === 'ar' ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)' : 'New Password (leave empty to keep current)'}</Label>
            <Input id="newPassword" name="newPassword" type="text" placeholder={language === 'ar' ? 'أدخل كلمة مرور جديدة' : 'Enter new password'} data-testid="input-edit-new-password" />
          </div>
          <DialogFooter className="flex gap-2">
            {canDelete && !showDeleteConfirm && (
              <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} data-testid="button-delete-user">
                {language === 'ar' ? 'حذف المستخدم' : 'Delete User'}
              </Button>
            )}
            {showDeleteConfirm && (
              <div className="flex gap-2">
                <Button type="button" variant="destructive" onClick={handleDelete} data-testid="button-confirm-delete-user">
                  {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} data-testid="button-cancel-delete-user">
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            )}
            <Button type="submit" data-testid="button-save-user">{t('save_changes', language)}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
