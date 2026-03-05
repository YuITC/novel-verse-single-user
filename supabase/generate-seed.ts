// Run:
// npx tsx supabase/generate-seed.ts

import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";

const SEED_SQL_PATH = path.join(__dirname, "seed.sql");

const NUM_NOVELS = 50;

const COLLECTIONS = [
  "My Favorites",
  "To Read Later",
  "Sci-Fi Masterpieces",
  "Action Packed",
  "Completed Epics",
];

// Helpers
const escapeSql = (str?: string | null) => {
  if (!str) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
};

const pgArray = (arr: string[]) => {
  if (!arr || arr.length === 0) return "'{}'";
  return `ARRAY[${arr.map(escapeSql).join(", ")}]`;
};

const uuid = () => faker.string.uuid();

// Data containers
const novels: any[] = [];
const chapters: any[] = [];
const collections: any[] = [];
const collectionNovels: any[] = [];
const libraryEntries: any[] = [];
const bookmarks: any[] = [];

// OpenRouter keys
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
];

// Create collections
for (const title of COLLECTIONS) {
  collections.push({
    id: uuid(),
    title,
  });
}

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
];

const statuses = ["ongoing", "completed", "cancelled"];
const readingStatuses = ["reading", "completed", "dropped", "read-later"];

// Generate novels + chapters
for (let i = 0; i < NUM_NOVELS; i++) {
  const novelId = uuid();

  const numChapters = faker.number.int({
    min: 10,
    max: 80,
  });

  const selectedGenres = faker.helpers.arrayElements(
    genresList,
    faker.number.int({ min: 1, max: 3 }),
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
    total_words: faker.number.int({ min: 10000, max: 3000000 }),
  });

  const novelChapters: any[] = [];

  for (let j = 1; j <= numChapters; j++) {
    const chapId = uuid();

    const isTranslated = faker.datatype.boolean({
      probability: 0.8,
    });

    const chapter = {
      id: chapId,
      novel_id: novelId,
      chapter_index: j,
      title_raw: `Chapter ${j}: ${faker.lorem.words(3)}`,
      title_translated: isTranslated
        ? `Chương ${j}: ${faker.lorem.words(3)}`
        : null,
      content_raw: faker.lorem.paragraphs(8),
      content_translated: isTranslated ? faker.lorem.paragraphs(8) : null,
      is_translated: isTranslated,
    };

    chapters.push(chapter);
    novelChapters.push(chapter);
  }

  // Library entry
  if (faker.datatype.boolean({ probability: 0.7 })) {
    const current = faker.helpers.arrayElement(novelChapters);

    libraryEntries.push({
      novel_id: novelId,
      current_chapter_id: current.id,
      reading_status: faker.helpers.arrayElement(readingStatuses),
    });
  }

  // Collection membership
  const numCollections = faker.number.int({ min: 0, max: 2 });

  const selectedCollections = faker.helpers.arrayElements(
    collections,
    numCollections,
  );

  for (const c of selectedCollections) {
    collectionNovels.push({
      collection_id: c.id,
      novel_id: novelId,
    });
  }

  // Bookmark
  if (faker.datatype.boolean({ probability: 0.2 })) {
    const chap = faker.helpers.arrayElement(novelChapters);

    bookmarks.push({
      novel_id: novelId,
      chapter_id: chap.id,
    });
  }
}

// Build SQL
let sql = `
-- AUTO GENERATED SEED

DO $$
DECLARE
  v_user_id uuid;
BEGIN

-- Ensure a dev user exists
SELECT id INTO v_user_id FROM auth.users LIMIT 1;

IF v_user_id IS NULL THEN
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'dev@local.test',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_user_id;
END IF;
`;

// OpenRouter keys
sql += `
INSERT INTO openrouter_keys (id, user_id, label, key_value, is_active)
VALUES
${openrouterKeys
  .map(
    (k) =>
      `('${k.id}', v_user_id, ${escapeSql(k.label)}, ${escapeSql(
        k.key_value,
      )}, ${k.is_active})`,
  )
  .join(",\n")};
`;

// Collections
sql += `
INSERT INTO collections (id, user_id, title)
VALUES
${collections
  .map((c) => `('${c.id}', v_user_id, ${escapeSql(c.title)})`)
  .join(",\n")};
`;

// Novels
sql += `
INSERT INTO novels (
  id,user_id,source_url,source_origin,title_raw,title_translated,
  author_raw,author_translated,cover_url,description_raw,
  description_translated,genres,publication_status,
  reading_status,total_chapters,total_words
)
VALUES
${novels
  .map(
    (n) => `(
'${n.id}',
v_user_id,
${escapeSql(n.source_url)},
${escapeSql(n.source_origin)},
${escapeSql(n.title_raw)},
${escapeSql(n.title_translated)},
${escapeSql(n.author_raw)},
${escapeSql(n.author_translated)},
${escapeSql(n.cover_url)},
${escapeSql(n.description_raw)},
${escapeSql(n.description_translated)},
${pgArray(n.genres)},
${escapeSql(n.publication_status)},
${escapeSql(n.reading_status)},
${n.total_chapters},
${n.total_words}
)`,
  )
  .join(",\n")};
`;

// Chapters
sql += `
INSERT INTO chapters (
id,novel_id,user_id,chapter_index,title_raw,title_translated,
content_raw,content_translated,is_translated
)
VALUES
${chapters
  .map(
    (c) => `(
'${c.id}',
'${c.novel_id}',
v_user_id,
${c.chapter_index},
${escapeSql(c.title_raw)},
${escapeSql(c.title_translated)},
${escapeSql(c.content_raw)},
${escapeSql(c.content_translated)},
${c.is_translated}
)`,
  )
  .join(",\n")};
`;

// Library
sql += `
INSERT INTO library_entries (
id,user_id,novel_id,current_chapter_id,reading_status
)
VALUES
${libraryEntries
  .map(
    (l) => `(
'${uuid()}',
v_user_id,
'${l.novel_id}',
'${l.current_chapter_id}',
${escapeSql(l.reading_status)}
)`,
  )
  .join(",\n")};
`;

// Collection novels
sql += `
INSERT INTO collection_novels (
collection_id,novel_id,user_id
)
VALUES
${collectionNovels
  .map(
    (c) => `(
'${c.collection_id}',
'${c.novel_id}',
v_user_id
)`,
  )
  .join(",\n")};
`;

// Bookmarks
sql += `
INSERT INTO bookmarks (
id,user_id,novel_id,chapter_id
)
VALUES
${bookmarks
  .map(
    (b) => `(
'${uuid()}',
v_user_id,
'${b.novel_id}',
'${b.chapter_id}'
)`,
  )
  .join(",\n")};
`;

sql += `
END $$;
`;

fs.writeFileSync(SEED_SQL_PATH, sql);

console.log("Seed SQL generated:", SEED_SQL_PATH);
