import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Chatbot } from './Chatbot';

export function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background relative">
            {/* Cinematic Background Gradient blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-500/5 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px]"></div>
            </div>

            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative z-10">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
                <Chatbot />
            </div>
        </div>
    );
}
