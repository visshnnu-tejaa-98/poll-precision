import { SocketProvider } from "@/app/utils/SocketProvider";

export default function PollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
