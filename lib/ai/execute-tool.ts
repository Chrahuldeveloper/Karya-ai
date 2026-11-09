import type { SupabaseClient } from "@supabase/supabase-js";

const today = () => new Date().toISOString().slice(0, 10);
const list = (value: any) => (Array.isArray(value) ? value : []);

async function getUsers(supabase: SupabaseClient, companyId: number) {
    const { data, error } = await supabase
        .from("users")
        .select("user_id, full_name, role, work, reports, projects")
        .eq("company_id", companyId);

    if (error) throw new Error("Could not fetch data.");
    return data;
}

function getTasks(users: any[]) {
    return users.flatMap((u) =>
        list(u.work).map((task: any) => ({ ...task, employee: u.full_name }))
    );
}

export async function executeTool(
    name: string,
    supabase: SupabaseClient,
    companyId: number
) {
    switch (name) {
        case "get_employees": {
            const { data, error } = await supabase
                .from("users")
                .select("user_id, full_name, role")
                .eq("company_id", companyId);

            if (error) throw new Error("Could not fetch employees.");

            return {
                total: data.length,
                employees: data,
            };
        }

        case "summarize_today_progress": {
            const users = await getUsers(supabase, companyId);
            const tasks = getTasks(users);

            const reports = users.flatMap((u) =>
                list(u.reports)
                    .filter((r: any) => r.date === today())
                    .map((r: any) => ({ employee: u.full_name, summary: r.summary }))
            );

            return {
                date: today(),
                total_employees: users.length,
                reports_submitted: reports.length,
                tasks: {
                    done: tasks.filter((t) => t.status === "done").length,
                    in_progress: tasks.filter((t) => t.status === "in_progress").length,
                    blocked: tasks.filter((t) => t.status === "blocked").length,
                    todo: tasks.filter((t) => t.status === "todo").length,
                },
                reports,
            };
        }

        case "get_missing_reports": {
            const users = await getUsers(supabase, companyId);

            const missing = users
                .filter(
                    (u) => !list(u.reports).some((r: any) => r.date === today())
                )
                .map((u) => ({
                    user_id: u.user_id,
                    full_name: u.full_name,
                    role: u.role,
                }));

            return {
                date: today(),
                total_missing: missing.length,
                employees: missing,
            };
        }

        case "get_blocked_tasks": {
            const users = await getUsers(supabase, companyId);

            const blocked = getTasks(users)
                .filter((t) => t.status === "blocked")
                .map((t) => ({
                    employee: t.employee,
                    task: t.title,
                    project: t.project,
                    reason: t.blocked_reason,
                }));

            return {
                total: blocked.length,
                tasks: blocked,
            };
        }

        case "get_at_risk_projects": {
            const users = await getUsers(supabase, companyId);
            const tasks = getTasks(users);

            const projects = new Map<string, any>();
            users.forEach((u) =>
                list(u.projects).forEach((p: any) => projects.set(p.name, p))
            );

            const atRisk = [...projects.values()]
                .map((p) => {
                    const reasons: string[] = [];

                    const blockedCount = tasks.filter(
                        (t) => t.project === p.name && t.status === "blocked"
                    ).length;

                    if (p.status === "at_risk") reasons.push("Marked as at risk");
                    if (p.deadline && p.deadline < today() && p.status !== "done")
                        reasons.push("Past its deadline");
                    if (blockedCount > 0)
                        reasons.push(`${blockedCount} blocked task(s)`);

                    return { project: p.name, deadline: p.deadline, reasons };
                })
                .filter((p) => p.reasons.length > 0);

            return {
                total: atRisk.length,
                projects: atRisk,
            };
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}