interface Props {
  onPublish: () => void;
  isPublishing: boolean;
  disabled?: boolean;
}

export function ActionBar({ onPublish, isPublishing, disabled }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="max-w-[800px] mx-auto flex justify-end items-center gap-4">
        <button
          onClick={onPublish}
          disabled={disabled || isPublishing}
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
          Publish Story
        </button>
      </div>
    </div>
  );
}
