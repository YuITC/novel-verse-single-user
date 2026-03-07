import React from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/libraryApi";
import { CollectionData } from "../types/library";

const CollectionCard: React.FC<{ collection: CollectionData }> = ({
  collection,
}) => {
  const router = useRouter();
  const covers = collection.cover_previews.slice(0, 3);

  return (
    <div
      onClick={() => router.push(`/library/collection/${collection.id}`)}
      className="relative flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer items-center text-center"
    >
      {/* Cover Fan Stack */}
      <div className="relative w-full h-44 flex items-end justify-center mb-6">
        {covers.length === 0 ? (
          <div className="w-24 aspect-[2/3] rounded-lg bg-slate-100 border-2 border-white shadow-md flex items-center justify-center z-20">
            <span className="material-symbols-outlined text-slate-300 text-3xl">
              auto_awesome_mosaic
            </span>
          </div>
        ) : (
          <>
            {covers[1] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={covers[1]}
                alt="cover background left"
                className="absolute -translate-x-10 scale-90 opacity-60 w-20 aspect-[2/3] rounded-lg object-cover z-10 bottom-0"
              />
            )}
            {covers[2] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={covers[2]}
                alt="cover background right"
                className="absolute translate-x-10 scale-90 opacity-60 w-20 aspect-[2/3] rounded-lg object-cover z-10 bottom-0"
              />
            )}
            {covers[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={covers[0]}
                alt="cover active"
                className="relative w-24 aspect-[2/3] rounded-lg border-2 border-white shadow-md object-cover z-20 bottom-0"
              />
            )}
          </>
        )}
      </div>

      <h3 className="text-[17px] font-bold text-slate-900 truncate w-full group-hover:text-primary transition-colors">
        {collection.title}
      </h3>
      <p className="text-sm font-medium text-slate-500 mt-1">
        {collection.novel_count}{" "}
        {collection.novel_count === 1 ? "story" : "stories"}
      </p>
    </div>
  );
};

interface CollectionCardGridProps {
  onCreateCollection?: () => void;
}

export const CollectionCardGrid: React.FC<CollectionCardGridProps> = ({
  onCreateCollection,
}) => {
  const { data: collections } = useSuspenseQuery({
    queryKey: ["collections"],
    queryFn: () => libraryApi.getCollections(),
  });

  if (!collections || collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
          collections_bookmark
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No collections created
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Create your first collection to organize your novels exactly how you
          like them.
        </p>
        <button
          onClick={onCreateCollection}
          className="px-6 py-2 rounded-full border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          + Create Collection
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {collections.map((col) => (
        <CollectionCard key={col.id} collection={col} />
      ))}
    </div>
  );
};
