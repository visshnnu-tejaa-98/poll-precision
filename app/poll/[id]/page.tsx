"use client";

import { use, useEffect, useRef, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Icon } from "@/app/_components/Icon";
import { getPollById, getPublicPollResults } from "@/app/actions/poll";
import { hasRespondedToPoll } from "@/app/actions/response";
import { getEffectiveStatus } from "@/app/utils/poll-status";
import { PollCountdown } from "./_components/PollCountdown";
import { PollResponseForm } from "./_components/PollResponseForm";
import { PollResults } from "./_components/PollResults";

type Props = {
  params: Promise<{ id: string }>;
};

type Poll = NonNullable<Awaited<ReturnType<typeof getPollById>>>;
type Results = NonNullable<Awaited<ReturnType<typeof getPublicPollResults>>>;

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
  const { isSignedIn, isLoaded } = useUser();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Results | null>(null);
  const resultsRequested = useRef(false);

  // Fetch the poll once per id (in an effect, not during render).
  useEffect(() => {
    let active = true;
    getPollById(id)
      .then((data) => active && setPoll(data))
      .catch(() => active && setPoll(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // If results can be shown, check whether this signed-in user already responded.
  useEffect(() => {
    if (!poll?.resultsVisibility || !isSignedIn) return;
    let active = true;
    hasRespondedToPoll(id).then((res) => active && setAlreadyResponded(res));
    return () => {
      active = false;
    };
  }, [poll?.resultsVisibility, isSignedIn, id]);

  const isClosed = poll
    ? getEffectiveStatus(poll.status, poll.expiresAt) === "expired"
    : false;
  const canSeeResults = Boolean(
    poll?.resultsVisibility && (alreadyResponded || justSubmitted || isClosed),
  );

  // Load results when they should be shown (once).
  useEffect(() => {
    if (!canSeeResults || results || resultsRequested.current) return;
    resultsRequested.current = true;
    let active = true;
    getPublicPollResults(id)
      .then((res) => active && setResults(res))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [canSeeResults, results, id]);

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
            <Icon name="search_off" className="text-on-surface-variant text-[28px]" />
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
  const mustAuthenticate = poll.authenticatedOnly || !poll.allowAnonymous;
  const needsSignIn = mustAuthenticate && isLoaded && !isSignedIn;

  const renderBody = () => {
    if (canSeeResults) {
      if (!results) {
        return (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <Icon name="progress_activity" className="animate-spin text-[28px]" />
            <p className="font-body-md text-body-md mt-stack-md">
              Loading results…
            </p>
          </div>
        );
      }
      return (
        <>
          {justSubmitted && (
            <div className="mb-8 flex items-center gap-2 rounded-lg bg-tertiary-container/40 text-on-tertiary-container px-4 py-3 font-label-sm text-label-sm">
              <Icon name="check_circle" filled className="text-[20px]" />
              Thanks! Your response was recorded. Here are the live results.
            </div>
          )}
          <PollResults
            totalResponses={results.totalResponses}
            questions={results.questions}
            myAnswers={justSubmitted ? myAnswers : undefined}
          />
        </>
      );
    }

    if (isClosed) {
      return (
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-stack-md">
            <Icon name="lock_clock" className="text-on-error-container text-[28px]" />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
            This poll is closed
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
            The response window for this poll has ended. Thank you for your
            interest.
          </p>
        </div>
      );
    }

    if (needsSignIn) {
      return (
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-stack-md">
            <Icon name="lock" className="text-on-surface-variant text-[28px]" />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
            Sign in to respond
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px] mb-stack-md">
            This poll only accepts responses from authenticated users.
          </p>
          <SignInButton
            mode="modal"
            forceRedirectUrl={`/poll/${id}`}
            signUpForceRedirectUrl={`/poll/${id}`}
          >
            <button
              type="button"
              className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center gap-2"
            >
              <Icon name="login" className="text-[18px]" />
              Sign in
            </button>
          </SignInButton>
        </div>
      );
    }

    return (
      <PollResponseForm
        pollId={poll.id}
        questions={poll.questions}
        authenticatedOnly={poll.authenticatedOnly}
        responseTimer={poll.responseTimer}
        timerMinutes={poll.timerInMinutes}
        onSubmitted={
          poll.resultsVisibility
            ? (answers) => {
                setMyAnswers(answers);
                setJustSubmitted(true);
              }
            : undefined
        }
      />
    );
  };

  return (
    <Chrome>
      <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-stack-lg border-b border-outline-variant pb-8">
            <div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-2">
                {poll.title}
              </h1>
              {poll.description && (
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  {poll.description}
                </p>
              )}
            </div>
            {!isClosed && !canSeeResults && expiresAt && (
              <PollCountdown expiresAt={expiresAt.toISOString()} />
            )}
          </div>

          {renderBody()}
        </div>
      </div>
    </Chrome>
  );
}
