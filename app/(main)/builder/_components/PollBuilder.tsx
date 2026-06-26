"use client";

import { useState } from "react";
import { AdvancedSettingsCard } from "./AdvancedSettingsCard";
import { BuilderHeader } from "./BuilderHeader";
import { GeneralInfoCard } from "./GeneralInfoCard";
import { MobileActionBar } from "./MobileActionBar";
import { PollSettingsCard } from "./PollSettingsCard";
import { PreviewPane } from "./PreviewPane";
import { BuilderActions } from "./BuilderActions";
import { QuestionsCard } from "./QuestionsCard";
import type { AdvancedSettings, PollSettings, Question } from "./types";
import { savePoll } from "@/app/actions/poll";
import { useRouter } from "next/navigation";
import { PollInputSchema } from "../zod.schema";
import { useToast } from "@/app/_components/Toast";
import type { ZodIssue } from "zod";

function formatIssue(issue: ZodIssue): string {
  const [root, qIndex, field, oIndex] = issue.path;
  if (root === "questions" && typeof qIndex === "number") {
    if (field === "options" && typeof oIndex === "number") {
      return `Question ${qIndex + 1}, Option ${oIndex + 1}: ${issue.message}`;
    }
    return `Question ${qIndex + 1}: ${issue.message}`;
  }
  return issue.message;
}

const INITIAL_SETTINGS: PollSettings = {
  anonymousResponses: true,
  authenticatedOnly: false,
  resultsVisibility: false,
  expiresAt: "",
};

const INITIAL_ADVANCED: AdvancedSettings = {
  allowResponseEditing: false,
  timerEnabled: false,
  timerMinutes: 10,
};

export function PollBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<PollSettings>(INITIAL_SETTINGS);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(INITIAL_ADVANCED);
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const handleSaveDraft = () => {
    console.log("save draft", {
      title,
      description,
      questions,
      settings,
      advanced,
    });
  };

  const handlePublish = async () => {
    if (publishing) return;

    const rawData = {
      title,
      description,
      questions,
      ...settings,
      ...advanced,
    };

    const result = PollInputSchema.safeParse(rawData);
    if (!result.success) {
      const messages = [...new Set(result.error.issues.map(formatIssue))];
      const heading =
        messages.length === 1 ?
          "Please fix the following:"
        : `Please fix the following ${messages.length} issues:`;
      const body = messages.map((msg) => `• ${msg}`).join("\n");
      notify(`${heading}\n${body}`, "error");
      return;
    }

    setPublishing(true);
    try {
      const pollId = await savePoll(rawData);
      if (pollId) {
        notify("Poll published successfully", "success");
        router.push("/dashboard");
      }
    } catch {
      notify(
        "Something went wrong while publishing. Please try again.",
        "error",
      );
      setPublishing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <div className="lg:col-span-12">
        <BuilderHeader />
      </div>

      <div className="lg:col-span-7 space-y-stack-lg pb-28 lg:pb-0">
        <GeneralInfoCard
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />
        <QuestionsCard questions={questions} onChange={setQuestions} />
        <PollSettingsCard settings={settings} onChange={setSettings} />
        <AdvancedSettingsCard advanced={advanced} onChange={setAdvanced} />
        <MobileActionBar
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>

      <div className="hidden lg:block lg:col-span-5">
        <div className="sticky top-stack-lg flex flex-col gap-stack-md h-[calc(100vh-120px)]">
          <PreviewPane
            title={title}
            description={description}
            questions={questions}
            authRequired={settings.authenticatedOnly}
          />
          <BuilderActions
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </div>
  );
}
