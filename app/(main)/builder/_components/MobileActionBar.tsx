"use client";

type Props = {
  publishing: boolean;
  savingDraft?: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function MobileActionBar({
  onSaveDraft,
  onPublish,
  publishing,
  savingDraft,
}: Props) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 md:left-64 right-0 z-30 flex flex-row gap-3 p-margin-mobile bg-surface/95 backdrop-blur-sm border-t border-outline-variant">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={savingDraft || publishing}
        className="flex-1 px-4 py-3 border border-outline text-on-surface font-label-sm text-label-sm rounded-lg hover:bg-surface-container-low transition-colors duration-150 disabled:opacity-60 disabled:pointer-events-none"
      >
        {savingDraft ? "Saving..." : "Save Draft"}
      </button>
      <button
        type="button"
        onClick={onPublish}
        className="flex-1 px-6 py-3 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary-container transition-colors duration-150 shadow-md"
      >
        {publishing ? "Publishing..." : "Publish Poll"}
      </button>
    </div>
  );
}
