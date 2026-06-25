import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "./_components/Footer";
import { Navbar } from "./_components/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClerkProvider>
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer />
      </ClerkProvider>
    </>
  );
}
