import { Sidebar } from "./_components/Sidebar";
import { getCurrentLoggedInUser } from "../utils";
import { MobileHeader } from "./_components/MobileHeader";
import { ToastProvider } from "../_components/Toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firstName, lastName } = await getCurrentLoggedInUser();

  return (
    <ToastProvider>
      <div className="bg-surface min-h-screen flex w-full">
        <Sidebar firstName={firstName} lastName={lastName} />
        <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
          <MobileHeader />
          <div className="flex-1 p-margin-mobile md:p-margin-desktop max-w-[1280px] mx-auto w-full space-y-stack-lg">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
