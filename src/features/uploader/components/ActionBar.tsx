interface Props {
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  disabled?: boolean;
}

export function ActionBar({
  onSave,
  onPublish,
  isSaving,
  isPublishing,
  disabled,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="max-w-[800px] mx-auto flex justify-end items-center gap-4">
        <button
          onClick={onSave}
          disabled={disabled || isSaving || isPublishing}
          className="h-11 px-6 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-transparent hover:border-slate-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">
              autorenew
            </span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">save</span>
          )}
          Save Draft
        </button>
        <button
          onClick={onPublish}
          disabled={disabled || isSaving || isPublishing}
          className="h-11 px-8 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">
              autorenew
            </span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">
              rocket_launch
            </span>
          )}
          Publish Chapter
        </button>
      </div>
    </div>
  );
}
