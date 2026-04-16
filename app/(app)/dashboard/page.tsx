import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Panel
      </h1>
      <p className="text-muted-foreground">
        Witaj{session?.user?.name ? `, ${session.user.name}` : ""}.
      </p>
    </div>
  );
}
