import { getDepartments } from "@/lib/queries";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const departments = await getDepartments();
  return (
    <>
      <Header departments={departments} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer departments={departments} />
    </>
  );
}
