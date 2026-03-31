import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditUserDialog, AddUserDialog } from "@/components/add-user-dialog";
import { User as UserIcon } from "lucide-react";
import { useLanguage, t } from "@/lib/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersPage() {
  const { currentUser, users } = useStore();
  const { language } = useLanguage();

  if (currentUser?.role !== 'admin') {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
         <h1 className="text-2xl font-bold text-destructive">{t('access_denied', language)}</h1>
         <p className="text-muted-foreground">{t('no_permission', language)}</p>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('users', language)}</h1>
          <p className="text-muted-foreground mt-2">{t('manage_users', language)}</p>
        </div>
        <AddUserDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} data-testid={`card-user-${user.id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.name}
              </CardTitle>
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
                <AvatarFallback className="bg-muted">
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.username}</div>
              <div className="flex justify-between items-end mt-2">
                 <p className="text-xs text-muted-foreground capitalize">
                   {t('role', language)} {t(user.role === 'admin' ? 'admin' : 'user', language)}
                 </p>
                 <EditUserDialog user={user} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
