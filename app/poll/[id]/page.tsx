"use client";

import { use, useEffect, useState } from "react";
import { Icon } from "@/app/_components/Icon";
import { getPollById } from "@/app/actions/poll";
import { EXPIRED } from "@/app/utils/constants";
import { PollCountdown } from "./_components/PollCountdown";
import { PollResponseForm } from "./_components/PollResponseForm";
import { socket } from "../../../socket";

type Props = {
  params: Promise<{ id: string }>;
};

type Poll = NonNullable<Awaited<ReturnType<typeof getPollById>>>;

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="w-full py-6 flex justify-center items-center bg-background">
        <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <Icon name="ballot" filled />
          PollPrecision
        </div>
      </header>

      <main className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1280px] mx-auto flex flex-col items-center">
        {children}
      </main>

      <footer className="w-full py-8 px-margin-mobile md:px-margin-desktop mt-auto flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1280px] mx-auto border-t border-outline-variant">
        <div className="font-label-sm text-label-sm font-bold text-on-surface">
          © {new Date().getFullYear()} PollPrecision. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100"
            href="#"
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </>
  );
}

export default function PublicPollPage({ params }: Props) {
  const { id } = use(params);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  // Fetch the poll once per id. Runs in an effect (not during render) so it
  // fires a single request instead of looping on every re-render.
  useEffect(() => {
    let active = true;
    getPollById(id)
      .then((data) => {
        if (active) setPoll(data);
      })
      .catch(() => {
        if (active) setPoll(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Socket setup goes here — e.g. open the connection for `id`, listen for
  // live updates, and clean up on unmount:
  // useEffect(() => {
  //   const socket = io(...);
  //   socket.emit("poll:join", id);
  //   socket.on("poll:update", (payload) => { /* update state */ });
  //   return () => socket.disconnect();
  // }, [id]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  if (loading) {
    return (
      <Chrome>
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
          <Icon name="progress_activity" className="animate-spin text-[32px]" />
          <p className="font-body-md text-body-md mt-stack-md">Loading poll…</p>
        </div>
      </Chrome>
    );
  }

  if (!poll) {
    return (
      <Chrome>
        <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-stack-md">
            <Icon
              name="search_off"
              className="text-on-surface-variant text-[28px]"
            />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
            Poll not found
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
            This poll doesn’t exist or is no longer available.
          </p>
        </div>
      </Chrome>
    );
  }

  const expiresAt = poll.expiresAt ? new Date(poll.expiresAt) : null;
  const isClosed =
    poll.status === EXPIRED || (expiresAt !== null && expiresAt <= new Date());

  return (
    <Chrome>
      <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-stack-lg border-b border-outline-variant pb-8">
            <div>
              <p>status: {isConnected ? "connected" : "disconnected"}</p>
              <p>Transport: {transport}</p>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-2">
                {poll.title}
              </h1>
              {poll.description && (
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  {poll.description}
                </p>
              )}
            </div>
            {!isClosed && expiresAt && (
              <PollCountdown expiresAt={expiresAt.toISOString()} />
            )}
          </div>

          {isClosed ?
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-stack-md">
                <Icon
                  name="lock_clock"
                  className="text-on-error-container text-[28px]"
                />
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                This poll is closed
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
                The response window for this poll has ended. Thank you for your
                interest.
              </p>
            </div>
          : <PollResponseForm
              questions={poll.questions}
              authenticatedOnly={poll.authenticatedOnly}
            />
          }
        </div>
      </div>
    </Chrome>
  );
}
