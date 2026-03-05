// npx tsx supabase/generate-seed.ts.
// npx supabase db reset

import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";

const SEED_SQL_PATH = path.join(__dirname, "seed.sql");

// USER_ID is fetched dynamically from auth.users in the SQL script
const NUM_NOVELS = 50;
const COLLECTIONS = [
  "My Favorites",
  "To Read Later",
  "Sci-Fi Masterpieces",
  "Action Packed",
  "Completed Epics",
];

// Helper to escape SQL strings
const escapeSql = (str: string | null | undefined) => {
  if (!str) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
};

// Helper to format an array for Postgres
const pgArray = (arr: string[]) => {
  if (!arr || arr.length === 0) return "'{}'";
  return `ARRAY[${arr.map(escapeSql).join(", ")}]`;
};

// Helper to generate UUIDs
const uuid = () => faker.string.uuid();

// Data arrays
const novels: any[] = [];
const chapters: any[] = [];
const libraryEntries: any[] = [];
const collections: any[] = [];
const collectionNovels: any[] = [];
const bookmarks: any[] = [];

// 1. Generate OpenRouter Keys
const openrouterKeys = [
  {
    id: uuid(),
    label: "Primary Key",
    key_value: faker.string.alphanumeric(32),
    is_active: true,
  },
  {
    id: uuid(),
    label: "Backup Key",
    key_value: faker.string.alphanumeric(32),
    is_active: false,
  },
  {
    id: uuid(),
    label: "Test Key",
    key_value: faker.string.alphanumeric(32),
    is_active: true,
  },
];

// 2. Generate Collections
for (const title of COLLECTIONS) {
  collections.push({ id: uuid(), title });
}

// 3. Generate Novels
const genresList = [
  "Xianxia",
  "Wuxia",
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Action",
  "Adventure",
  "Mystery",
  "Horror",
  "Slice of Life",
];
const statuses = ["ongoing", "completed", "cancelled"];
const readingStatuses = ["reading", "completed", "dropped", "read-later"];

for (let i = 0; i < NUM_NOVELS; i++) {
  const novelId = uuid();
  const numChapters = faker.number.int({ min: 10, max: 100 });
  const selectedGenres = faker.helpers.arrayElements(
    genresList,
    faker.number.int({ min: 1, max: 4 }),
  );

  novels.push({
    id: novelId,
    source_url: faker.internet.url(),
    source_origin: faker.internet.url(),
    title_raw: faker.book.title(),
    title_translated: faker.book.title(),
    author_raw: faker.person.fullName(),
    author_translated: faker.person.fullName(),
    cover_url: `https://picsum.photos/seed/${novelId}/400/600`,
    description_raw: faker.lorem.paragraphs(2),
    description_translated: faker.lorem.paragraphs(2),
    genres: selectedGenres,
    publication_status: faker.helpers.arrayElement(statuses),
    reading_status: faker.helpers.arrayElement(readingStatuses),
    total_chapters: numChapters,
    total_words: faker.number.int({ min: 10000, max: 5000000 }),
  });

  // Generate chapters for this novel
  const novelChapters = [];
  for (let j = 1; j <= numChapters; j++) {
    const chapId = uuid();
    const isTranslated = faker.datatype.boolean({ probability: 0.8 });

    const chapter = {
      id: chapId,
      novel_id: novelId,
      chapter_index: j,
      title_raw: `Chapter ${j}: ${faker.lorem.words(3)}`,
      title_translated: isTranslated
        ? `Chương ${j}: ${faker.lorem.words(3)}`
        : null,
      content_raw: faker.lorem.paragraphs(10),
      content_translated: isTranslated ? faker.lorem.paragraphs(10) : null,
      is_translated: isTranslated,
    };
    chapters.push(chapter);
    novelChapters.push(chapter);
  }

  // Generate Library Entry (70% chance)
  if (faker.datatype.boolean({ probability: 0.7 })) {
    const currentChapter = faker.helpers.arrayElement(novelChapters);
    libraryEntries.push({
      novel_id: novelId,
      current_chapter_id: currentChapter ? currentChapter.id : null,
      reading_status: faker.helpers.arrayElement(readingStatuses),
    });
  }

  // Add to collections (randomly)
  const numCollectionsForNovel = faker.number.int({ min: 0, max: 2 });
  if (numCollectionsForNovel > 0) {
    const selectedCollections = faker.helpers.arrayElements(
      collections,
      numCollectionsForNovel,
    );
    for (const c of selectedCollections) {
      collectionNovels.push({ collection_id: c.id, novel_id: novelId });
    }
  }

  // Generate Bookmarks (10% chance per novel, random chapter)
  if (
    faker.datatype.boolean({ probability: 0.1 }) &&
    novelChapters.length > 0
  ) {
    const targetChap = faker.helpers.arrayElement(novelChapters);
    bookmarks.push({ novel_id: novelId, chapter_id: targetChap.id });
  }
}

// 4. Construct SQL String
let sql = `
-- =============================================================================
-- AUTO-GENERATED SEED DATA
-- Generated at: ${new Date().toISOString()}
-- =============================================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Get the first user in the database
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users. Please create a user first via Supabase Local Dashboard.';
  END IF;

  -- =============================================================================
  -- OPENROUTER KEYS
  -- =============================================================================
`;

