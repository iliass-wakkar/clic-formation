export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start">
      <main className="flex-1 min-h-[calc(100vh-4rem)] bg-slate-50">
        {children}
      </main>
    </div>
  );
}
