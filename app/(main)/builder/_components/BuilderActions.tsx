"use client";

type Props = {
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function BuilderActions({ onSaveDraft, onPublish }: Props) {
  return (
    <div className="shrink-0 flex gap-3">
      <button
        type="button"
        onClick={onSaveDraft}
        className="flex-1 px-4 py-2.5 border border-outline text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors duration-150"
      >
        Save Draft
      </button>
      <button
        type="button"
        onClick={onPublish}
        className="flex-1 px-6 py-2.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors duration-150 shadow-md"
      >
        Publish Poll
      </button>
    </div>
  );
}
