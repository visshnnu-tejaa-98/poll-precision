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

const SEED_QUESTIONS: Question[] = [
  {
    id: "seed-q1",
    title: "Which department do you work in?",
    type: "single",
    required: true,
    options: [
      { id: "seed-q1-o1", text: "Engineering" },
      { id: "seed-q1-o2", text: "Marketing" },
    ],
  },
  {
    id: "seed-q2",
    title: "How satisfied are you with the current office culture?",
    type: "single",
    required: false,
    options: [
      { id: "seed-q2-o1", text: "Extremely Satisfied" },
      { id: "seed-q2-o2", text: "Somewhat Satisfied" },
      { id: "seed-q2-o3", text: "Neutral" },
    ],
  },
];

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
  const [title, setTitle] = useState("Q3 Employee Satisfaction Survey");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>(SEED_QUESTIONS);
  const [settings, setSettings] = useState<PollSettings>(INITIAL_SETTINGS);
  const [advanced, setAdvanced] =
    useState<AdvancedSettings>(INITIAL_ADVANCED);

  const handleSaveDraft = () => {
    console.log("save draft", {
      title,
      description,
      questions,
      settings,
      advanced,
    });
  };

  const handlePublish = () => {
    console.log("publish poll", {
      title,
      description,
      questions,
      settings,
      advanced,
    });
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
