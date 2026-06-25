"use client";

type Props = {
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function MobileActionBar({ onSaveDraft, onPublish }: Props) {
  return (
    <div className="sm:hidden flex flex-col gap-2 pt-stack-md pb-margin-mobile">
      <button
        type="button"
        onClick={onPublish}
        className="w-full px-6 py-3 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors duration-150 shadow-md"
      >
        Publish Poll
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        className="w-full px-4 py-3 border border-outline text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors duration-150"
      >
        Save Draft
      </button>
    </div>
  );
}
