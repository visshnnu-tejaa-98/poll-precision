"use client";

type Props = {
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function BuilderHeader({ onSaveDraft, onPublish }: Props) {
  return (
    <div className="flex justify-between items-end mb-stack-md">
      <div>
        <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-unit">
          Create New Poll
        </h2>
        <p className="font-body-md text-on-surface-variant">
          Design your poll and configure settings before publishing.
        </p>
      </div>
      <div className="hidden sm:flex gap-4">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-4 py-2 border border-outline text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors duration-150"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="px-6 py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors duration-150 shadow-md"
        >
          Publish Poll
        </button>
      </div>
    </div>
  );
}
