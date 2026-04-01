import { Client } from "@notionhq/client";
import { prisma } from "@/lib/prisma";

async function getNotionClient(): Promise<Client | null> {
  const config = await prisma.notionConfig.findFirst({
    where: { isActive: true },
  });
  if (!config) return null;
  return new Client({ auth: config.apiKey });
}

export async function syncChartToNotion(
  chartId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const chart = await prisma.chart.findUnique({
      where: { id: chartId },
      include: { customer: true },
    });

    if (!chart) {
      return { success: false, error: "Chart not found" };
    }

    const notion = await getNotionClient();
    if (!notion) {
      return { success: false, error: "Notion is not configured" };
    }

    const config = await prisma.notionConfig.findFirst({
      where: { isActive: true },
    });
    if (!config) {
      return { success: false, error: "Notion config not found" };
    }

    const customerName =
      chart.customer.lastName && chart.customer.firstName
        ? `${chart.customer.lastName} ${chart.customer.firstName}`
        : chart.customer.lastKana +
          (chart.customer.firstKana ? ` ${chart.customer.firstKana}` : "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {
      "顧客名": {
        title: [{ text: { content: customerName } }],
      },
      "施術日": {
        date: { start: chart.treatmentDate.toISOString().split("T")[0] },
      },
      "主訴・来院理由": {
        rich_text: [{ text: { content: chart.chiefComplaint || "" } }],
      },
      "身体の状態": {
        rich_text: [{ text: { content: chart.bodyCondition || "" } }],
      },
      "施術部位": {
        rich_text: [{ text: { content: chart.treatmentArea || "" } }],
      },
      "施術内容": {
        rich_text: [{ text: { content: chart.treatmentDetail || "" } }],
      },
      "痛みレベル": {
        rich_text: [{ text: { content: chart.painLevel || "" } }],
      },
      "姿勢・可動域": {
        rich_text: [{ text: { content: chart.mobilityNote || "" } }],
      },
      "ホームケア": {
        rich_text: [{ text: { content: chart.homeExercise || "" } }],
      },
      "施術者メモ": {
        rich_text: [{ text: { content: chart.staffMemo || "" } }],
      },
      "次回提案": {
        rich_text: [{ text: { content: chart.nextProposal || "" } }],
      },
    };

    if (chart.notionPageId) {
      await notion.pages.update({
        page_id: chart.notionPageId,
        properties,
      });
    } else {
      const page = await notion.pages.create({
        parent: { database_id: config.databaseId },
        properties,
      });

      await prisma.chart.update({
        where: { id: chartId },
        data: { notionPageId: page.id },
      });
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
