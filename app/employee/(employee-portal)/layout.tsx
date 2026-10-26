import Sidebar from "@/components/SideBar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0b0e] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 py-10">{children}</main>
    </div>
  );
}