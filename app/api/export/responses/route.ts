import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET(request: Request) {
  const clerk = await currentUser();
  const email = clerk?.emailAddresses[0]?.emailAddress;
  const user = email
    ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
    : null;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const pollId = new URL(request.url).searchParams.get("pollId") ?? undefined;

  const responses = await prisma.response.findMany({
    where: { poll: { creatorId: user.id }, ...(pollId ? { pollId } : {}) },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      isAnonymous: true,
      respondentId: true,
      submittedAt: true,
      poll: { select: { title: true } },
      answers: {
        select: {
          question: { select: { title: true } },
          option: { select: { text: true } },
        },
      },
    },
  });

  const ids = [
    ...new Set(
      responses
        .map((r) => r.respondentId)
        .filter((v): v is string => Boolean(v)),
    ),
  ];
  const users = ids.length
    ? await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, firstName: true, lastName: true, email: true },
      })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  const rows: string[][] = [
    [
      "Poll",
      "Response ID",
      "Respondent",
      "Email",
      "Anonymous",
      "Submitted At",
      "Question",
      "Answer",
    ],
  ];

  for (const r of responses) {
    const u = r.respondentId ? userById.get(r.respondentId) : undefined;
    const respondent =
      r.isAnonymous || !u
        ? "Anonymous"
        : `${u.firstName} ${u.lastName}`.trim() || u.email;
    const base = [
      r.poll.title,
      r.id,
      respondent,
      u?.email ?? "",
      String(r.isAnonymous),
      r.submittedAt.toISOString(),
    ];
    if (r.answers.length === 0) {
      rows.push([...base, "", ""]);
    } else {
      for (const a of r.answers) {
        rows.push([...base, a.question.title, a.option.text]);
      }
    }
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const filename = `responses${pollId ? `-${pollId}` : ""}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
