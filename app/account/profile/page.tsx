import { UserProfile } from "@clerk/nextjs";

export default function AccountProfilePage() {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your sign-in methods and profile information.
      </p>
      <div className="mt-6 flex justify-center overflow-x-auto">
        <UserProfile path="/account/profile" routing="path" />
      </div>
    </div>
  );
}
