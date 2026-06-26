"use client";

import { useState } from "react";
import { AdvancedSettingsCard } from "./AdvancedSettingsCard";
import { BuilderHeader } from "./BuilderHeader";
import { GeneralInfoCard } from "./GeneralInfoCard";
import { MobileActionBar } from "./MobileActionBar";
import { PollSettingsCard } from "./PollSettingsCard";
import { PreviewPane } from "./PreviewPane";
import { QuestionsCard } from "./QuestionsCard";
import type { AdvancedSettings, PollSettings, Question } from "./types";
import { savePoll } from "@/app/actions/poll";
import { useRouter } from "next/navigation";

const INITIAL_SETTINGS: PollSettings = {
  anonymousResponses: false,
  authenticatedOnly: true,
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
  const router = useRouter();

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
    const rawData = {
      title,
      description,
      questions,
      ...settings,
      ...advanced,
    };
    const pollId = await savePoll(rawData);
    if (pollId) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <div className="lg:col-span-12">
        <BuilderHeader
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>

      <div className="lg:col-span-7 space-y-stack-lg">
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
        <PreviewPane
          title={title}
          description={description}
          questions={questions}
          authRequired={settings.authenticatedOnly}
        />
      </div>
    </div>
  );
}
