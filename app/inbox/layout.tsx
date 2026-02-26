import MessageList from "./MessageList";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-gray-50">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-[380px] shrink-0 border-r bg-white">
          <div className="h-full overflow-hidden">
            <MessageList />
          </div>
        </aside>

        {/* Detail paneel */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}