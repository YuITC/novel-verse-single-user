import { Shuba69Crawler } from "./69shuba";
import { UukanshuCrawler } from "./uukanshu";

async function testCrawler() {
  console.log("==========================================");
  console.log("--- Testing 69shuba Crawler (Novel ID: 79726) ---");
  console.log("==========================================");
  const shuba = new Shuba69Crawler();
  try {
    const shubaMeta = await shuba.getNovelMetadata("79726");
    console.log("[69shuba] Metadata:", shubaMeta);

    console.log("[69shuba] Starting to fetch first 5 chapters concurrently...");
    const shubaStream = shuba.crawlAndStream("79726");
    let shubaCount = 0;
    const startTime = Date.now();
    for await (const chapter of shubaStream) {
      console.log(
        `[69shuba -> Queue] Resolved Chapter: ${chapter.index} - ${chapter.title} | Length: ${chapter.content.length} chars`,
      );
      shubaCount++;
      if (shubaCount >= 5) {
        console.log(
          `[69shuba] Reached 5 chapters. Stopping. Time elapsed: ${Date.now() - startTime}ms`,
        );
        break;
      }
    }
  } finally {
    await shuba.closeBrowser();
  }

  console.log("\n==========================================");
  console.log("--- Testing Uukanshu Crawler (Novel ID: 26326) ---");
  console.log("==========================================");
  const uu = new UukanshuCrawler();
  try {
    const uuMeta = await uu.getNovelMetadata("26326");
    console.log("[Uukanshu] Metadata:", uuMeta);

    console.log(
      "[Uukanshu] Starting to fetch first 5 chapters concurrently...",
    );
    const uuStream = uu.crawlAndStream("26326");
    let uuCount = 0;
    const startTime = Date.now();
    for await (const chapter of uuStream) {
      console.log(
        `[Uukanshu -> Queue] Resolved Chapter: ${chapter.index} - ${chapter.title} | Length: ${chapter.content.length} chars`,
      );
      uuCount++;
      if (uuCount >= 5) {
        console.log(
          `[Uukanshu] Reached 5 chapters. Stopping. Time elapsed: ${Date.now() - startTime}ms`,
        );
        break;
      }
    }
  } finally {
    await uu.closeBrowser();
  }

  console.log("\nTesting completed successfully!");
}

testCrawler().catch(console.error);