if (openrouterKeys.length > 0) {
  sql += `  INSERT INTO public.openrouter_keys (id, user_id, label, key_value, is_active) VALUES\n`;
  sql += openrouterKeys
    .map(
      (k) =>
        `    ('${k.id}', v_user_id, ${escapeSql(k.label)}, ${escapeSql(k.key_value)}, ${k.is_active})`,
    )
    .join(",\n");
  sql += `\n  ON CONFLICT DO NOTHING;\n\n`;
}

// Helper to chunk arrays for batch INSERTs
function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

sql += `  -- =============================================================================\n`;
sql += `  -- NOVELS\n`;
sql += `  -- =============================================================================\n`;
const novelChunks = chunkArray(novels, 100);
for (const chunk of novelChunks) {
  sql += `  INSERT INTO public.novels (id, user_id, source_url, source_origin, title_raw, title_translated, author_raw, author_translated, cover_url, description_raw, description_translated, genres, publication_status, reading_status, total_chapters, total_words)\n  VALUES\n`;
  sql += chunk
    .map(
      (n) =>
        `    ('${n.id}', v_user_id, ${escapeSql(n.source_url)}, ${escapeSql(n.source_origin)}, ${escapeSql(n.title_raw)}, ${escapeSql(n.title_translated)}, ${escapeSql(n.author_raw)}, ${escapeSql(n.author_translated)}, ${escapeSql(n.cover_url)}, ${escapeSql(n.description_raw)}, ${escapeSql(n.description_translated)}, ${pgArray(n.genres)}, ${escapeSql(n.publication_status)}, ${escapeSql(n.reading_status)}, ${n.total_chapters}, ${n.total_words})`,
    )
    .join(",\n");
  sql += `\n  ON CONFLICT (id) DO NOTHING;\n\n`;
}

sql += `  -- =============================================================================\n`;
sql += `  -- CHAPTERS\n`;
sql += `  -- =============================================================================\n`;
const chapterChunks = chunkArray(chapters, 100);
for (const chunk of chapterChunks) {
  sql += `  INSERT INTO public.chapters (id, novel_id, user_id, chapter_index, title_raw, title_translated, content_raw, content_translated, is_translated)\n  VALUES\n`;
  sql += chunk
    .map(
      (c) =>
        `    ('${c.id}', '${c.novel_id}', v_user_id, ${c.chapter_index}, ${escapeSql(c.title_raw)}, ${escapeSql(c.title_translated)}, ${escapeSql(c.content_raw)}, ${escapeSql(c.content_translated)}, ${c.is_translated})`,
    )
    .join(",\n");
  sql += `\n  ON CONFLICT (id) DO NOTHING;\n\n`;
}

sql += `  -- =============================================================================\n`;
sql += `  -- LIBRARY\n`;
sql += `  -- =============================================================================\n`;
const libChunks = chunkArray(libraryEntries, 100);
for (const chunk of libChunks) {
  sql += `  INSERT INTO public.library_entries (user_id, novel_id, current_chapter_id, reading_status)\n  VALUES\n`;
  sql += chunk
    .map(
      (l) =>
        `    (v_user_id, '${l.novel_id}', ${l.current_chapter_id ? `'${l.current_chapter_id}'` : "NULL"}, ${escapeSql(l.reading_status)})`,
    )
    .join(",\n");
  sql += `\n  ON CONFLICT (user_id, novel_id) DO NOTHING;\n\n`;
}

sql += `  -- =============================================================================\n`;
sql += `  -- COLLECTIONS\n`;
sql += `  -- =============================================================================\n`;
if (collections.length > 0) {
  sql += `  INSERT INTO public.collections (id, user_id, title)\n  VALUES\n`;
  sql += collections
    .map((c) => `    ('${c.id}', v_user_id, ${escapeSql(c.title)})`)
    .join(",\n");
  sql += `\n  ON CONFLICT (id) DO NOTHING;\n\n`;
}

if (collectionNovels.length > 0) {
  const collNovelChunks = chunkArray(collectionNovels, 100);
  for (const chunk of collNovelChunks) {
    sql += `  INSERT INTO public.collection_novels (collection_id, novel_id, user_id)\n  VALUES\n`;
    sql += chunk
      .map((cn) => `    ('${cn.collection_id}', '${cn.novel_id}', v_user_id)`)
      .join(",\n");
    sql += `\n  ON CONFLICT (collection_id, novel_id) DO NOTHING;\n\n`;
  }
}

sql += `  -- =============================================================================\n`;
sql += `  -- BOOKMARKS\n`;
sql += `  -- =============================================================================\n`;
if (bookmarks.length > 0) {
  const bookmarkChunks = chunkArray(bookmarks, 100);
  for (const chunk of bookmarkChunks) {
    sql += `  INSERT INTO public.bookmarks (user_id, novel_id, chapter_id)\n  VALUES\n`;
    sql += chunk
      .map((b) => `    (v_user_id, '${b.novel_id}', '${b.chapter_id}')`)
      .join(",\n");
    sql += `\n  ON CONFLICT (user_id, novel_id, chapter_id) DO NOTHING;\n\n`;
  }
}

sql += `END $$;\n`;

fs.writeFileSync(SEED_SQL_PATH, sql, "utf-8");
console.log(
  `Successfully generated seed.sql with ${novels.length} novels, ${chapters.length} chapters, ${libraryEntries.length} library entries, ${collections.length} collections, and ${bookmarks.length} bookmarks.`,
);
